import db from '../../api/db';

export class BudgetRepository {
  static async getAll(month, year) {
    try {
      const result = await db.getAllAsync(
        `SELECT b.*, c.name as category_name, c.icon as category_icon,
                c.color as category_color
         FROM budgets b
         JOIN categories c ON b.category_id = c.id
         WHERE b.month = ? AND b.year = ?
         ORDER BY b.created_at DESC`,
        [month, year]
      );
      return result;
    } catch (error) {
      console.error('Error getting budgets:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.getFirstAsync(
        `SELECT b.*, c.name as category_name, c.icon as category_icon,
                c.color as category_color
         FROM budgets b
         JOIN categories c ON b.category_id = c.id
         WHERE b.id = ?`,
        [id]
      );
      return result;
    } catch (error) {
      console.error('Error getting budget by id:', error);
      throw error;
    }
  }

  static async create(budget) {
    try {
      const result = await db.runAsync(
        `INSERT INTO budgets (category_id, limit_amount, period, month, year)
         VALUES (?, ?, ?, ?, ?)`,
        [
          budget.category_id,
          budget.limit_amount,
          budget.period || 'monthly',
          budget.month,
          budget.year,
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  static async update(id, budget) {
    try {
      await db.runAsync(
        'UPDATE budgets SET limit_amount = ? WHERE id = ?',
        [budget.limit_amount, id]
      );
      return id;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
      return id;
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  // ─── FIX BUG 3: Correct date range for monthly spent calculation ───
  static async getSpentAmount(categoryId, month, year) {
    try {
      // Build first and last day of the month correctly
      const mm = String(month).padStart(2, '0');
      const startDate = `${year}-${mm}-01`;

      // Last day: go to first day of NEXT month, then subtract 1 day via SQLite
      const result = await db.getFirstAsync(
        `SELECT COALESCE(SUM(amount), 0) as spent
         FROM transactions
         WHERE category_id = ?
           AND type = 'expense'
           AND date >= ?
           AND date < date(?, '+1 month')`,
        [categoryId, startDate, startDate]
      );

      return result?.spent ?? 0;
    } catch (error) {
      console.error('Error getting spent amount:', error);
      throw error;
    }
  }
}