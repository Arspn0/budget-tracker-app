import db from '../../api/db';

export class SavingRepository {
  static async getAll() {
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM savings ORDER BY created_at DESC'
      );
      return result;
    } catch (error) {
      console.error('Error getting savings:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM savings WHERE id = ?',
        [id]
      );
      return result;
    } catch (error) {
      console.error('Error getting saving by id:', error);
      throw error;
    }
  }

  static async create(saving) {
    try {
      const result = await db.runAsync(
        `INSERT INTO savings (name, target_amount, current_amount, deadline, icon, color)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          saving.name,
          saving.target_amount,
          saving.current_amount || 0,
          saving.deadline || null,
          saving.icon || 'piggy-bank',
          saving.color || '#3ED6C4',
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating saving:', error);
      throw error;
    }
  }

  static async update(id, saving) {
    try {
      await db.runAsync(
        `UPDATE savings 
         SET name = ?, target_amount = ?, deadline = ?, icon = ?, color = ?
         WHERE id = ?`,
        [
          saving.name,
          saving.target_amount,
          saving.deadline,
          saving.icon,
          saving.color,
          id,
        ]
      );
      return id;
    } catch (error) {
      console.error('Error updating saving:', error);
      throw error;
    }
  }

  static async updateAmount(id, amount) {
    try {
      await db.runAsync(
        'UPDATE savings SET current_amount = current_amount + ? WHERE id = ?',
        [amount, id]
      );
      return id;
    } catch (error) {
      console.error('Error updating saving amount:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.runAsync('DELETE FROM savings WHERE id = ?', [id]);
      return id;
    } catch (error) {
      console.error('Error deleting saving:', error);
      throw error;
    }
  }

  static async getSavingTransactions(savingId) {
    try {
      const result = await db.getAllAsync(
        `SELECT * FROM saving_transactions 
         WHERE saving_id = ? 
         ORDER BY date DESC, created_at DESC`,
        [savingId]
      );
      return result;
    } catch (error) {
      console.error('Error getting saving transactions:', error);
      throw error;
    }
  }

  static async addSavingTransaction(transaction) {
    try {
      // Insert transaction
      const result = await db.runAsync(
        `INSERT INTO saving_transactions (saving_id, type, amount, note, date)
         VALUES (?, ?, ?, ?, ?)`,
        [
          transaction.saving_id,
          transaction.type,
          transaction.amount,
          transaction.note || null,
          transaction.date,
        ]
      );

      // Update saving amount
      const amountChange = transaction.type === 'deposit' 
        ? transaction.amount 
        : -transaction.amount;
      
      await db.runAsync(
        'UPDATE savings SET current_amount = current_amount + ? WHERE id = ?',
        [amountChange, transaction.saving_id]
      );

      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error adding saving transaction:', error);
      throw error;
    }
  }
}