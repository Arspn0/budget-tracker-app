import * as SQLite from 'expo-sqlite';

// Open database synchronously
const db = SQLite.openDatabaseSync('budget_tracker.db');

export const initDatabase = async () => {
  try {
    // Enable WAL mode for better performance
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // ── Wallets ──────────────────────────────────────────────────────────
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS wallets (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        type       TEXT    NOT NULL,
        balance    REAL    DEFAULT 0,
        icon       TEXT,
        color      TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Categories ───────────────────────────────────────────────────────
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        type       TEXT    NOT NULL,
        icon       TEXT,
        color      TEXT,
        is_custom  INTEGER DEFAULT 0,
        parent_id  INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, type)
      );
    `);

    // ── Transactions ─────────────────────────────────────────────────────
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        type        TEXT NOT NULL,
        amount      REAL NOT NULL,
        category_id INTEGER,
        wallet_id   INTEGER,
        date        DATE NOT NULL,
        note        TEXT,
        photo_uri   TEXT,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (wallet_id)   REFERENCES wallets(id)
      );
    `);

    // ── Savings ──────────────────────────────────────────────────────────
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS savings (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        name           TEXT NOT NULL,
        target_amount  REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        deadline       DATE,
        icon           TEXT,
        color          TEXT,
        created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Saving Transactions ──────────────────────────────────────────────
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS saving_transactions (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        saving_id  INTEGER,
        type       TEXT NOT NULL,
        amount     REAL NOT NULL,
        note       TEXT,
        date       DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (saving_id) REFERENCES savings(id)
      );
    `);

    // ── Budgets ──────────────────────────────────────────────────────────
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id  INTEGER,
        limit_amount REAL    NOT NULL,
        period       TEXT    DEFAULT 'monthly',
        month        INTEGER,
        year         INTEGER,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `);

    // ── Settings ─────────────────────────────────────────────────────────
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // ── Seed default categories (INSERT OR IGNORE = no duplicates) ───────
    const defaultCategories = [
      ['Makanan & Minuman', 'expense', 'utensils',        '#FF6B6B'],
      ['Transport',         'expense', 'car',              '#4ECDC4'],
      ['Belanja',           'expense', 'shopping-bag',     '#95E1D3'],
      ['Tagihan',           'expense', 'receipt',          '#F38181'],
      ['Hiburan',           'expense', 'film',             '#AA96DA'],
      ['Kesehatan',         'expense', 'heart',            '#FCBAD3'],
      ['Pendidikan',        'expense', 'book',             '#A8D8EA'],
      ['Lainnya',           'expense', 'more-horizontal',  '#9FA5B4'],
      ['Gaji',              'income',  'briefcase',        '#4CAF50'],
      ['Bonus',             'income',  'gift',             '#8BC34A'],
      ['Investasi',         'income',  'trending-up',      '#CDDC39'],
      ['Lainnya',           'income',  'dollar-sign',      '#9FA5B4'],
    ];

    for (const [name, type, icon, color] of defaultCategories) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (name, type, icon, color, is_custom, parent_id)
         VALUES (?, ?, ?, ?, 0, NULL)`,
        [name, type, icon, color]
      );
    }

    // ── Seed default wallet (only once) ──────────────────────────────────
    const walletCount = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM wallets'
    );
    if ((walletCount?.count ?? 0) === 0) {
      await db.runAsync(
        `INSERT INTO wallets (name, type, balance, icon, color)
         VALUES (?, ?, 0, ?, ?)`,
        ['Dompet Utama', 'cash', 'wallet', '#3ED6C4']
      );
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database init error:', error);
    throw error;
  }
};

export default db;