import db from '../../api/db';

export class TransactionRepository {
  static async getAll(limit = 100, offset = 0) {
    try {
      return await db.getAllAsync(
        `SELECT t.*, c.name as category_name, c.icon as category_icon,
                c.color as category_color, w.name as wallet_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN wallets w ON t.wallet_id = w.id
         ORDER BY t.date DESC, t.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  static async getByDateRange(startDate, endDate) {
    try {
      return await db.getAllAsync(
        `SELECT t.*, c.name as category_name, c.icon as category_icon,
                c.color as category_color, w.name as wallet_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN wallets w ON t.wallet_id = w.id
         WHERE t.date BETWEEN ? AND ?
         ORDER BY t.date DESC, t.created_at DESC`,
        [startDate, endDate]
      );
    } catch (error) {
      console.error('Error getting transactions by date range:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      return await db.getFirstAsync(
        `SELECT t.*, c.name as category_name, c.icon as category_icon,
                c.color as category_color, w.name as wallet_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN wallets w ON t.wallet_id = w.id
         WHERE t.id = ?`,
        [id]
      );
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
      const rows = await db.getAllAsync(
        `SELECT type, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
         FROM transactions
         WHERE date BETWEEN ? AND ?
         GROUP BY type`,
        [startDate, endDate]
      );

      const summary = { income: 0, expense: 0, balance: 0 };
      for (const row of rows) {
        if (row.type === 'income') summary.income = row.total;
        else summary.expense = row.total;
      }
      summary.balance = summary.income - summary.expense;
      return summary;
    } catch (error) {
      console.error('Error getting summary:', error);
      throw error;
    }
  }

  // ─── FIX BUG 6: GROUP BY category_id so same category on different days
  //     is counted as ONE entry, not multiple ───────────────────────────────
  static async getByCategory(startDate, endDate, type = 'expense') {
    try {
      return await db.getAllAsync(
        `SELECT
           c.id,
           c.name,
           c.icon,
           c.color,
           SUM(t.amount)  AS total,
           COUNT(t.id)    AS count
         FROM transactions t
         JOIN categories c ON t.category_id = c.id
         WHERE t.date BETWEEN ? AND ?
           AND t.type = ?
         GROUP BY c.id, c.name, c.icon, c.color
         ORDER BY total DESC`,
        [startDate, endDate, type]
      );
    } catch (error) {
      console.error('Error getting by category:', error);
      throw error;
    }
  }

  // ─── Helper for weekly data used by HomeScreen chart ───────────────────
  static async getWeeklyData() {
    try {
      const today = new Date();
      const days = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
      }

      const startDate = days[0];
      const endDate = days[days.length - 1];

      const rows = await db.getAllAsync(
        `SELECT date, type, COALESCE(SUM(amount), 0) as total
         FROM transactions
         WHERE date BETWEEN ? AND ?
         GROUP BY date, type
         ORDER BY date ASC`,
        [startDate, endDate]
      );

      const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

      return days.map((dateStr) => {
        const dayOfWeek = new Date(dateStr).getDay();
        const incomeRow = rows.find(r => r.date === dateStr && r.type === 'income');
        const expenseRow = rows.find(r => r.date === dateStr && r.type === 'expense');

        return {
          label: dayLabels[dayOfWeek],
          income: incomeRow?.total ?? 0,
          expense: expenseRow?.total ?? 0,
        };
      });
    } catch (error) {
      console.error('Error getting weekly data:', error);
      return [];
    }
  }
}