import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('budget_tracker.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Wallets Table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS wallets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          balance REAL DEFAULT 0,
          icon TEXT,
          color TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Categories Table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          icon TEXT,
          color TEXT,
          is_custom INTEGER DEFAULT 0,
          parent_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Transactions Table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS transactions (
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
        );`
      );

      // Savings Table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS savings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          target_amount REAL NOT NULL,
          current_amount REAL DEFAULT 0,
          deadline DATE,
          icon TEXT,
          color TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Saving Transactions Table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS saving_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          saving_id INTEGER,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          note TEXT,
          date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (saving_id) REFERENCES savings(id)
        );`
      );

      // Budgets Table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER,
          limit_amount REAL NOT NULL,
          period TEXT DEFAULT 'monthly',
          month INTEGER,
          year INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        );`
      );

      // Settings Table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );`
      );

      // Insert default categories
      const defaultCategories = [
        // Expense categories
        ['Makanan & Minuman', 'expense', 'utensils', '#FF6B6B', 0, null],
        ['Transport', 'expense', 'car', '#4ECDC4', 0, null],
        ['Belanja', 'expense', 'shopping-bag', '#95E1D3', 0, null],
        ['Tagihan', 'expense', 'receipt', '#F38181', 0, null],
        ['Hiburan', 'expense', 'film', '#AA96DA', 0, null],
        ['Kesehatan', 'expense', 'heart', '#FCBAD3', 0, null],
        ['Pendidikan', 'expense', 'book', '#A8D8EA', 0, null],
        ['Lainnya', 'expense', 'more-horizontal', '#9FA5B4', 0, null],
        
        // Income categories
        ['Gaji', 'income', 'briefcase', '#4CAF50', 0, null],
        ['Bonus', 'income', 'gift', '#8BC34A', 0, null],
        ['Investasi', 'income', 'trending-up', '#CDDC39', 0, null],
        ['Lainnya', 'income', 'dollar-sign', '#9FA5B4', 0, null],
      ];

      defaultCategories.forEach(category => {
        tx.executeSql(
          'INSERT OR IGNORE INTO categories (name, type, icon, color, is_custom, parent_id) VALUES (?, ?, ?, ?, ?, ?)',
          category
        );
      });

      // Insert default wallet
      tx.executeSql(
        'INSERT OR IGNORE INTO wallets (id, name, type, balance, icon, color) VALUES (1, ?, ?, 0, ?, ?)',
        ['Dompet Utama', 'cash', 'wallet', '#3ED6C4']
      );

    }, reject, resolve);
  });
};

export default db;