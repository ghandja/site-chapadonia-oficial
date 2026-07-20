import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import argon2 from "argon2";
import cookieParser from "cookie-parser";

import { logger, createAuditLog } from "./src/lib/logger";
import { spriteCache } from "./src/lib/cache";
import { csrfMiddleware } from "./src/lib/csrf";
import { runMigrations } from "./src/lib/migrations";
import { hooks } from "./src/lib/hooks";
import { loginSchema, registerSchema, createCharacterSchema, houseBidSchema, adminConfigSchema } from "./src/lib/validate";

declare global {
  namespace Express {
    interface Request {
      accId?: number;
    }
  }
}

dotenv.config();

const DB_FILE = path.join(__dirname, "database.json");

function auditLog(message: string, ...args: any[]) {
  let formatted = message;
  for (const arg of args) {
    formatted = formatted.replace("{}", String(arg));
  }
  logger.info({ audit: true }, formatted);
  // Persist to audit_log table (fire & forget)
  if (pool) {
    pool.query(
      "INSERT INTO audit_log (action, details) VALUES (?, ?)",
      [formatted.substring(0, 200), JSON.stringify({ args })]
    ).catch(() => {});
  }
}

// Crypto and Token helpers
// Argon2 parameters must match config.lua: memoryConst=1<<16, temporaryConst=2, parallelism=2
const ARGON2_OPTS: argon2.HashOptions = { type: argon2.argon2id, memoryCost: 65536, timeCost: 2, parallelism: 2, hashLength: 32 };

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTS);
}

function hashPasswordSync(password: string): string {
  // Synchronous hashing for development/seed only. Production always uses async hashPassword (argon2).
  // SHA1 is used here to support game server's fallback when argon2 is not configured.
  return crypto.createHash("sha1").update(password).digest("hex").toLowerCase();
}

async function verifyPassword(inputPlain: string, storedHash: string): Promise<boolean> {
  if (!inputPlain || !storedHash) return false;
  // Argon2 (primary, matches game server)
  if (storedHash.startsWith("$argon2")) {
    try {
      return await argon2.verify(storedHash, inputPlain);
    } catch {
      return false;
    }
  }
  // bcrypt (temporary migration period)
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$")) {
    return bcrypt.compare(inputPlain, storedHash);
  }
  // Legacy SHA1 fallback (compatible with game server)
  const cleanStored = storedHash.trim().toLowerCase();
  const hashSha1 = crypto.createHash("sha1").update(inputPlain).digest("hex");
  if (cleanStored === hashSha1) return true;
  const hashSha1Trimmed = crypto.createHash("sha1").update(inputPlain.trim()).digest("hex");
  if (cleanStored === hashSha1Trimmed) return true;
  const hashSha256 = crypto.createHash("sha256").update(inputPlain).digest("hex");
  if (cleanStored === hashSha256) return true;
  return false;
}

let JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  // Persist generated secret using project root (process.cwd() = www/)
  const secretFile = path.join(process.cwd(), ".jwt_secret");
  if (fs.existsSync(secretFile)) {
    JWT_SECRET = fs.readFileSync(secretFile, "utf-8").trim();
  } else {
    JWT_SECRET = crypto.randomBytes(32).toString("hex");
    try { fs.writeFileSync(secretFile, JWT_SECRET, "utf-8"); } catch (e) { console.error("Could not persist JWT secret:", e); }
  }
}
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "ghandja1@gmail.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "waenbxe2";

interface TokenPayload {
  accountId: number;
}

function generateToken(accountId: number): string {
  return jwt.sign({ accountId } satisfies TokenPayload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded.accountId;
  } catch {
    return null;
  }
}

// MySQL pool setup
let pool: mysql.Pool | null = null;

if (process.env.DB_HOST) {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    logger.info({ host: process.env.DB_HOST }, "MySQL connection pool created");
  } catch (err) {
    logger.error({ err }, "Failed to create MySQL pool");
    pool = null;
  }
} else {
  logger.warn("No DB_HOST env. Falling back to JSON storage.");
}

// Transaction helper for financial operations
async function withTransaction<T>(fn: (conn: mysql.PoolConnection) => Promise<T>): Promise<T | null> {
  if (!pool) return null;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    logger.error({ err }, "Transaction failed, rolled back");
    throw err;
  } finally {
    conn.release();
  }
}

// MySQL account helpers (source of truth for game-compatible accounts)
async function findAccountByEmail(email: string) {
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM accounts WHERE email = ?", [email.toLowerCase()]);
      if ((rows as any[]).length > 0) {
        const row = (rows as any[])[0];
        return { id: row.id, email: row.email, password: row.password, coins: row.coins || 0, name: row.name, type: row.type };
      }
    } catch (err) {
      logger.error({ err }, "MySQL findAccountByEmail");
    }
  }
  // Fallback to JSON
  const db = await getDBState();
  return db.accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
}

async function createAccountInMySQL(email: string, passwordHash: string, name: string, type: number = 1) {
  if (pool) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const [result] = await pool.query(
        "INSERT INTO accounts (name, email, password, type, creation, premdays, lastday, coins) VALUES (?, ?, ?, ?, ?, 65535, 0, 1250)",
        [name, email.toLowerCase(), passwordHash, type, now]
      );
      return (result as any).insertId;
    } catch (err) {
      logger.error({ err }, "MySQL createAccount");
    }
  }
  return null;
}

async function updateAccountPasswordInMySQL(accountId: number, newHash: string) {
  if (pool) {
    try {
      await pool.query("UPDATE accounts SET password = ? WHERE id = ?", [newHash, accountId]);
    } catch (err) {
      console.error("MySQL updatePassword error:", err);
    }
  }
}

// MySQL player helpers
const PLAYER_SELECT = `id, name, level, vocation, experience, town_id, sex, onlinetime, balance, health, healthmax, mana, manamax, maglevel, skill_sword, skill_axe, skill_club, skill_dist, skill_shielding, skill_fist, skill_fishing, account_id, looktype`;

function rowToPlayer(row: any): Player {
  return {
    id: row.id, name: row.name, level: row.level, vocation: row.vocation,
    experience: row.experience, town_id: row.town_id, sex: row.sex,
    onlinetime: row.onlinetime, balance: row.balance,
    health: row.health, healthmax: row.healthmax, mana: row.mana, manamax: row.manamax,
    maglevel: row.maglevel, skill_sword: row.skill_sword, skill_axe: row.skill_axe,
    skill_club: row.skill_club, skill_dist: row.skill_dist, skill_shielding: row.skill_shielding,
    skill_fist: row.skill_fist, skill_fishing: row.skill_fishing,
    account_id: row.account_id, online: false, deaths: [], looktype: row.looktype,
  };
}

async function findPlayersByAccount(accountId: number): Promise<Player[]> {
  if (!pool) return [];
  try {
    const [rows] = await pool.query(`SELECT ${PLAYER_SELECT} FROM players WHERE account_id = ? AND deletion = 0`, [accountId]);
    return (rows as any[]).map(rowToPlayer);
  } catch (err) { console.error("MySQL findPlayersByAccount:", err); return []; }
}

async function findAllPlayersMySQL(): Promise<Player[]> {
  if (!pool) return [];
  try {
    const [rows] = await pool.query(`SELECT ${PLAYER_SELECT} FROM players WHERE deletion = 0 ORDER BY level DESC`);
    return (rows as any[]).map(rowToPlayer);
  } catch (err) { console.error("MySQL findAllPlayers:", err); return []; }
}

async function findPlayerByNameMySQL(name: string): Promise<Player | null> {
  if (!pool) return null;
  try {
    const [rows] = await pool.query(`SELECT ${PLAYER_SELECT} FROM players WHERE name = ? AND deletion = 0`, [name]);
    if ((rows as any[]).length > 0) return rowToPlayer((rows as any[])[0]);
    return null;
  } catch (err) { console.error("MySQL findPlayerByName:", err); return null; }
}

async function countPlayersMySQL(): Promise<number> {
  if (!pool) return 0;
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as cnt FROM players WHERE deletion = 0");
    return (rows as any[])[0]?.cnt || 0;
  } catch (err) { console.error("MySQL countPlayers:", err); return 0; }
}

async function countAccountsMySQL(): Promise<number> {
  if (!pool) return 0;
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as cnt FROM accounts");
    return (rows as any[])[0]?.cnt || 0;
  } catch (err) { console.error("MySQL countAccounts:", err); return 0; }
}

// =========== MySQL: News ===========
async function getNewsMySQL(): Promise<any[]> {
  if (!pool) return [];
  try { const [rows] = await pool.query("SELECT * FROM news ORDER BY id DESC"); return rows as any[]; }
  catch { return []; }
}
async function createNewsMySQL(title: string, category: string, content: string, bullets: string[], author: string): Promise<number> {
  if (!pool) return 0;
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const [r] = await pool.query("INSERT INTO news (title, category, content, bullets, date, author) VALUES (?,?,?,?,?,?)", [title, category, content, JSON.stringify(bullets || []), date, author]);
  return (r as any).insertId;
}
async function updateNewsMySQL(id: number, data: any) {
  if (!pool) return;
  await pool.query("UPDATE news SET title=?, category=?, content=?, bullets=? WHERE id=?", [data.title, data.category, data.content, JSON.stringify(data.bullets || []), id]);
}
async function deleteNewsMySQL(id: number) {
  if (!pool) return;
  await pool.query("DELETE FROM news WHERE id=?", [id]);
}

// =========== MySQL: Guilds ===========
async function getGuildsMySQL(): Promise<any[]> {
  if (!pool) return [];
  try { const [rows] = await pool.query("SELECT * FROM guilds"); return rows as any[]; }
  catch { return []; }
}
async function createGuildMySQL(name: string, ownerId: number): Promise<number> {
  if (!pool) return 0;
  const [r] = await pool.query("INSERT INTO guilds (name, ownerid, creationdata, motd) VALUES (?,?,?,?)", [name, ownerId, Math.floor(Date.now()/1000), "Welcome!"]);
  return (r as any).insertId;
}
async function deleteGuildMySQL(id: number) {
  if (!pool) return;
  await pool.query("DELETE FROM guilds WHERE id=?", [id]);
}
async function updateGuildMySQL(id: number, data: any) {
  if (!pool) return;
  const fields: string[] = []; const vals: any[] = [];
  if (data.name) { fields.push("name=?"); vals.push(data.name); }
  if (data.motd) { fields.push("motd=?"); vals.push(data.motd); }
  if (fields.length) {vals.push(id); await pool.query(`UPDATE guilds SET ${fields.join(",")} WHERE id=?`, vals); }
}

