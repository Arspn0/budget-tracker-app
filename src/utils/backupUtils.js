import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import db from '../api/db';

// ─── Export entire database to JSON ────────────────────────────────────────
export const exportBackup = async () => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Fetch all data from all tables
    const [
      wallets,
      categories,
      transactions,
      savings,
      savingTransactions,
      budgets,
      settings,
    ] = await Promise.all([
      db.getAllAsync('SELECT * FROM wallets'),
      db.getAllAsync('SELECT * FROM categories'),
      db.getAllAsync('SELECT * FROM transactions'),
      db.getAllAsync('SELECT * FROM savings'),
      db.getAllAsync('SELECT * FROM saving_transactions'),
      db.getAllAsync('SELECT * FROM budgets'),
      db.getAllAsync('SELECT * FROM settings'),
    ]);

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        wallets,
        categories,
        transactions,
        savings,
        savingTransactions,
        budgets,
        settings,
      },
    };

    const json = JSON.stringify(backup, null, 2);
    const path = `${FileSystem.documentDirectory}budget-tracker-backup-${timestamp}.json`;

    await FileSystem.writeAsStringAsync(path, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(path, {
        mimeType: 'application/json',
        dialogTitle: 'Simpan Backup',
      });
    }

    return { success: true, path, recordCount: getTotalRecords(backup.data) };
  } catch (error) {
    console.error('Export backup error:', error);
    throw error;
  }
};

// ─── Import backup from JSON file ──────────────────────────────────────────
export const importBackup = async () => {
  try {
    // Pick file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { success: false, message: 'Dibatalkan' };
    }

    // Read file
    const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const backup = JSON.parse(content);

    // Validate backup structure
    if (!backup.version || !backup.data) {
      throw new Error('Format backup tidak valid');
    }

    // Clear existing data (optional - bisa dikasih konfirmasi dulu)
    await clearAllData();

    // Insert data
    const { data } = backup;

    // 1. Wallets
    for (const w of data.wallets || []) {
      await db.runAsync(
        `INSERT INTO wallets (id, name, type, balance, icon, color, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [w.id, w.name, w.type, w.balance, w.icon, w.color, w.created_at]
      );
    }

    // 2. Categories
    for (const c of data.categories || []) {
      await db.runAsync(
        `INSERT INTO categories (id, name, type, icon, color, is_custom, parent_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.type, c.icon, c.color, c.is_custom, c.parent_id, c.created_at]
      );
    }

    // 3. Transactions
    for (const t of data.transactions || []) {
      await db.runAsync(
        `INSERT INTO transactions (id, type, amount, category_id, wallet_id, date, note, photo_uri, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.type, t.amount, t.category_id, t.wallet_id, t.date, t.note, t.photo_uri, t.created_at]
      );
    }

    // 4. Savings
    for (const s of data.savings || []) {
      await db.runAsync(
        `INSERT INTO savings (id, name, target_amount, current_amount, deadline, icon, color, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.name, s.target_amount, s.current_amount, s.deadline, s.icon, s.color, s.created_at]
      );
    }

    // 5. Saving Transactions
    for (const st of data.savingTransactions || []) {
      await db.runAsync(
        `INSERT INTO saving_transactions (id, saving_id, type, amount, note, date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [st.id, st.saving_id, st.type, st.amount, st.note, st.date, st.created_at]
      );
    }

    // 6. Budgets
    for (const b of data.budgets || []) {
      await db.runAsync(
        `INSERT INTO budgets (id, category_id, limit_amount, period, month, year, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [b.id, b.category_id, b.limit_amount, b.period, b.month, b.year, b.created_at]
      );
    }

    // 7. Settings
    for (const s of data.settings || []) {
      await db.runAsync(
        `INSERT INTO settings (key, value) VALUES (?, ?)`,
        [s.key, s.value]
      );
    }

    return {
      success: true,
      recordCount: getTotalRecords(data),
      timestamp: backup.timestamp,
    };
  } catch (error) {
    console.error('Import backup error:', error);
    throw error;
  }
};

// ─── Clear all data from database ──────────────────────────────────────────
const clearAllData = async () => {
  await db.runAsync('DELETE FROM saving_transactions');
  await db.runAsync('DELETE FROM savings');
  await db.runAsync('DELETE FROM budgets');
  await db.runAsync('DELETE FROM transactions');
  await db.runAsync('DELETE FROM categories WHERE is_custom = 1'); // Keep default
  await db.runAsync('DELETE FROM wallets');
  await db.runAsync('DELETE FROM settings');
};

// ─── Get total record count ────────────────────────────────────────────────
const getTotalRecords = (data) => {
  return (
    (data.wallets?.length || 0) +
    (data.categories?.length || 0) +
    (data.transactions?.length || 0) +
    (data.savings?.length || 0) +
    (data.savingTransactions?.length || 0) +
    (data.budgets?.length || 0) +
    (data.settings?.length || 0)
  );
};

// ─── Get backup stats ──────────────────────────────────────────────────────
export const getBackupStats = async () => {
  try {
    const [
      walletCount,
      txCount,
      savingCount,
      budgetCount,
    ] = await Promise.all([
      db.getFirstAsync('SELECT COUNT(*) as count FROM wallets'),
      db.getFirstAsync('SELECT COUNT(*) as count FROM transactions'),
      db.getFirstAsync('SELECT COUNT(*) as count FROM savings'),
      db.getFirstAsync('SELECT COUNT(*) as count FROM budgets'),
    ]);

    return {
      wallets: walletCount?.count || 0,
      transactions: txCount?.count || 0,
      savings: savingCount?.count || 0,
      budgets: budgetCount?.count || 0,
      total: (walletCount?.count || 0) + (txCount?.count || 0) + 
             (savingCount?.count || 0) + (budgetCount?.count || 0),
    };
  } catch (e) {
    console.error('Get backup stats error:', e);
    return { wallets: 0, transactions: 0, savings: 0, budgets: 0, total: 0 };
  }
};