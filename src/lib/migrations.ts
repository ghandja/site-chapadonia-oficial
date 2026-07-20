import type mysql from "mysql2/promise";

interface Migration {
  id: number;
  name: string;
  up: (pool: mysql.Pool) => Promise<void>;
}

const migrations: Migration[] = [
  {
    id: 1,
    name: "initial_schema",
    up: async () => {},
  },
  {
    id: 2,
    name: "add_audit_log",
    up: async (pool: mysql.Pool) => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id INT AUTO_INCREMENT PRIMARY KEY,
          action VARCHAR(100) NOT NULL,
          account_id INT,
          details JSON,
          ip VARCHAR(45),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX audit_action (action),
          INDEX audit_account (account_id),
          INDEX audit_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    },
  },
  {
    id: 3,
    name: "add_sprite_config",
    up: async (pool: mysql.Pool) => {
      await pool.query(`
        INSERT IGNORE INTO server_config (config, value) VALUES
        ('outfitImagesUrl', ''),
        ('boostedCreatureName', 'Dragon Lord'),
        ('boostedCreatureLooktype', '39')
      `);
    },
  },
];

const MIGRATIONS_TABLE = "schema_migrations";

export async function runMigrations(pool: mysql.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id INT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  const [rows] = await pool.query(`SELECT id FROM ${MIGRATIONS_TABLE}`);
  const applied = new Set((rows as any[]).map((r: any) => r.id));

  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;
    try {
      await migration.up(pool);
      await pool.query(`INSERT INTO ${MIGRATIONS_TABLE} (id, name) VALUES (?, ?)`, [migration.id, migration.name]);
      console.log(`[MIGRATION] Applied ${migration.id}: ${migration.name}`);
    } catch (err) {
      console.error(`[MIGRATION] Failed ${migration.id}: ${migration.name}`, err);
      throw err;
    }
  }
}