// =========== MySQL: Houses ===========
async function getHousesMySQL(): Promise<any[]> {
  if (!pool) return [];
  try { const [rows] = await pool.query("SELECT * FROM houses"); return rows as any[]; }
  catch { return []; }
}
async function updateHouseBidMySQL(houseId: number, bidderName: string, bidAmount: number) {
  if (!pool) return;
  await pool.query("UPDATE houses SET bidder_name=?, highest_bid=?, bid_end_date=?, internal_bid=? WHERE id=?", [bidderName, bidAmount, Math.floor(Date.now()/1000) + 7*86400, bidAmount, houseId]);
}
async function setHouseOwnerMySQL(houseId: number, ownerId: number) {
  if (!pool) return;
  await pool.query("UPDATE houses SET owner=?, bidder_name='', highest_bid=0, internal_bid=0 WHERE id=?", [ownerId, houseId]);
}

// =========== MySQL: Config ===========
async function getConfigMySQL(): Promise<any> {
  if (!pool) return null;
  try {
    const [rows] = await pool.query("SELECT config, value FROM server_config");
    const cfg: any = {};
    for (const row of (rows as any[])) cfg[row.config] = row.value;
    return cfg;
  } catch { return null; }
}
async function setConfigMySQL(key: string, value: string) {
  if (!pool) return;
  await pool.query("INSERT INTO server_config (config, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?", [key, value, value]);
}

// =========== MySQL: Bazaar ===========
async function getBazaarMySQL(): Promise<any[]> {
  if (!pool) return [];
  try { const [rows] = await pool.query("SELECT * FROM bazaar_listings WHERE sold=0 ORDER BY created_at DESC"); return rows as any[]; }
  catch { return []; }
}
async function createBazaarMySQL(data: any): Promise<string> {
  if (!pool) return data.id;
  await pool.query("INSERT INTO bazaar_listings (id,name,vocation,level,gender,skills_main,skills_shield,price,owner_account_id,owner_account_name,looktype,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    [data.id, data.name, data.vocation, data.level, data.gender, data.skills?.main||50, data.skills?.shield||50, data.price, data.ownerAccountId, data.ownerAccountName, data.looktype, Date.now()]);
  return data.id;
}
async function markBazaarSoldMySQL(id: string) {
  if (!pool) return;
  await pool.query("UPDATE bazaar_listings SET sold=1 WHERE id=?", [id]);
}

// =========== MySQL: Market ===========
async function getMarketMySQL(): Promise<any[]> {
  if (!pool) return [];
  try { const [rows] = await pool.query("SELECT * FROM market_items ORDER BY created_at DESC"); return rows as any[]; }
  catch { return []; }
}
async function createMarketItemMySQL(item: any) {
  if (!pool) return;
  await pool.query("INSERT INTO market_items (id,name,sprite,stats,characterName,status,price,sellerName,sellerAccountId,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
    [item.id, item.name, item.sprite, item.stats, item.characterName, item.status||"stash", item.price||null, item.sellerName||null, item.sellerAccountId||null, Date.now()]);
}
async function updateMarketItemMySQL(id: string, data: any) {
  if (!pool) return;
  const fields: string[] = []; const vals: any[] = [];
  if (data.status !== undefined) { fields.push("status=?"); vals.push(data.status); }
  if (data.price !== undefined) { fields.push("price=?"); vals.push(data.price); }
  if (data.sellerName !== undefined) { fields.push("sellerName=?"); vals.push(data.sellerName); }
  if (data.sellerAccountId !== undefined) { fields.push("sellerAccountId=?"); vals.push(data.sellerAccountId); }
  if (fields.length) { vals.push(id); await pool.query(`UPDATE market_items SET ${fields.join(",")} WHERE id=?`, vals); }
}
async function deleteMarketItemMySQL(id: string) {
  if (!pool) return;
  await pool.query("DELETE FROM market_items WHERE id=?", [id]);
}

// =========== MySQL: Admin operations ===========
async function createPlayerInMySQL(name: string, accountId: number, vocation: number, sex: number): Promise<number> {
  if (!pool) return 0;
  const now = Math.floor(Date.now() / 1000);
  const [r] = await pool.query(
    `INSERT INTO players (name, account_id, level, vocation, health, healthmax, experience, looktype, maglevel, mana, manamax, town_id, sex, cap, soul, balance, lastlogin, conditions)
     VALUES (?, ?, 1, ?, 150, 150, 0, 136, 0, 55, 55, 1, ?, 410, 0, 0, ?, '')`,
    [name, accountId, vocation, sex, now]
  );
  return (r as any).insertId;
}

async function findAllAccountsMySQL(): Promise<any[]> {
  if (!pool) return [];
  try { const [rows] = await pool.query("SELECT id, name, email, coins, type FROM accounts"); return (rows as any[]).map(r => ({ id: r.id, name: r.name, email: r.email, coins: r.coins, type: r.type })); }
  catch { return []; }
}
async function updatePlayerMySQL(id: number, data: any) {
  if (!pool) return;
  const fields: string[] = []; const vals: any[] = [];
  if (data.name !== undefined) { fields.push("name=?"); vals.push(data.name); }
  if (data.level !== undefined) { fields.push("level=?"); vals.push(Number(data.level)); }
  if (data.vocation !== undefined) { fields.push("vocation=?"); vals.push(Number(data.vocation)); }
  if (data.balance !== undefined) { fields.push("balance=?"); vals.push(Number(data.balance)); }
  if (data.health !== undefined) { fields.push("health=?"); vals.push(Number(data.health)); }
  if (data.healthmax !== undefined) { fields.push("healthmax=?"); vals.push(Number(data.healthmax)); }
  if (data.mana !== undefined) { fields.push("mana=?"); vals.push(Number(data.mana)); }
  if (data.manamax !== undefined) { fields.push("manamax=?"); vals.push(Number(data.manamax)); }
  if (data.maglevel !== undefined) { fields.push("maglevel=?"); vals.push(Number(data.maglevel)); }
  if (fields.length) { vals.push(id); await pool.query(`UPDATE players SET ${fields.join(",")} WHERE id=?`, vals); }
}
async function deletePlayerMySQL(id: number) {
  if (!pool) return;
  await pool.query("UPDATE players SET deletion=1 WHERE id=?", [id]);
}
async function addAccountCoinsMySQL(accountId: number, amount: number) {
  if (!pool) return;
  await pool.query("UPDATE accounts SET coins = coins + ? WHERE id = ?", [amount, accountId]);
}
async function getAccountCoinsMySQL(accountId: number): Promise<number> {
  if (!pool) return 0;
  try { const [rows] = await pool.query("SELECT coins FROM accounts WHERE id=?", [accountId]); return (rows as any[])[0]?.coins || 0; }
  catch { return 0; }
}
async function setAccountCoinsMySQL(accountId: number, coins: number) {
  if (!pool) return;
  await pool.query("UPDATE accounts SET coins = ? WHERE id = ?", [coins, accountId]);
}
async function setAccountEmailMySQL(accountId: number, email: string) {
  if (!pool) return;
  await pool.query("UPDATE accounts SET email = ? WHERE id = ?", [email, accountId]);
}
async function getOnlinePlayersMySQL(): Promise<string[]> {
  if (!pool) return [];
  try { const [rows] = await pool.query("SELECT p.name FROM players_online po JOIN players p ON p.id = po.player_id"); return (rows as any[]).map(r => r.name); }
  catch { return []; }
}
async function findAccountByIdMySQL(accountId: number): Promise<any> {
  if (!pool) return null;
  try {
    const [rows] = await pool.query("SELECT id, name, email, coins, type FROM accounts WHERE id=?", [accountId]);
    if ((rows as any[]).length > 0) { const r = (rows as any[])[0]; return { id: r.id, name: r.name, email: r.email, coins: r.coins, type: r.type, password: "" }; }
    return null;
  } catch { return null; }
}
async function setPlayerAccountIdMySQL(playerId: number, accountId: number | null) {
  if (!pool) return;
  await pool.query("UPDATE players SET account_id = ? WHERE id = ?", [accountId, playerId]);
}
async function findPlayerByIdMySQL(id: number): Promise<any> {
  if (!pool) return null;
  try { const [rows] = await pool.query(`SELECT ${PLAYER_SELECT} FROM players WHERE id=?`, [id]); if ((rows as any[]).length > 0) return rowToPlayer((rows as any[])[0]); return null; }
  catch { return null; }
}

interface Player {
  id: number;
  name: string;
  level: number;
  vocation: number;
  experience: number;
  town_id: number;
  sex: number;
  onlinetime: number;
  balance: number;
  health: number;
  healthmax: number;
  mana: number;
  manamax: number;
  maglevel: number;
  skill_sword: number;
  skill_axe: number;
  skill_club: number;
  skill_dist: number;
  skill_shielding: number;
  skill_fist: number;
  skill_fishing: number;
  online: boolean;
  deaths: any[];
  account_id?: number | null;
  looktype?: number;
}

interface Account {
  id: number;
  email: string;
  password: string;
  coins: number;
  name: string;
  type?: number;
}

interface GuildMember {
  name: string;
  rank: string;
}

interface Guild {
  id: number;
  name: string;
  logoColor: string;
  description: string;
  founded: string;
  guildHall: string;
  logoChar: string;
  members: GuildMember[];
}

interface NewsItem {
  id: number;
  title: string;
  category: "HOT" | "EVENTO" | "UPDATE" | "AVISO";
  content: string;
  bullets?: string[];
  date: string;
  author: string;
}

interface ServerConfig {
  serverName: string;
  experienceRate: number;
  serverVipBonus: number;
  contactEmail: string;
  encryptionType: string;
  maintenanceMode: boolean;
  eventDoubleXp: boolean;
  eventDoubleSkill: boolean;
  maxPlayers: number;
  activeEvents: string;
}

interface DBState {
  accounts: Account[];
  players: Player[];
  guilds?: Guild[];
  news?: NewsItem[];
  config?: ServerConfig;
  houses?: any[];
  bazaarListings?: any[];
  marketItems?: any[];
}

const defaultGuilds: Guild[] = [];

const initialPlayers: Player[] = [];

const defaultNews: NewsItem[] = [];

const defaultServerConfig: ServerConfig = {
  serverName: "Chapadonia",
  experienceRate: 350,
  serverVipBonus: 15,
  contactEmail: "ghandja1@gmail.com",
  encryptionType: "sha256",
  maintenanceMode: false,
  eventDoubleXp: true,
  eventDoubleSkill: true,
  maxPlayers: 1000,
  activeEvents: "Double XP & Skill Event, Raids Diárias Ativas"
};

function loadDB(): DBState {
  // Note: password hash for seed admin is computed synchronously
  let db: DBState = {
    accounts: [],
    players: [],
    guilds: [],
    news: [],
    config: defaultServerConfig
  };

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content);
      db = { ...db, ...parsed };
    } catch (e) {
      console.error("Error reading database.json, using default.", e);
    }
  }

  // Ensure essentials are present
  if (!db.guilds) {
    db.guilds = [];
  }
  if (!db.news) {
    db.news = [];
  }
  if (!db.config) {
    db.config = defaultServerConfig;
  }

  // Check and inject Admin account if not present
  const hasAdmin = db.accounts.some(acc => acc.email.toLowerCase() === ADMIN_EMAIL);
  if (!hasAdmin) {
    db.accounts.push({
      id: 999,
      email: ADMIN_EMAIL,
      password: hashPasswordSync(ADMIN_PASSWORD),
      coins: 50000,
      name: "Administrador",
      type: 6
    });
  }

  saveDB(db);
  return db;
}

