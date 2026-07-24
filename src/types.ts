export interface ConfigState {
  serverName: string;
  phpVersion: string;
  dbHost: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  serverPath: string;
  contactEmail: string;
  defaultTemplate: string;
  encryptionType: "sha1" | "sha256" | "bcrypt";
  coinColumnName: "premium_points" | "coins" | "custom";
  coinColumnCustom: string;
  experienceRate: number;
  serverVipBonus: number;
}

export interface PlayerCharacter {
  name: string;
  vocation: string;
  level: number;
  gender: "Masculino" | "Feminino";
  skills: { main: number; shield: number };
  online: boolean;
  premium: boolean;
  looktype?: number;
}

export interface BazaarCharacter {
  id: string;
  name: string;
  vocation: string;
  level: number;
  gender: "Masculino" | "Feminino";
  skills: { main: number; shield: number };
  price: number;
  ownerAccount: string;
  looktype?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "equipamento" | "runas" | "premium" | "outfits";
  sprite: string;
  colorClass: string;
}

export interface StashItem {
  id: string;
  name: string;
  sprite: string;
  stats: string;
  characterName: string;
  status: "stash" | "market";
  price?: number;
  sellerName?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  category: "HOT" | "EVENTO" | "UPDATE" | "AVISO";
  content: string;
  bullets?: string[];
  date: string;
  author: string;
}

export interface CharacterDetails {
  equipment: {
    helmet: { name: string; sprite: string; desc: string };
    amulet: { name: string; sprite: string; desc: string };
    weapon: { name: string; sprite: string; desc: string };
    armor: { name: string; sprite: string; desc: string };
    shield: { name: string; sprite: string; desc: string };
    ring: { name: string; sprite: string; desc: string };
    legs: { name: string; sprite: string; desc: string };
    boots: { name: string; sprite: string; desc: string };
    backpack: { name: string; sprite: string; desc: string };
  };
  skills: {
    magicLevel: number;
    fist: number;
    club: number;
    sword: number;
    axe: number;
    distance: number;
    shielding: number;
    fishing: number;
  };
  outfit: {
    name: string;
    description: string;
    colors: string;
    preview: string;
  };
  mounts: Array<{ name: string; sprite: string; speedBonus: string }>;
  depotItems: Array<{ name: string; sprite: string; qty: number; desc: string }>;
}

export interface AccountInfo {
  account: {
    id: number;
    name: string;
    email: string;
    type: number;
    premdays: number;
    creation: number;
    coins: number;
    hasRecoveryKey?: boolean;
  };
  characters: Array<{
    id: number;
    name: string;
    level: number;
    vocation: number;
    town_id: number;
    sex: number;
    lastlogin: number;
  }>;
}

export interface ServerInfo {
  playersOnline: number;
  playersRecord: number;
  totalAccounts: number;
  totalPlayers: number;
}

export interface BoostedCreatureInfo {
  name: string;
  looktype: number;
  looktypeEx?: number;
  raceid: number;
  type: string;
  bonusExp: string;
}

export interface BoostedBossInfo {
  name: string;
  looktype: number;
  looktypeEx: number;
  raceid: number;
  type: string;
  bonusLoot: string;
}

export interface OnlinePlayer {
  player_id: number;
  name: string;
  level: number;
  vocation: number;
}

export interface HighscorePlayer {
  id: number;
  name: string;
  level: number;
  vocation: number;
  experience: number;
  town_id: number;
  sex: number;
  looktype: number;
}

export interface PlayerDetails {
  id: number;
  name: string;
  level: number;
  vocation: number;
  experience: number;
  health: number;
  healthmax: number;
  mana: number;
  manamax: number;
  cap: number;
  soul: number;
  maglevel: number;
  townName: string;
  sex: number;
  balance: number;
  onlinetime: number;
  skill_fist: number;
  skill_club: number;
  skill_sword: number;
  skill_axe: number;
  skill_dist: number;
  skill_shielding: number;
  skill_fishing: number;
  looktype: number;
  deaths: Array<{
    time: number;
    level: number;
    killed_by?: string;
    is_player?: number;
    mostdamage_by?: string;
    mostdamage_is_player?: number;
  }>;
}

export interface RecentDeath {
  player_id: number;
  player_name: string;
  time: number;
  level: number;
  killed_by: string;
  is_player: number;
  mostdamage_by?: string;
  mostdamage_is_player?: number;
  looktype?: number;
  vocation?: number;
  sex?: number;
}

export interface AdminConfig {
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

export interface Guild {
  id: number;
  name: string;
  logoColor: string;
  description: string;
  founded: string;
  guildHall: string;
  logoChar: string;
  members: Array<{ 
    name: string; 
    rank: string;
    vocation: number;
    level: number;
    online: boolean;
  }>;
  totalPower?: number;
  memberCount?: number;
  averageLevel?: number;
  leaderName?: string;
}

export interface HouseBid {
  bidder: string; // bidder's character name
  amount: number; // bid in coins
  date: string; // ISO string or formatted date
}

export interface House {
  id: number;
  name: string;
  town: "Thais" | "Venore" | "Carlin" | "Edron";
  size: number; // sqm
  rent: number; // gold/month
  beds: number;
  owner: string | null; // null means in auction
  price: number; // current minimum price or current highest bid
  currentBid: number; // highest bid amount
  highestBidder: string | null; // highest bidder character name
  auctionEnd: string; // ISO string representing when the auction ends (Server Save)
  bids: HouseBid[]; // bidding history
  mapX: number; // mini-map X % position
  mapY: number; // mini-map Y % position
}
