import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const updateUserCredentials = async (userId, updates) => {
  const { username, password, currentPassword, requesterId } = updates;
  
  // If updating own account, verify current password
  if (userId === requesterId && currentPassword) {
    const userCheck = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      throw new AppError('User not found', 404);
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, userCheck.rows[0].password_hash);
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 401);
    }
  }
  
  const updateFields = [];
  const updateValues = [];
  let paramCount = 1;
  
  // Update username if provided
  if (username) {
    // Check if username already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [username, userId]
    );
    
    if (existingUser.rows.length > 0) {
      throw new AppError('Username already exists', 400);
    }
    
    updateFields.push(`username = $${paramCount}`);
    updateValues.push(username);
    paramCount++;
  }
  
  // Update password if provided
  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    updateFields.push(`password_hash = $${paramCount}`);
    updateValues.push(passwordHash);
    paramCount++;
  }
  
  if (updateFields.length === 0) {
    throw new AppError('No updates provided', 400);
  }
  
  // Add updated_at
  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  
  // Add user ID
  updateValues.push(userId);
  
  const query = `
    UPDATE users 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, username, full_name, role, updated_at
  `;
  
  const result = await pool.query(query, updateValues);
  
  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }
  
  return result.rows[0];
};

export const getUserById = async (userId) => {
  const result = await pool.query(
    'SELECT id, username, full_name, role, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }
  
  return result.rows[0];
};