function saveDB(state: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving database.json", e);
  }
}

async function initializeMySQL() {
  if (!pool) return;
  try {
    const conn = await pool.getConnection();
    logger.info("Connected to MySQL");
    conn.release();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(32) NOT NULL,
        email VARCHAR(255) NOT NULL DEFAULT '',
        password VARCHAR(255) NOT NULL,
        type TINYINT UNSIGNED NOT NULL DEFAULT 1,
        premdays INT NOT NULL DEFAULT 0,
        lastday INT UNSIGNED NOT NULL DEFAULT 0,
        creation INT UNSIGNED NOT NULL DEFAULT 0,
        coins INT UNSIGNED DEFAULT 1250,
        coins_transferable INT UNSIGNED NOT NULL DEFAULT 0,
        INDEX accounts_email (email)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        group_id INT NOT NULL DEFAULT 1,
        account_id INT UNSIGNED NOT NULL DEFAULT 0,
        level INT NOT NULL DEFAULT 1,
        vocation INT NOT NULL DEFAULT 0,
        health INT NOT NULL DEFAULT 150,
        healthmax INT NOT NULL DEFAULT 150,
        experience BIGINT NOT NULL DEFAULT 0,
        looktype INT NOT NULL DEFAULT 136,
        maglevel INT NOT NULL DEFAULT 0,
        mana INT NOT NULL DEFAULT 0,
        manamax INT NOT NULL DEFAULT 0,
        soul INT UNSIGNED NOT NULL DEFAULT 0,
        town_id INT NOT NULL DEFAULT 1,
        posx INT NOT NULL DEFAULT 0,
        posy INT NOT NULL DEFAULT 0,
        posz INT NOT NULL DEFAULT 0,
        conditions MEDIUMBLOB NOT NULL,
        cap INT NOT NULL DEFAULT 0,
        sex INT NOT NULL DEFAULT 0,
        lastlogin BIGINT UNSIGNED NOT NULL DEFAULT 0,
        deletion BIGINT NOT NULL DEFAULT 0,
        balance BIGINT UNSIGNED NOT NULL DEFAULT 0,
        onlinetime INT NOT NULL DEFAULT 0,
        skill_fist INT UNSIGNED NOT NULL DEFAULT 10,
        skill_club INT UNSIGNED NOT NULL DEFAULT 10,
        skill_sword INT UNSIGNED NOT NULL DEFAULT 10,
        skill_axe INT UNSIGNED NOT NULL DEFAULT 10,
        skill_dist INT UNSIGNED NOT NULL DEFAULT 10,
        skill_shielding INT UNSIGNED NOT NULL DEFAULT 10,
        skill_fishing INT UNSIGNED NOT NULL DEFAULT 10,
        INDEX account_id (account_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS guilds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        logoColor VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        founded VARCHAR(255) NOT NULL,
        guildHall VARCHAR(255) NOT NULL,
        logoChar VARCHAR(255) NOT NULL,
        members JSON NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        bullets JSON DEFAULT NULL,
        date VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS server_config (
        id INT PRIMARY KEY DEFAULT 1,
        serverName VARCHAR(255) NOT NULL,
        experienceRate INT NOT NULL,
        serverVipBonus INT NOT NULL,
        contactEmail VARCHAR(255) NOT NULL,
        encryptionType VARCHAR(50) NOT NULL,
        maintenanceMode BOOLEAN NOT NULL,
        eventDoubleXp  BOOLEAN NOT NULL,
        eventDoubleSkill BOOLEAN NOT NULL,
        maxPlayers INT NOT NULL,
        activeEvents TEXT NOT NULL
      )
    `);

    const [accs] = await pool.query("SELECT COUNT(*) as count FROM accounts");
    if ((accs as any)[0].count === 0) {
      logger.info("Seeding initial accounts table...");
      const adminHash = await hashPassword(ADMIN_PASSWORD);
      const now = Math.floor(Date.now() / 1000);
      await pool.query("INSERT INTO accounts (id, name, email, password, type, creation, premdays, lastday, coins) VALUES (999, 'Administrador', ?, ?, 6, ?, 65535, 0, 50000)", [ADMIN_EMAIL, adminHash, now]);
    }

    const [cfg] = await pool.query("SELECT COUNT(*) as count FROM server_config");
    if ((cfg as any)[0].count === 0) {
      logger.info("Seeding initial server_config table...");
      await pool.query(`
        INSERT INTO server_config (id, serverName, experienceRate, serverVipBonus, contactEmail, encryptionType, maintenanceMode, eventDoubleXp, eventDoubleSkill, maxPlayers, activeEvents)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        defaultServerConfig.serverName, defaultServerConfig.experienceRate, defaultServerConfig.serverVipBonus, defaultServerConfig.contactEmail, defaultServerConfig.encryptionType, defaultServerConfig.maintenanceMode ? 1 : 0, defaultServerConfig.eventDoubleXp ? 1 : 0, defaultServerConfig.eventDoubleSkill ? 1 : 0, defaultServerConfig.maxPlayers, defaultServerConfig.activeEvents
      ]);
    }

    logger.info("MySQL initialization completed");
    await runMigrations(pool);
  } catch (err: any) {
    logger.warn({ err: err?.message || err }, "MySQL not available, falling back to JSON");
    pool = null;
  }
}

async function getDBState(): Promise<DBState> {
  if (!pool) {
    return loadDB();
  }

  try {
    const [accountsRows] = await pool.query("SELECT * FROM accounts");
    const [playersRows] = await pool.query("SELECT * FROM players");
    const [guildsRows] = await pool.query("SELECT * FROM guilds");
    const [newsRows] = await pool.query("SELECT * FROM news ORDER BY id DESC");
    const [configRows] = await pool.query("SELECT * FROM server_config WHERE id = 1");

    const accounts = (accountsRows as any[]).map(r => ({
      id: r.id,
      email: r.email || r.name || "",
      password: r.password,
      coins: r.coins || 0,
      name: r.name || r.email || "",
      type: r.type || 1
    }));

    const players = (playersRows as any[]).map(r => ({
      id: r.id,
      name: r.name,
      level: r.level,
      vocation: r.vocation,
      experience: Number(r.experience),
      town_id: r.town_id,
      sex: r.sex,
      onlinetime: r.onlinetime,
      balance: r.balance,
      health: r.health,
      healthmax: r.healthmax,
      mana: r.mana,
      manamax: r.manamax,
      maglevel: r.maglevel,
      skill_sword: r.skill_sword,
      skill_axe: r.skill_axe,
      skill_club: r.skill_club,
      skill_dist: r.skill_dist,
      skill_shielding: r.skill_shielding,
      skill_fist: r.skill_fist,
      skill_fishing: r.skill_fishing,
      online: Boolean(r.online),
      deaths: typeof r.deaths === 'string' ? JSON.parse(r.deaths) : (r.deaths || []),
      account_id: r.account_id
    }));

    const guilds = (guildsRows as any[]).map(r => ({
      id: r.id,
      name: r.name,
      logoColor: r.logoColor,
      description: r.description,
      founded: r.founded,
      guildHall: r.guildHall,
      logoChar: r.logoChar,
      members: typeof r.members === 'string' ? JSON.parse(r.members) : (r.members || [])
    }));

    const news = (newsRows as any[]).map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      content: r.content,
      bullets: typeof r.bullets === 'string' ? JSON.parse(r.bullets) : (r.bullets || []),
      date: r.date,
      author: r.author
    }));

    let config = defaultServerConfig;
    if ((configRows as any[]).length > 0) {
      const c = (configRows as any[])[0];
      config = {
        serverName: c.serverName,
        experienceRate: c.experienceRate,
        serverVipBonus: c.serverVipBonus,
        contactEmail: c.contactEmail,
        encryptionType: c.encryptionType,
        maintenanceMode: Boolean(c.maintenanceMode),
        eventDoubleXp: Boolean(c.eventDoubleXp),
        eventDoubleSkill: Boolean(c.eventDoubleSkill),
        maxPlayers: c.maxPlayers,
        activeEvents: c.activeEvents
      };
    }

    return { accounts, players, guilds, news, config };
  } catch (err) {
    logger.error({ err }, "Failed to fetch state from MySQL");
    return loadDB();
  }
}

