import db from '../../api/db';

export class TransactionRepository {
  static async getAll(limit = 100, offset = 0) {
    try {
      const result = await db.getAllAsync(
        `SELECT t.*, c.name as category_name, c.icon as category_icon, 
         c.color as category_color, w.name as wallet_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN wallets w ON t.wallet_id = w.id
         ORDER BY t.date DESC, t.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return result;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  static async getByDateRange(startDate, endDate) {
    try {
      const result = await db.getAllAsync(
        `SELECT t.*, c.name as category_name, c.icon as category_icon,
         c.color as category_color, w.name as wallet_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN wallets w ON t.wallet_id = w.id
         WHERE t.date BETWEEN ? AND ?
         ORDER BY t.date DESC, t.created_at DESC`,
        [startDate, endDate]
      );
      return result;
    } catch (error) {
      console.error('Error getting transactions by date range:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.getFirstAsync(
        `SELECT t.*, c.name as category_name, c.icon as category_icon,
         c.color as category_color, w.name as wallet_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN wallets w ON t.wallet_id = w.id
         WHERE t.id = ?`,
        [id]
      );
      return result;
    } catch (error) {
      console.error('Error getting transaction by id:', error);
      throw error;
    }
  }

  static async create(transaction) {
    try {
      const result = await db.runAsync(
        `INSERT INTO transactions (type, amount, category_id, wallet_id, date, note, photo_uri)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          transaction.type,
          transaction.amount,
          transaction.category_id,
          transaction.wallet_id,
          transaction.date,
          transaction.note || null,
          transaction.photo_uri || null,
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async update(id, transaction) {
    try {
      await db.runAsync(
        `UPDATE transactions 
         SET type = ?, amount = ?, category_id = ?, wallet_id = ?, 
             date = ?, note = ?, photo_uri = ?
         WHERE id = ?`,
        [
          transaction.type,
          transaction.amount,
          transaction.category_id,
          transaction.wallet_id,
          transaction.date,
          transaction.note || null,
          transaction.photo_uri || null,
          id,
        ]
      );
      return id;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
      return id;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  static async getSummary(startDate, endDate) {
    try {
      const result = await db.getAllAsync(
        `SELECT 
           type,
           SUM(amount) as total,
           COUNT(*) as count
         FROM transactions
         WHERE date BETWEEN ? AND ?
         GROUP BY type`,
        [startDate, endDate]
      );

      const summary = {
        income: 0,
        expense: 0,
        balance: 0,
      };

      result.forEach(item => {
        if (item.type === 'income') {
          summary.income = item.total || 0;
        } else {
          summary.expense = item.total || 0;
        }
      });

      summary.balance = summary.income - summary.expense;
      return summary;
    } catch (error) {
      console.error('Error getting summary:', error);
      throw error;
    }
  }

  static async getByCategory(startDate, endDate, type = 'expense') {
    try {
      const result = await db.getAllAsync(
        `SELECT 
           c.id, c.name, c.icon, c.color,
           SUM(t.amount) as total,
           COUNT(*) as count
         FROM transactions t
         JOIN categories c ON t.category_id = c.id
         WHERE t.date BETWEEN ? AND ? AND t.type = ?
         GROUP BY c.id
         ORDER BY total DESC`,
        [startDate, endDate, type]
      );
      return result;
    } catch (error) {
      console.error('Error getting by category:', error);
      throw error;
    }
  }
}