import db from '../../api/db';

export class CategoryRepository {
  static async getAll(type = null) {
    try {
      const query = type
        ? 'SELECT * FROM categories WHERE type = ? ORDER BY is_custom ASC, name ASC'
        : 'SELECT * FROM categories ORDER BY type, is_custom ASC, name ASC';
      const params = type ? [type] : [];

      const result = await db.getAllAsync(query, params);
      return result;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      return result;
    } catch (error) {
      console.error('Error getting category by id:', error);
      throw error;
    }
  }

  static async create(category) {
    try {
      const result = await db.runAsync(
        `INSERT INTO categories (name, type, icon, color, is_custom, parent_id)
         VALUES (?, ?, ?, ?, 1, ?)`,
        [
          category.name,
          category.type,
          category.icon || 'tag',
          category.color || '#9FA5B4',
          category.parent_id || null,
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  static async update(id, category) {
    try {
      await db.runAsync(
        `UPDATE categories 
         SET name = ?, icon = ?, color = ?
         WHERE id = ?`,
        [category.name, category.icon, category.color, id]
      );
      return id;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.runAsync(
        'DELETE FROM categories WHERE id = ? AND is_custom = 1',
        [id]
      );
      return id;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}