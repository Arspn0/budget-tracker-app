import db from '../../api/db';

export class WalletRepository {
  static async getAll() {
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM wallets ORDER BY created_at ASC'
      );
      return result;
    } catch (error) {
      console.error('Error getting wallets:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM wallets WHERE id = ?',
        [id]
      );
      return result;
    } catch (error) {
      console.error('Error getting wallet by id:', error);
      throw error;
    }
  }

  static async create(wallet) {
    try {
      const result = await db.runAsync(
        `INSERT INTO wallets (name, type, balance, icon, color)
         VALUES (?, ?, ?, ?, ?)`,
        [
          wallet.name,
          wallet.type,
          wallet.balance || 0,
          wallet.icon || 'wallet',
          wallet.color || '#3ED6C4',
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  static async update(id, wallet) {
    try {
      await db.runAsync(
        `UPDATE wallets 
         SET name = ?, type = ?, balance = ?, icon = ?, color = ?
         WHERE id = ?`,
        [wallet.name, wallet.type, wallet.balance, wallet.icon, wallet.color, id]
      );
      return id;
    } catch (error) {
      console.error('Error updating wallet:', error);
      throw error;
    }
  }

  static async updateBalance(id, amount) {
    try {
      await db.runAsync(
        'UPDATE wallets SET balance = balance + ? WHERE id = ?',
        [amount, id]
      );
      return id;
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.runAsync('DELETE FROM wallets WHERE id = ?', [id]);
      return id;
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  }

  static async getTotalBalance() {
    try {
      const result = await db.getFirstAsync(
        'SELECT SUM(balance) as total FROM wallets'
      );
      return result?.total || 0;
    } catch (error) {
      console.error('Error getting total balance:', error);
      throw error;
    }
  }
}