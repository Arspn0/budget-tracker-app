import * as SQLite from 'expo-sqlite';

// Untuk Expo SDK 51+
const db = SQLite.openDatabaseSync('budget_tracker.db');

export const initDatabase = async () => {
  try {
    // Wallets Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        balance REAL DEFAULT 0,
        icon TEXT,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Categories Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        is_custom INTEGER DEFAULT 0,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Transactions Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category_id INTEGER,
        wallet_id INTEGER,
        date DATE NOT NULL,
        note TEXT,
        photo_uri TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (wallet_id) REFERENCES wallets(id)
      );
    `);

    // Savings Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS savings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        deadline DATE,
        icon TEXT,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Saving Transactions Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS saving_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        saving_id INTEGER,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        note TEXT,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (saving_id) REFERENCES savings(id)
      );
    `);

    // Budgets Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        limit_amount REAL NOT NULL,
        period TEXT DEFAULT 'monthly',
        month INTEGER,
        year INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `);

    // Settings Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // Insert default categories
    const defaultCategories = [
      // Expense categories
      { name: 'Makanan & Minuman', type: 'expense', icon: 'utensils', color: '#FF6B6B' },
      { name: 'Transport', type: 'expense', icon: 'car', color: '#4ECDC4' },
      { name: 'Belanja', type: 'expense', icon: 'shopping-bag', color: '#95E1D3' },
      { name: 'Tagihan', type: 'expense', icon: 'receipt', color: '#F38181' },
      { name: 'Hiburan', type: 'expense', icon: 'film', color: '#AA96DA' },
      { name: 'Kesehatan', type: 'expense', icon: 'heart', color: '#FCBAD3' },
      { name: 'Pendidikan', type: 'expense', icon: 'book', color: '#A8D8EA' },
      { name: 'Lainnya', type: 'expense', icon: 'more-horizontal', color: '#9FA5B4' },
      
      // Income categories
      { name: 'Gaji', type: 'income', icon: 'briefcase', color: '#4CAF50' },
      { name: 'Bonus', type: 'income', icon: 'gift', color: '#8BC34A' },
      { name: 'Investasi', type: 'income', icon: 'trending-up', color: '#CDDC39' },
      { name: 'Lainnya', type: 'income', icon: 'dollar-sign', color: '#9FA5B4' },
    ];

    for (const category of defaultCategories) {
      await db.runAsync(
        'INSERT OR IGNORE INTO categories (name, type, icon, color, is_custom, parent_id) VALUES (?, ?, ?, ?, 0, NULL)',
        [category.name, category.type, category.icon, category.color]
      );
    }

    // Insert default wallet
    await db.runAsync(
      'INSERT OR IGNORE INTO wallets (id, name, type, balance, icon, color) VALUES (1, ?, ?, 0, ?, ?)',
      ['Dompet Utama', 'cash', 'wallet', '#3ED6C4']
    );

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

export default db;