async function saveDBState(state: DBState): Promise<void> {
  if (!pool) {
    saveDB(state);
    return;
  }

  try {
    for (const acc of state.accounts) {
      await pool.query(`
        INSERT INTO accounts (id, name, email, password, type, coins)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          email = VALUES(email),
          password = VALUES(password),
          type = VALUES(type),
          coins = VALUES(coins)
      `, [acc.id, acc.name || acc.email, acc.email, acc.password, acc.type || 1, acc.coins]);
    }
    // Don't delete accounts not in state — game server manages them

    for (const p of state.players) {
      await pool.query(`
        INSERT INTO players (id, name, level, vocation, experience, town_id, sex, onlinetime, balance, health, healthmax, mana, manamax, maglevel, skill_sword, skill_axe, skill_club, skill_dist, skill_shielding, skill_fist, skill_fishing, online, deaths, account_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          level = VALUES(level),
          vocation = VALUES(vocation),
          experience = VALUES(experience),
          town_id = VALUES(town_id),
          sex = VALUES(sex),
          onlinetime = VALUES(onlinetime),
          balance = VALUES(balance),
          health = VALUES(health),
          healthmax = VALUES(healthmax),
          mana = VALUES(mana),
          manamax = VALUES(manamax),
          maglevel = VALUES(maglevel),
          skill_sword = VALUES(skill_sword),
          skill_axe = VALUES(skill_axe),
          skill_club = VALUES(skill_club),
          skill_dist = VALUES(skill_dist),
          skill_shielding = VALUES(skill_shielding),
          skill_fist = VALUES(skill_fist),
          skill_fishing = VALUES(skill_fishing),
          online = VALUES(online),
          deaths = VALUES(deaths),
          account_id = VALUES(account_id)
      `, [
        p.id, p.name, p.level, p.vocation, p.experience, p.town_id, p.sex, p.onlinetime, p.balance, p.health, p.healthmax, p.mana, p.manamax, p.maglevel, p.skill_sword, p.skill_axe, p.skill_club, p.skill_dist, p.skill_shielding, p.skill_fist, p.skill_fishing, p.online ? 1 : 0, JSON.stringify(p.deaths), p.account_id
      ]);
    }
    // Don't delete players not in state — game server manages them

    if (state.guilds) {
      for (const g of state.guilds) {
        await pool.query(`
          INSERT INTO guilds (id, name, logoColor, description, founded, guildHall, logoChar, members)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            logoColor = VALUES(logoColor),
            description = VALUES(description),
            founded = VALUES(founded),
            guildHall = VALUES(guildHall),
            logoChar = VALUES(logoChar),
            members = VALUES(members)
        `, [
          g.id, g.name, g.logoColor, g.description, g.founded, g.guildHall, g.logoChar, JSON.stringify(g.members)
        ]);
      }
      if (state.guilds.length > 0) {
        const ids = state.guilds.map(g => g.id);
        const placeholders = ids.map(() => "?").join(",");
        await pool.query(`DELETE FROM guilds WHERE id NOT IN (${placeholders})`, ids);
      }
    }

    if (state.news) {
      for (const n of state.news) {
        await pool.query(`
          INSERT INTO news (id, title, category, content, bullets, date, author)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            category = VALUES(category),
            content = VALUES(content),
            bullets = VALUES(bullets),
            date = VALUES(date),
            author = VALUES(author)
        `, [
          n.id, n.title, n.category, n.content, JSON.stringify(n.bullets), n.date, n.author
        ]);
      }
      if (state.news.length > 0) {
        const ids = state.news.map(n => n.id);
        const placeholders = ids.map(() => "?").join(",");
        await pool.query(`DELETE FROM news WHERE id NOT IN (${placeholders})`, ids);
      }
    }

    if (state.config) {
      const c = state.config;
      await pool.query(`
        INSERT INTO server_config (id, serverName, experienceRate, serverVipBonus, contactEmail, encryptionType, maintenanceMode, eventDoubleXp, eventDoubleSkill, maxPlayers, activeEvents)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          serverName = VALUES(serverName),
          experienceRate = VALUES(experienceRate),
          serverVipBonus = VALUES(serverVipBonus),
          contactEmail = VALUES(contactEmail),
          encryptionType = VALUES(encryptionType),
          maintenanceMode = VALUES(maintenanceMode),
          eventDoubleXp = VALUES(eventDoubleXp),
          eventDoubleSkill = VALUES(eventDoubleSkill),
          maxPlayers = VALUES(maxPlayers),
          activeEvents = VALUES(activeEvents)
      `, [
        c.serverName, c.experienceRate, c.serverVipBonus, c.contactEmail, c.encryptionType, c.maintenanceMode ? 1 : 0, c.eventDoubleXp ? 1 : 0, c.eventDoubleSkill ? 1 : 0, c.maxPlayers, c.activeEvents
      ]);
    }
  } catch (err) {
    logger.error({ err }, "Failed to sync state to MySQL");
    saveDB(state);
  }
}

async function startServer() {
  await initializeMySQL();

  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Redirect HTTP to HTTPS in production
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      if (req.headers["x-forwarded-proto"] && req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  app.use(express.json({ limit: "100kb" }));
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://tibia.fandom.com"],
        imgSrc: ["'self'", "data:", "https://*.tibia.com", "https://*.fandom.com", "https://*.nocookie.net", "https://static.tibia.com", "https://outfit-service.tibia.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'none'"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xFrameOptions: { action: "deny" },
    xPermittedCrossDomainPolicies: { permittedPolicies: "none" },
  }));
  app.use(cors({
    origin: process.env.NODE_ENV === "production"
      ? (process.env.CORS_ORIGIN || "http://localhost")
      : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }));
  app.set("trust proxy", true);
  app.use(compression());
  app.use(cookieParser());

  // Request logging (security audit trail) — no IP logging in production
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan(":method :url :status :res[content-length] - :response-time ms - :remote-addr"));
  }

  // Global API rate limiter (fallback for all /api routes)
  const globalApiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    message: { message: "Muitas requisições. Aguarde um momento." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", globalApiLimiter);

  // Input validation helpers
  const ALLOWED_CHAR_NAME_REGEX = /^[A-Za-zÀ-ÿ'\-\s]+$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateEmail(email: string): boolean {
    return typeof email === "string" && email.length <= 255 && EMAIL_REGEX.test(email);
  }

  function validatePassword(password: string): { valid: boolean; message?: string } {
    if (typeof password !== "string") return { valid: false, message: "Senha inválida." };
    if (password.length < 8) return { valid: false, message: "A senha deve ter no mínimo 8 caracteres." };
    if (password.length > 128) return { valid: false, message: "A senha deve ter no máximo 128 caracteres." };
    if (!/[A-Z]/.test(password)) return { valid: false, message: "A senha deve conter pelo menos uma letra maiúscula." };
    if (!/[a-z]/.test(password)) return { valid: false, message: "A senha deve conter pelo menos uma letra minúscula." };
    if (!/[0-9]/.test(password)) return { valid: false, message: "A senha deve conter pelo menos um número." };
    return { valid: true };
  }

  function sanitizeCharacterName(name: string): string {
    return name.replace(/[^A-Za-zÀ-ÿ'\-\s]/g, "").substring(0, 30).trim();
  }

  function validateCharacterName(name: string): { valid: boolean; sanitized: string; message?: string } {
    const sanitized = sanitizeCharacterName(name);
    if (sanitized.length < 2) return { valid: false, sanitized, message: "Nome de personagem muito curto." };
    if (!ALLOWED_CHAR_NAME_REGEX.test(sanitized)) return { valid: false, sanitized, message: "Nome contém caracteres inválidos." };
    return { valid: true, sanitized };
  }

  // Admin authentication middleware
  async function requireAdmin(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Acesso não autorizado." });
    }
    const token = authHeader.substring(7);
    const accId = verifyToken(token);
    if (!accId) {
      return res.status(401).json({ message: "Sessão inválida ou expirada." });
    }
    // Check if account is admin (type >= 5 in DB schema; 5=Gamemaster, 6=God)
    const account = await findAccountByIdMySQL(accId);
    if (!account || !account.type || account.type < 5) {
      return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }
    req.accId = accId;
    next();
  }

  function requireAuth(req: any, res: any, next: any) {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.chapadonia_token) {
      token = req.cookies.chapadonia_token;
    }
    if (!token) {
      return res.status(401).json({ message: "Autenticação necessária." });
    }
    const accId = verifyToken(token);
    if (!accId) {
      return res.status(401).json({ message: "Sessão inválida ou expirada." });
    }
    req.accId = accId;
    next();
  }

  app.use(csrfMiddleware);

  // Rate limiter for login/register
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: { message: "Muitas tentativas de login. Aguarde 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const financialLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // 5 operações por minuto
    message: { message: "Muitas operações financeiras. Aguarde um momento." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const adminLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 operações por minuto
    message: { message: "Muitas operações administrativas. Aguarde um momento." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const proxyLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 60, // 60 requisições por minuto (1 por segundo em média)
    message: { message: "Muitas requisições ao proxy. Aguarde um momento." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply admin rate limiter to all /api/admin routes (must be AFTER adminLimiter declaration)
  app.use("/api/admin", adminLimiter);

  // 1. Fetch Server Info
  app.get("/api/server/info", async (req, res) => {
    const onlineCount = (await getOnlinePlayersMySQL()).length;
    const totalPlayers = await countPlayersMySQL();
    const totalAccounts = await countAccountsMySQL();
    res.json({
      playersOnline: onlineCount,
      playersRecord: onlineCount,
      totalAccounts,
      totalPlayers
    });
  });

  // 2. Fetch Online Players — from MySQL
  app.get("/api/server/online", async (req, res) => {
    const names = await getOnlinePlayersMySQL();
    res.json({ online: names.map(n => ({ name: n, level: 0, vocation: 0 })) });
  });

  // 2.05 Fetch Boosted Creature of the Week
  app.get("/api/server/boosted-creature", async (req, res) => {
    const config = await getConfigMySQL();
    const name = (config && config.boostedCreatureName) || "Dragon Lord";
    const looktype = parseInt((config && config.boostedCreatureLooktype) || "39");
    res.json({
      name,
      looktype,
      type: "Draconiano",
      bonusExp: "Dobro de Experiência e +50% Gold Drop Rate"
    });
  });

  // 2.1 Fetch news — from MySQL
  app.get("/api/news", async (req, res) => {
    const news = await getNewsMySQL();
    res.json(news || []);
  });

  // 2.2 Create news (Admin)
  app.post("/api/admin/news", requireAdmin, async (req, res) => {
    const { title, category, content, bullets, author } = req.body;
    if (!title || !category || !content) {
      return res.status(400).json({ message: "Título, categoria e conteúdo são obrigatórios!" });
    }
    const id = await createNewsMySQL(title, category, content, bullets, author || "Administrador");
    auditLog("ADMIN ACTION: account [{}] created news [{}]", req.accId || 999, title);
    res.status(201).json({ id, title, category, content, bullets: bullets || [], date: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }), author: author || "Administrador" });
  });

  // 2.3 Update news (Admin)
  app.put("/api/admin/news/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    await updateNewsMySQL(id, req.body);
    auditLog("ADMIN ACTION: account [{}] updated news [{}]", req.accId || 999, id);
    res.json({ message: "Notícia atualizada!" });
  });

  // 2.4 Delete news (Admin)
  app.delete("/api/admin/news/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    await deleteNewsMySQL(id);
    auditLog("ADMIN ACTION: account [{}] deleted news [{}]", req.accId || 999, id);
    res.json({ message: "Notícia removida!" });
  });

  // 2.5 Get All Players & Accounts (Admin Panel) — from MySQL
  app.get("/api/admin/players", requireAdmin, async (req, res) => {
    const players = await findAllPlayersMySQL();
    const accounts = await findAllAccountsMySQL();
    const enriched = players.map(p => {
      const acc = accounts.find(a => a.id === p.account_id);
      return { ...p, accountEmail: acc?.email || "", accountCoins: acc?.coins || 0, accountName: acc?.name || "", accountId: acc?.id || null };
    });
    res.json({ players: enriched, accounts: accounts.map(a => ({ id: a.id, email: a.email, name: a.name, coins: a.coins, type: a.type })) });
  });

  // 2.6 Update Player Details (Admin) — from MySQL
  app.put("/api/admin/players/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const updateData: any = {};
    for (const key of ALLOWED_PLAYER_FIELDS) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }
    await updatePlayerMySQL(id, updateData);
    if (updateData.accountCoins !== undefined) await setAccountCoinsMySQL(updateData.accountId || 0, Number(updateData.accountCoins));
    if (updateData.accountEmail !== undefined) await setAccountEmailMySQL(updateData.accountId || 0, updateData.accountEmail);
    auditLog("ADMIN ACTION: account [{}] updated player [{}]", req.accId || 999, id);
    res.json({ message: "Jogador atualizado com sucesso!" });
  });

  // 2.7 Delete Player (Admin)
  app.delete("/api/admin/players/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    await deletePlayerMySQL(id);
    auditLog("ADMIN ACTION: account [{}] deleted player [{}]", req.accId || 999, id);
    res.json({ message: "Jogador deletado com sucesso!" });
  });

  // 2.8 Add Coins to Account (Admin)
  app.post("/api/admin/accounts/:id/add-coins", requireAdmin, async (req, res) => {
    const accountId = Number(req.params.id);
    const { amount } = req.body;
    if (amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({ message: "Quantidade inválida de moedas!" });
    }
    await addAccountCoinsMySQL(accountId, Number(amount));
    const coins = await getAccountCoinsMySQL(accountId);
    auditLog("ADMIN ACTION: account [{}] added {} coins to account [{}]", req.accId || 999, amount, accountId);
    res.json({ message: "Coins adicionados com sucesso!", coins });
  });

  // 2.9 Delete Guild (Admin)
  app.delete("/api/admin/guilds/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    await deleteGuildMySQL(id);
    auditLog("ADMIN ACTION: account [{}] deleted guild [{}]", req.accId || 999, id);
    res.json({ message: "Guilda dissolvida com sucesso!" });
  });

  // 2.10 Edit Guild (Admin)
  app.put("/api/admin/guilds/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { name, description } = req.body;
    await updateGuildMySQL(id, { name, motd: description });
    auditLog("ADMIN ACTION: account [{}] updated guild [{}]", req.accId || 999, id);
    res.json({ message: "Guilda atualizada com sucesso!" });
  });

  // 2.11 Get/Set Global Config
  app.get("/api/admin/config", requireAdmin, async (req, res) => {
    const config = await getConfigMySQL();
    res.json(config || defaultServerConfig);
  });

  const ALLOWED_PLAYER_FIELDS = ["name", "level", "vocation", "balance", "health", "healthmax", "mana", "manamax", "maglevel", "accountCoins", "accountEmail", "accountId"];

  const ALLOWED_CONFIG_KEYS = ["serverName", "serverMotd", "worldType", "maxPlayers", "protectionLevel",
    "rateExp", "rateSkill", "rateLoot", "rateMagic", "rateSpawn", "freePremium",
    "toggleMaintainMode", "maintainModeMessage", "toggleGuildWars",
    "toggleChainSystem", "toggleHazardSystem", "toggleFreeQuest",
    "toggleImbuementShrineStorage", "toggleMountInProtectionZone",
    "toggleTravelsFree", "autoLoot", "autoBank", "staminaSystem",
    "toggleSaveInterval", "saveIntervalTime", "toggleSaveAsync",
    "globalServerSaveTime", "experienceDisplayRates", "onlyPremiumAccount",
    "eventDoubleXp", "eventDoubleSkill", "activeEvents",
    "encryptionType", "maintenanceMode",
    "boostedCreatureName", "boostedCreatureLooktype"];

  app.put("/api/admin/config", requireAdmin, async (req, res) => {
    const filtered: any = {};
    for (const key of ALLOWED_CONFIG_KEYS) {
      if (req.body[key] !== undefined) {
        filtered[key] = req.body[key];
      }
    }
    for (const key of Object.keys(filtered)) {
      await setConfigMySQL(key, String(filtered[key]));
    }
    const config = await getConfigMySQL();
    auditLog("ADMIN ACTION: account [{}] updated global config", req.accId || 999);
    res.json({ message: "Configurações globais salvas com sucesso!", config: config || defaultServerConfig });
  });

  // Guilds: Fetch all guilds with dynamic stats computed
  app.get("/api/server/guilds", async (req, res) => {
    const guilds = await getGuildsMySQL();
    const allPlayers = await findAllPlayersMySQL();

    const enrichedGuilds = guilds.map(guild => {
      const members = typeof guild.members === 'string' ? JSON.parse(guild.members) : (guild.members || []);
      let totalPower = 0;
      let memberCount = 0;

      const enrichedMembers = members.map((m: any) => {
        const player = allPlayers.find(p => p.name.toLowerCase() === m.name.toLowerCase());
        if (player) {
          totalPower += player.level;
          memberCount++;
          return {
            name: m.name,
            rank: m.rank,
            level: player.level,
            vocation: player.vocation,
            online: player.online
          };
        } else {
          totalPower += 50;
          memberCount++;
          return {
            name: m.name,
            rank: m.rank,
            level: 50,
            vocation: 1,
            online: false
          };
        }
      });

      const averageLevel = memberCount > 0 ? Math.round(totalPower / memberCount) : 0;
      const leaderName = members.find((m: any) => m.rank === "Líder")?.name || members[0]?.name || "Nenhum";

      return {
        ...guild,
        members: enrichedMembers,
        memberCount,
        totalPower,
        averageLevel,
        leaderName
      };
    });

    res.json({ guilds: enrichedGuilds });
  });

  // Guilds: Join a guild
  app.post("/api/server/guilds/join", requireAuth, async (req: any, res) => {
    const { guildId, characterName } = req.body;
    if (!guildId || !characterName) {
      return res.status(400).json({ message: "Guild e Personagem são obrigatórios!" });
    }

    const db = await getDBState();
    const guilds = db.guilds || defaultGuilds;
    const guild = guilds.find(g => g.id === Number(guildId));

    if (!guild) {
      return res.status(404).json({ message: "Guilda não encontrada!" });
    }

    const player = db.players.find(p => p.name.toLowerCase() === characterName.toLowerCase());
    if (!player) {
      return res.status(404).json({ message: "Personagem não encontrado!" });
    }

    if (player.account_id !== req.accId) {
      return res.status(403).json({ message: "Este personagem não pertence à sua conta!" });
    }

    const isAlreadyInGuild = guilds.some(g => g.members.some(m => m.name.toLowerCase() === characterName.toLowerCase()));
    if (isAlreadyInGuild) {
      return res.status(400).json({ message: "Este personagem já é membro de uma guilda!" });
    }

    guild.members.push({
      name: player.name,
      rank: "Membro"
    });

    db.guilds = guilds;
    await saveDBState(db);

    res.json({ message: `Personagem ${player.name} entrou com sucesso na guilda ${guild.name}!`, guild });
  });

  // Guilds: Leave a guild
  app.post("/api/server/guilds/leave", requireAuth, async (req: any, res) => {
    const { characterName } = req.body;
    if (!characterName) {
      return res.status(400).json({ message: "Personagem é obrigatório!" });
    }

    const db = await getDBState();
    const player = db.players.find(p => p.name.toLowerCase() === characterName.toLowerCase());
    if (!player) {
      return res.status(404).json({ message: "Personagem não encontrado!" });
    }

    if (player.account_id !== req.accId) {
      return res.status(403).json({ message: "Este personagem não pertence à sua conta!" });
    }

    const guilds = db.guilds || defaultGuilds;

    let found = false;
    let guildName = "";
    let isLeader = false;

    for (const g of guilds) {
      const idx = g.members.findIndex(m => m.name.toLowerCase() === characterName.toLowerCase());
      if (idx !== -1) {
        const member = g.members[idx];
        if (member.rank === "Líder") {
          isLeader = true;
          break;
        }
        g.members.splice(idx, 1);
        found = true;
        guildName = g.name;
        break;
      }
    }

    if (isLeader) {
      return res.status(400).json({ message: "O líder não pode sair da guilda! Dissolva a guilda ou transfira a liderança primeiro." });
    }

    if (!found) {
      return res.status(400).json({ message: "Personagem não faz parte de nenhuma guilda." });
    }

    db.guilds = guilds;
    await saveDBState(db);

    res.json({ message: `Personagem ${characterName} saiu com sucesso da guilda ${guildName}!` });
  });

  // Guilds: Create a guild
  app.post("/api/server/guilds/create", requireAuth, async (req: any, res) => {
    const { name, description, logoChar, logoColor, leaderName, guildHall } = req.body;
    if (!name || !description || !logoChar || !leaderName) {
      return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos!" });
    }

    const guilds = await getGuildsMySQL();

    if (guilds.some(g => g.name.toLowerCase() === name.toLowerCase().trim())) {
      return res.status(400).json({ message: "Já existe uma guilda com este nome!" });
    }

    const player = await findPlayerByNameMySQL(leaderName);
    if (!player) {
      return res.status(404).json({ message: "Líder selecionado não existe!" });
    }

    if (player.account_id !== req.accId) {
      return res.status(403).json({ message: "Este personagem não pertence à sua conta!" });
    }

    if (player.level < 80) {
      return res.status(400).json({ message: "Seu personagem precisa ter nível 80 ou superior para fundar uma guilda!" });
    }

    const alreadyInGuild = guilds.some(g => {
      const members = typeof g.members === 'string' ? JSON.parse(g.members) : (g.members || []);
      return members.some((m: any) => m.name.toLowerCase() === leaderName.toLowerCase());
    });
    if (alreadyInGuild) {
      return res.status(400).json({ message: "Este personagem já faz parte de outra guilda!" });
    }

    await createGuildMySQL(name.trim(), player.id);

    res.json({ message: `Guilda ${name.trim()} fundada com sucesso!` });
  });

  // 3. Fetch Highscores (filtered and sorted) — from MySQL
  app.get("/api/highscores", async (req, res) => {
    const { sort = "level", vocation = "0", page = "1", limit = "20" } = req.query;
    
    const allPlayers = await findAllPlayersMySQL();
    let filtered = allPlayers;
    const vocId = Number(vocation);
    if (vocId > 0) {
      filtered = filtered.filter(p => {
        if (vocId === 1) return p.vocation === 1 || p.vocation === 5;
        if (vocId === 2) return p.vocation === 2 || p.vocation === 6;
        if (vocId === 3) return p.vocation === 3 || p.vocation === 7;
        if (vocId === 4) return p.vocation === 4 || p.vocation === 8;
        if (vocId === 5) return p.vocation === 9 || p.vocation === 10;
        return p.vocation === vocId;
      });
    }

    filtered.sort((a, b) => sort === "experience" ? (b.experience || 0) - (a.experience || 0) : (b.level || 0) - (a.level || 0));

    const pPage = Number(page);
    const pLimit = Number(limit);
    const startIndex = (pPage - 1) * pLimit;
    const paginated = filtered.slice(startIndex, startIndex + pLimit);

    res.json({ players: paginated, total: filtered.length, page: pPage, totalPages: Math.ceil(filtered.length / pLimit) });
  });

  // 4. Fetch Player Details by Name (Character Lookup) — from MySQL
  app.get("/api/players/:name", async (req, res) => {
    const name = decodeURIComponent(req.params.name).trim();
    const player = await findPlayerByNameMySQL(name);
    if (player) {
      res.json({ player });
    } else {
      res.status(404).json({ message: "Player not found" });
    }
  });

  // 5. Auth: Register
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Dados inválidos.",
        errors: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      });
    }
    const { email, password } = parsed.data;

    const emailLower = email.toLowerCase();

    // Check if already exists in MySQL
    const existing = await findAccountByEmail(emailLower);
    if (existing) {
      return res.status(400).json({ message: "Este e-mail já está cadastrado!" });
    }

    const passwordHash = await hashPassword(password);
    const emailPrefix = email.split("@")[0];
    const safeName = emailPrefix.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 20);
    const capitalizedName = safeName.charAt(0).toUpperCase() + safeName.slice(1);
    const accountName = capitalizedName || "Player";

    // Create in MySQL (primary, for game server)
    let accId: number;
    const mysqlId = await createAccountInMySQL(emailLower, passwordHash, accountName, 1);
    if (mysqlId) {
      accId = mysqlId;
    } else {
      accId = Date.now() + Math.floor(Math.random() * 10000);
    }

    // Also store in JSON for website fallback
    const db = await getDBState();
    db.accounts.push({
      id: accId,
      email: emailLower,
      password: passwordHash,
      coins: 1250,
      name: accountName,
      type: 1
    });
    await saveDBState(db);

    res.status(200).json({ message: "Conta criada com sucesso!" });
  });

  // 6. Auth: Login
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Dados inválidos.",
        errors: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      });
    }
    const { email, password } = parsed.data;

    const account = await findAccountByEmail(email);

    if (!account) {
      return res.status(401).json({ message: "E-mail ou senha incorretos!" });
    }

    const valid = await verifyPassword(password, account.password);
    if (!valid) {
      return res.status(401).json({ message: "E-mail ou senha incorretos!" });
    }

    const token = generateToken(account.id);
    const chars = await findPlayersByAccount(account.id);

    res.cookie("chapadonia_token", token, { httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "lax" });

    hooks.fire("auth:login", { accountId: account.id, email: account.email });

    res.json({
      token,
      account: {
        id: account.id,
        email: account.email,
        coins: account.coins,
        name: account.name
      },
      characters: chars
    });
  });

  // 7. Auth: Me Profile
  // Returns 200 always (null account when not authenticated) — avoids 401 noise in console
  app.get("/api/auth/me", async (req, res) => {
    let token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.substring(7) : undefined;
    const hasAuthHeader = !!token;
    if (!token && req.cookies?.chapadonia_token) token = req.cookies.chapadonia_token;
    const hasCookie = !!req.cookies?.chapadonia_token;
    if (!token) {
      console.log("[AUTH] No token. header:%s cookie:%s", hasAuthHeader, hasCookie);
      return res.json({ account: null, characters: [] });
    }
    const accId = verifyToken(token);
    if (!accId) {
      console.log("[AUTH] Invalid token. header:%s cookie:%s", hasAuthHeader, hasCookie);
      return res.json({ account: null, characters: [] });
    }
    const account = await findAccountByIdMySQL(accId);
    if (!account) {
      console.log("[AUTH] Account not found for id:", accId);
      return res.json({ account: null, characters: [] });
    }
    const chars = await findPlayersByAccount(account.id);
    const freshToken = generateToken(accId);
    console.log("[AUTH] OK id:%d chars:%d", accId, chars.length);
    res.json({
      account: { id: account.id, email: account.email, coins: account.coins, name: account.name },
      characters: chars,
      token: freshToken
    });
  });

  // 7.5 Auth: Create Character (MySQL)
  app.post("/api/auth/create-character", requireAuth, async (req, res) => {
    const { name, vocation, gender } = req.body;
    if (!name || !vocation || !gender) {
      return res.status(400).json({ message: "Nome, vocação e gênero são obrigatórios." });
    }
    const nameCheck = validateCharacterName(name);
    if (!nameCheck.valid) {
      return res.status(400).json({ message: nameCheck.message });
    }
    // Map vocation name to ID
    const vocationMap: Record<string, number> = {
      "Knight": 4, "Elite Knight": 8,
      "Sorcerer": 1, "Master Sorcerer": 5,
      "Druid": 2, "Elder Druid": 6,
      "Paladin": 3, "Royal Paladin": 7,
      "Monk": 9, "Exalted Monk": 10
    };
    const vocId = vocationMap[vocation] || 0;
    if (!vocId) return res.status(400).json({ message: "Vocação inválida." });
    const sex = gender === "Masculino" ? 1 : 0;

    // Check if name already exists
    const existing = await findPlayerByNameMySQL(nameCheck.sanitized);
    if (existing) return res.status(400).json({ message: "Este nome de personagem já existe." });

    const playerId = await createPlayerInMySQL(nameCheck.sanitized, req.accId!, vocId, sex);
    if (!playerId) return res.status(500).json({ message: "Erro ao criar personagem no banco de dados." });

    auditLog("CHARACTER CREATED: {} (id:{}) by account {}", nameCheck.sanitized, playerId, req.accId);
    hooks.fire("player:create", { name: nameCheck.sanitized, playerId, accountId: req.accId, vocation, gender });
    res.status(201).json({ message: "Personagem criado com sucesso!", player: { id: playerId, name: nameCheck.sanitized, vocation, level: 1, gender } });
  });

  // 8. Auth: Change Password
  app.post("/api/auth/change-password", authLimiter, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    const token = authHeader.substring(7);
    const accId = verifyToken(token);

    if (!accId) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    const { oldPassword, newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "Nova senha é obrigatória!" });
    }

    const account = await findAccountByIdMySQL(accId);
    if (!account) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    if (!oldPassword) {
      return res.status(400).json({ message: "Senha antiga é obrigatória!" });
    }
    const valid = await verifyPassword(oldPassword, account.password);
    if (!valid) {
      return res.status(400).json({ message: "Senha antiga incorreta!" });
    }

    const newHash = await hashPassword(newPassword);
    await updateAccountPasswordInMySQL(accId, newHash);

    res.json({ message: "Senha alterada com sucesso!" });
  });

  // --- TRANSCONAL ENDPOINTS BY AI AGENT (HOUSES, BAZAAR, P2P MARKET) ---

  function getVocationName(v: number): string {
    switch (v) {
      case 1: return "Sorcerer";
      case 2: return "Druid";
      case 3: return "Paladin";
      case 4: return "Knight";
      case 5: return "Monk";
      case 6: return "Master Sorcerer";
      case 7: return "Elder Druid";
      case 8: return "Royal Paladin";
      case 9: return "Elite Knight";
      default: return "None";
    }
  }

  function getVocationId(name: string): number {
    switch (name ? name.toLowerCase() : "") {
      case "sorcerer": return 1;
      case "druid": return 2;
      case "paladin": return 3;
      case "knight": return 4;
      case "monk": return 5;
      case "master sorcerer": return 6;
      case "elder druid": return 7;
      case "royal paladin": return 8;
      case "elite knight": return 9;
      default: return 0;
    }
  }

  function getNextServerSaveISO(): string {
    const now = new Date();
    const ss = new Date();
    ss.setUTCHours(10, 0, 0, 0); // SS is at 10:00 UTC
    if (now.getUTCHours() >= 10) {
      ss.setUTCDate(ss.getUTCDate() + 1);
    }
    return ss.toISOString();
  }

  async function checkAndProcessHouseAuctions(): Promise<boolean> {
    let changed = false;
    const now = new Date();
    const houses = await getHousesMySQL();
    if (houses) {
      for (const house of houses) {
        if ((house.owner === null || house.owner === 0) && house.bid_end_date) {
          const endTime = new Date(house.bid_end_date * 1000);
          if (now >= endTime) {
            if (house.bidder_name) {
              const winner = await findPlayerByNameMySQL(house.bidder_name);
              if (winner) {
                await setHouseOwnerMySQL(house.id, winner.id);
              }
            }
            changed = true;
          }
        }
      }
    }
    return changed;
  }

  // 1. Get account coins (read-only for user)
  app.get("/api/account/coins", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    const token = authHeader.substring(7);
    const accId = verifyToken(token);

    if (!accId) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    const db = await getDBState();
    const account = db.accounts.find(acc => acc.id === accId);
    if (!account) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    res.json({ coins: account.coins });
  });

  // 2. Get Houses
  app.get("/api/houses", async (req, res) => {
    const houses = await getHousesMySQL();
    res.json(houses || []);
  });

  // 3. Bid on House
  app.post("/api/houses/:id/bid", financialLimiter, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    const token = authHeader.substring(7);
    const accId = verifyToken(token);

    if (!accId) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    const houseId = parseInt(req.params.id);
    const { characterName, amount } = req.body;

    if (!characterName) {
      return res.status(400).json({ message: "Selecione um herói para dar o lance!" });
    }

    const bidAmount = parseInt(amount);
    if (isNaN(bidAmount) || bidAmount < 25) {
      return res.status(400).json({ message: "O lance mínimo para leilão de casas é de 25 Coins!" });
    }

    let account: { id: number; email: string; password: string; coins: number; name: string; type?: number } | undefined;
    if (pool) {
      const [accRows] = await pool.query("SELECT * FROM accounts WHERE id = ?", [accId]);
      if ((accRows as any[]).length > 0) {
        const r = (accRows as any[])[0];
        account = { id: r.id, email: r.email, password: r.password, coins: r.coins || 0, name: r.name, type: r.type };
      }
    }
    if (!account) {
      const db = await getDBState();
      account = db.accounts.find(acc => acc.id === accId);
    }
    if (!account) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    const playerChars = await findPlayersByAccount(accId);
    const ownsChar = playerChars.some(p => p.name === characterName);
    if (!ownsChar) {
      return res.status(400).json({ message: "Este herói não pertence à sua conta!" });
    }

    const houses = await getHousesMySQL();
    if (!houses || houses.length === 0) {
      return res.status(404).json({ message: "Nenhuma casa encontrada." });
    }
    const house = houses.find(h => h.id === houseId);
    if (!house) {
      return res.status(404).json({ message: "Casa não encontrada." });
    }

    if (house.owner !== null && house.owner !== 0 && house.owner !== undefined) {
      return res.status(400).json({ message: "Esta casa já está alugada!" });
    }

    const ended = house.bid_end_date ? (new Date().getTime() / 1000) >= house.bid_end_date : false;
    if (ended) {
      return res.status(400).json({ message: "O leilão para esta casa já terminou!" });
    }

    const minRequiredBid = Math.max(house.price || 0, (house.highest_bid || 0) + 1, 25);
    if (bidAmount < minRequiredBid) {
      return res.status(400).json({ message: `Seu lance deve ser de pelo menos ${minRequiredBid} Coins!` });
    }

    if (account.coins < bidAmount) {
      return res.status(400).json({ message: `Saldo insuficiente! Você precisa de ${bidAmount} Coins para registrar este lance.` });
    }

    if (house.highest_bid && house.bidder_name) {
      const prevBidder = await findPlayerByNameMySQL(house.bidder_name);
      if (prevBidder && prevBidder.account_id) {
        if (pool) {
          await withTransaction(async (conn) => {
            await conn.query("UPDATE accounts SET coins = coins - ? WHERE id = ?", [bidAmount, accId]);
            await conn.query("UPDATE accounts SET coins = coins + ? WHERE id = ?", [house.highest_bid, prevBidder.account_id]);
          });
        } else {
          const db = await getDBState();
          const buyerAcc = db.accounts.find(a => a.id === accId);
          if (buyerAcc) buyerAcc.coins -= bidAmount;
          const prevAcc = db.accounts.find(a => a.id === prevBidder.account_id);
          if (prevAcc) prevAcc.coins += house.highest_bid;
          await saveDBState(db);
        }
      } else if (pool) {
        await pool.query("UPDATE accounts SET coins = coins - ? WHERE id = ?", [bidAmount, accId]);
      }
    } else if (pool) {
      await pool.query("UPDATE accounts SET coins = coins - ? WHERE id = ?", [bidAmount, accId]);
    }
    account.coins -= bidAmount;

    await updateHouseBidMySQL(houseId, characterName, bidAmount);

    auditLog("HOUSES ACTION: account [{}] bid on house {} with heroe {} amount {}", accId, houseId, characterName, bidAmount);

    const updatedHouses = await getHousesMySQL();
    const updatedHouse = updatedHouses.find(h => h.id === houseId);

    res.json({
      message: `Sucesso! Seu lance de ${bidAmount} Coins usando o herói '${characterName}' foi registrado com sucesso!`,
      coins: account.coins,
      house: updatedHouse
    });
  });

  // 4. Get Bazaar Characters
  app.get("/api/bazaar", async (req, res) => {
    const listings = await getBazaarMySQL();
    res.json(listings || []);
  });

  // 5. List Character on Bazaar (with 10% tax)
  app.post("/api/bazaar/list", financialLimiter, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    const token = authHeader.substring(7);
    const accId = verifyToken(token);

    if (!accId) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    const { characterName, price } = req.body;
    const listPrice = parseInt(price);
    if (isNaN(listPrice) || listPrice < 50) {
      return res.status(400).json({ message: "O preço mínimo de venda para personagens é de 50 Coins!" });
    }

    const listingFee = Math.ceil(listPrice * 0.1);

    let account: { id: number; coins: number; name: string } | undefined;
    if (pool) {
      const [accRows] = await pool.query("SELECT id, coins, name FROM accounts WHERE id = ?", [accId]);
      if ((accRows as any[]).length > 0) account = (accRows as any[])[0];
    }
    if (!account) {
      const db = await getDBState();
      const acc = db.accounts.find(a => a.id === accId);
      if (acc) account = { id: acc.id, coins: acc.coins, name: acc.name };
    }
    if (!account) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    if (account.coins < listingFee) {
      return res.status(400).json({ message: `Saldo de coins insuficiente! O Bazaar cobra uma taxa administrativa de 10% (${listingFee} Coins) para anunciar este herói por ${listPrice} Coins. Seu saldo é de ${account.coins} Coins.` });
    }

    const player = await findPlayerByNameMySQL(characterName);
    if (!player || player.account_id !== accId) {
      return res.status(404).json({ message: "Personagem não encontrado ou não pertence a esta conta." });
    }

    if (player.online) {
      return res.status(400).json({ message: "Personagem está online. Faça logout antes de anunciar." });
    }

    if (pool) {
      await withTransaction(async (conn) => {
        await conn.query("UPDATE accounts SET coins = coins - ? WHERE id = ?", [listingFee, accId]);
      });
    } else {
      const db = await getDBState();
      const acc = db.accounts.find(a => a.id === accId);
      if (acc) acc.coins -= listingFee;
      await saveDBState(db);
    }
    account.coins -= listingFee;

    const listing = {
      id: "bz_user_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex"),
      name: player.name,
      vocation: getVocationName(player.vocation),
      level: player.level,
      gender: (player.sex === 1 ? "Masculino" : "Feminino") as "Masculino" | "Feminino",
      skills: { main: player.skill_sword || 50, shield: player.skill_shielding || 50 },
      price: listPrice,
      ownerAccountId: accId,
      ownerAccountName: account.name,
      looktype: player.sex === 1 ? 128 : 136
    };

    await createBazaarMySQL(listing);

    if (pool) {
      await pool.query("UPDATE players SET account_id = NULL WHERE id = ?", [player.id]);
    }

    auditLog("BAZAAR ACTION: account [{}] listed character {} for {} coins", accId, characterName, listPrice);

    const updatedChars = await findPlayersByAccount(accId);
    const bazaarListings = await getBazaarMySQL();

    res.json({
      message: `O herói '${characterName}' foi anunciado no Bazaar por ${listPrice} Coins! Uma taxa de 10% (${listingFee} Coins) foi debitada do seu saldo.`,
      coins: account.coins,
      characters: updatedChars,
      bazaarListings
    });
  });

  // 6. Buy Character from Bazaar
  app.post("/api/bazaar/buy", financialLimiter, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    const token = authHeader.substring(7);
    const accId = verifyToken(token);

    if (!accId) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    const { listingId } = req.body;
    const listings = await getBazaarMySQL();

    if (!listings || listings.length === 0) {
      return res.status(404).json({ message: "Nenhum personagem anunciado." });
    }

    const listing = listings.find(l => l.id === listingId);
    if (!listing) {
      return res.status(404).json({ message: "Anúncio do Bazaar não encontrado." });
    }

    let buyer: { id: number; coins: number } | undefined;
    if (pool) {
      const [buyerRows] = await pool.query("SELECT id, coins FROM accounts WHERE id = ?", [accId]);
      if ((buyerRows as any[]).length > 0) buyer = (buyerRows as any[])[0];
    }
    if (!buyer) {
      const db = await getDBState();
      const acc = db.accounts.find(a => a.id === accId);
      if (acc) buyer = { id: acc.id, coins: acc.coins };
    }
    if (!buyer) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    if (buyer.coins < (listing.price || 0)) {
      return res.status(400).json({ message: `Saldo insuficiente! Você precisa de ${listing.price} Coins para comprar este herói.` });
    }

    const prevBuyerCoins = buyer.coins;
    const sellerId = listing.owner_account_id || listing.ownerAccountId;

    // Execute financial operations atomically
    if (pool) {
      await withTransaction(async (conn) => {
        await conn.query("UPDATE accounts SET coins = coins - ? WHERE id = ?", [listing.price, accId]);
        if (sellerId && sellerId > 0) {
          await conn.query("UPDATE accounts SET coins = coins + ? WHERE id = ?", [listing.price, sellerId]);
        }
      });
    } else {
      // JSON fallback: best-effort without transaction
      const db = await getDBState();
      const buyerAcc = db.accounts.find(a => a.id === accId);
      if (buyerAcc) buyerAcc.coins -= (listing.price || 0);
      const sellerAcc = db.accounts.find(a => a.id === sellerId);
      if (sellerAcc) sellerAcc.coins += (listing.price || 0);
      await saveDBState(db);
    }
    buyer.coins -= (listing.price || 0);

    const player = await findPlayerByNameMySQL(listing.name);
    if (player && pool) {
      await pool.query("UPDATE players SET account_id = ? WHERE id = ?", [accId, player.id]);
    }

    await markBazaarSoldMySQL(listingId);

    auditLog("BAZAAR ACTION: account [{}] bought listing {}", accId, listingId);

    const updatedChars = await findPlayersByAccount(accId);
    const bazaarListings = await getBazaarMySQL();

    res.json({
      message: `Sucesso! O lendário herói '${listing.name}' agora pertence à sua conta!`,
      coins: buyer.coins,
      characters: updatedChars,
      bazaarListings
    });
  });

  // 7. Get Market Items & Stash combined
  app.get("/api/market", async (req, res) => {
    const items = await getMarketMySQL();
    res.json(items || []);
  });

  // 8. List Item on P2P Market with 10% Tax
  app.post("/api/market/list", financialLimiter, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    const token = authHeader.substring(7);
    const accId = verifyToken(token);

    if (!accId) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    const { itemId, price, characterName } = req.body;
    const listPrice = parseInt(price);
    if (isNaN(listPrice) || listPrice < 10) {
      return res.status(400).json({ message: "O preço mínimo para anunciar um item é de 10 Coins!" });
    }

    const listingFee = Math.ceil(listPrice * 0.1);

    let account: { id: number; coins: number } | undefined;
    if (pool) {
      const [accRows] = await pool.query("SELECT id, coins FROM accounts WHERE id = ?", [accId]);
      if ((accRows as any[]).length > 0) account = (accRows as any[])[0];
    }
    if (!account) {
      const db = await getDBState();
      const acc = db.accounts.find(a => a.id === accId);
      if (acc) account = { id: acc.id, coins: acc.coins };
    }
    if (!account) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    if (account.coins < listingFee) {
      return res.status(400).json({ message: `Saldo insuficiente! O Market cobra uma taxa de 10% (${listingFee} Coins) para anunciar este item por ${listPrice} Coins. Seu saldo é de ${account.coins} Coins.` });
    }

    const marketItems = await getMarketMySQL();
    const item = marketItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item do Stash não encontrado!" });
    }

    if (pool) {
      await pool.query("UPDATE accounts SET coins = coins - ? WHERE id = ?", [listingFee, accId]);
    }
    account.coins -= listingFee;

    await updateMarketItemMySQL(itemId, { status: "market", price: listPrice, sellerName: characterName || item.characterName, sellerAccountId: accId });
    if (pool) {
      await pool.query("UPDATE market_items SET characterName = '' WHERE id = ?", [itemId]);
    }

    auditLog("MARKET ACTION: account [{}] listed item {} for {} coins", accId, itemId, listPrice);

    const updatedMarketItems = await getMarketMySQL();

    res.json({
      message: `Sucesso! O item '${item.name}' foi anunciado por ${listPrice} Coins. Uma taxa de 10% (${listingFee} Coins) foi debitada do seu saldo!`,
      coins: account.coins,
      marketItems: updatedMarketItems
    });
  });

  // 9. Buy Item from Market
  app.post("/api/market/buy", financialLimiter, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    const token = authHeader.substring(7);
    const accId = verifyToken(token);

    if (!accId) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    const { itemId, activeChar } = req.body;
    const marketItems = await getMarketMySQL();

    if (!marketItems || marketItems.length === 0) {
      return res.status(404).json({ message: "Nenhum item anunciado." });
    }

    const item = marketItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item não encontrado no mercado." });
    }

    let buyer: { id: number; coins: number } | undefined;
    if (pool) {
      const [buyerRows] = await pool.query("SELECT id, coins FROM accounts WHERE id = ?", [accId]);
      if ((buyerRows as any[]).length > 0) buyer = (buyerRows as any[])[0];
    }
    if (!buyer) {
      const db = await getDBState();
      const acc = db.accounts.find(a => a.id === accId);
      if (acc) buyer = { id: acc.id, coins: acc.coins };
    }
    if (!buyer) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    if (buyer.coins < (item.price || 0)) {
      return res.status(400).json({ message: `Saldo insuficiente! Você precisa de ${item.price} Coins.` });
    }

    const playerChars = await findPlayersByAccount(accId);
    const isMyChar = playerChars.some(p => p.name === item.sellerName);
    let sellerRefund = 0;

    if (pool) {
      await withTransaction(async (conn) => {
        await conn.query("UPDATE accounts SET coins = coins - ? WHERE id = ?", [item.price || 0, accId]);
        if (isMyChar) {
          sellerRefund = Math.floor((item.price || 0) * 0.9);
          await conn.query("UPDATE accounts SET coins = coins + ? WHERE id = ?", [sellerRefund, accId]);
        } else if (item.sellerAccountId) {
          await conn.query("UPDATE accounts SET coins = coins + ? WHERE id = ?", [item.price || 0, item.sellerAccountId]);
        }
      });
    } else {
      const db = await getDBState();
      const buyerAcc = db.accounts.find(a => a.id === accId);
      if (buyerAcc) buyerAcc.coins -= (item.price || 0);
      if (isMyChar) {
        sellerRefund = Math.floor((item.price || 0) * 0.9);
        if (buyerAcc) buyerAcc.coins += sellerRefund;
      } else if (item.sellerAccountId) {
        const sellerAcc = db.accounts.find(a => a.id === item.sellerAccountId);
        if (sellerAcc) sellerAcc.coins += (item.price || 0);
      }
      await saveDBState(db);
    }
    buyer.coins -= (item.price || 0);
    if (isMyChar) buyer.coins += sellerRefund;

    await updateMarketItemMySQL(itemId, { status: "stash", price: null, sellerName: null });
    if (pool) {
      await pool.query("UPDATE market_items SET characterName = ? WHERE id = ?", [activeChar, itemId]);
    }

    const updatedMarketItems = await getMarketMySQL();

    auditLog("MARKET ACTION: account [{}] bought item {}", accId, itemId);

    res.json({
      message: isMyChar 
        ? `Sucesso! Você comprou '${item.name}' anunciado pelo seu herói '${item.sellerName}'. Como o herói é seu, as moedas voltaram para sua conta (com 10% de taxa aplicada: +${sellerRefund} Coins)!`
        : `Sucesso! Você comprou '${item.name}' de '${item.sellerName || "um jogador"}' por ${item.price} Coins. O item foi enviado para o Depot de '${activeChar}'!`,
      coins: buyer.coins,
      marketItems: updatedMarketItems
    });
  });

  // 9.5 Unlist P2P Item
  app.post("/api/market/unlist", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    const token = authHeader.substring(7);
    const accId = verifyToken(token);

    if (!accId) {
      return res.status(401).json({ message: "Sessão expirada ou inválida." });
    }

    const { itemId } = req.body;
    const marketItems = await getMarketMySQL();

    if (!marketItems || marketItems.length === 0) {
      return res.status(404).json({ message: "Nenhum item anunciado." });
    }

    const item = marketItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item não encontrado." });
    }

    const playerChars = await findPlayersByAccount(accId);
    const charNames = playerChars.map(p => p.name);
    const isOwner = charNames.includes(item.sellerName || "");

    if (!isOwner && item.sellerName !== null && item.sellerName !== undefined) {
      return res.status(403).json({ message: "Você não tem permissão para retirar este item!" });
    }

    await updateMarketItemMySQL(itemId, { status: "stash", price: null, sellerName: null });
    if (pool) {
      await pool.query("UPDATE market_items SET characterName = ? WHERE id = ?", [charNames[0] || "Sir Chapadonia Knight", itemId]);
    }

    const updatedMarketItems = await getMarketMySQL();

    res.json({
      message: `Retirado! O item '${item.name}' foi removido da venda e voltou para o Depot de '${charNames[0] || "Sir Chapadonia Knight"}'.`,
      marketItems: updatedMarketItems
    });
  });

  // Proxy for Tibia wiki item/monster/outfit sprites
  // Priority: 1) local sprites/ dir  2) CDN  3) SVG placeholder
  app.get("/api/proxy/sprite/:name", proxyLimiter, async (req, res) => {
    const name = req.params.name;
    if (!name || name.includes("..") || !/^[\w\-\.]+\.(gif|png|jpg|jpeg|webp)$/i.test(name)) {
      return res.status(400).send("Invalid filename");
    }

    const cached = spriteCache.get(name);
    if (cached) {
      res.set("Content-Type", cached.type);
      res.set("Cache-Control", "public, max-age=86400");
      return res.send(cached.data);
    }

    // 1st: Try local sprites directory (use cwd as project root since compiled to dist/)
    const projectRoot = process.cwd();
    const localPaths = [
      path.join(projectRoot, "sprites", name),
      path.join(projectRoot, "sprites", "items", name),
    ];
    for (const lp of localPaths) {
      if (fs.existsSync(lp)) {
        const ext = path.extname(name).toLowerCase();
        const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/gif";
        const data = fs.readFileSync(lp);
        spriteCache.set(name, { data, type: mime });
        res.set("Content-Type", mime);
        res.set("Cache-Control", "public, max-age=86400");
        return res.send(data);
      }
    }

    // 2nd: Try CDN
    try {
      const md5 = crypto.createHash("md5").update(name).digest("hex");
      const cdnUrl = `https://static.wikia.nocookie.net/tibia/images/${md5[0]}/${md5[0]}${md5[1]}/${name}/revision/latest?cb=1&path-prefix=en`;

      const response = await fetch(cdnUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        const altUrl = `https://static.tibia.com/images/items/${name.toLowerCase()}`;
        const altResponse = await fetch(altUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        });
        if (!altResponse.ok) {
          // 3rd: SVG placeholder for outfits
          const outfitMatch = name.match(/^Outfit_(\d+)\./i);
          if (outfitMatch) {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<rect width="64" height="64" fill="#2a1a0a" rx="4"/>
<text x="32" y="36" text-anchor="middle" fill="#c8a060" font-size="11" font-family="sans-serif">Outfit</text>
<text x="32" y="52" text-anchor="middle" fill="#c8a060" font-size="14" font-family="sans-serif" font-weight="bold">${outfitMatch[1]}</text>
</svg>`;
            res.set("Content-Type", "image/svg+xml");
            res.set("Cache-Control", "public, max-age=3600");
            return res.send(Buffer.from(svg));
          }
          return res.status(404).send("Sprite not found");
        }
        const altBuffer = Buffer.from(await altResponse.arrayBuffer());
        const altType = altResponse.headers.get("content-type") || "image/gif";
        spriteCache.set(name, { data: altBuffer, type: altType });
        res.set("Content-Type", altType);
        res.set("Cache-Control", "public, max-age=86400");
        return res.send(altBuffer);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const type = response.headers.get("content-type") || "image/gif";
      spriteCache.set(name, { data: buffer, type });
      res.set("Content-Type", type);
      res.set("Cache-Control", "public, max-age=86400");
      res.send(buffer);
    } catch (e) {
      // Last resort: SVG placeholder for outfits
      const outfitMatch = name.match(/^Outfit_(\d+)\./i);
      if (outfitMatch) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<rect width="64" height="64" fill="#2a1a0a" rx="4"/>
<text x="32" y="36" text-anchor="middle" fill="#c8a060" font-size="11" font-family="sans-serif">Outfit</text>
<text x="32" y="52" text-anchor="middle" fill="#c8a060" font-size="14" font-family="sans-serif" font-weight="bold">${outfitMatch[1]}</text>
</svg>`;
        res.set("Content-Type", "image/svg+xml");
        res.set("Cache-Control", "public, max-age=3600");
        return res.send(Buffer.from(svg));
      }
      logger.error({ sprite: name, err: e }, "Sprite proxy fetch error");
      res.status(500).send("Proxy error");
    }
  });

  // Proxy for outfit images
  // Uses TibiaWiki outfit images or falls back to placeholder
  app.get("/api/proxy/outfit/:looktype", async (req, res) => {
    const looktype = parseInt(req.params.looktype);
    if (isNaN(looktype)) {
      return res.status(400).send("Invalid looktype");
    }

    const direction = parseInt((req.query.direction as string) || "3");
    const addons = parseInt((req.query.addons as string) || "3");
    const outfitName = `Outfit_${looktype}.gif`;

    // Redirect to the sprite proxy
    res.redirect(`/api/proxy/sprite/${outfitName}`);
  });

  // Global error handler (must be last middleware)
  app.use((err: any, req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = status === 500 && process.env.NODE_ENV === "production"
      ? "Erro interno do servidor."
      : err.message || "Erro interno do servidor.";

    if (status >= 500) {
      logger.error({ err, url: req.url, method: req.method }, "Server error");
    }

    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ message: "JSON inválido no corpo da requisição." });
    }

    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Dados inválidos.",
        errors: (err as any).issues?.map((i: any) => ({ field: i.path.join("."), message: i.message })),
      });
    }

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // Serve sprites/ directory directly (bypass proxy for outfit images)
  const projectRoot = process.cwd();
  if (fs.existsSync(path.join(projectRoot, "sprites"))) {
    app.use("/sprites", express.static(path.join(projectRoot, "sprites")));
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Use dist/ when running from project root (e.g., tsx server.ts with NODE_ENV=production)
    // or directly when running node dist/server.cjs (__dirname is already dist/)
    const distPath = fs.existsSync(path.join(__dirname, "dist", "index.html"))
      ? path.join(__dirname, "dist")
      : __dirname;
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "127.0.0.1", () => {
    logger.info({ port: PORT, build: new Date().toISOString().slice(0,10) }, "Server started");
  });
}

startServer();

