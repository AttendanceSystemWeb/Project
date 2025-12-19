// Script to verify and fix admin user
import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixAdmin() {
  try {
    // Check if admin exists
    const checkResult = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    
    if (checkResult.rows.length > 0) {
      console.log('Found existing admin user:');
      console.log('Username:', checkResult.rows[0].username);
      console.log('Full Name:', checkResult.rows[0].full_name);
      console.log('Role:', checkResult.rows[0].role);
      console.log('\nDeleting old admin...');
    } else {
      console.log('No admin user found. Creating new one...');
    }
    
    // Delete existing admin
    await pool.query("DELETE FROM users WHERE username = 'admin'");
    
    // Create new admin with fresh hash
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('\nCreating new admin user...');
    console.log('Password hash:', passwordHash);
    
    await pool.query(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ['admin', passwordHash, 'System Administrator', 'admin']
    );
    
    // Verify it works
    console.log('\n✅ Admin created! Verifying...');
    
    const verifyResult = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    if (verifyResult.rows.length > 0) {
      const user = verifyResult.rows[0];
      const isValid = await bcrypt.compare('admin123', user.password_hash);
      
      if (isValid) {
        console.log('✅ Password verification: SUCCESS');
        console.log('\n🎉 Admin login is ready!');
        console.log('Username: admin');
        console.log('Password: admin123');
      } else {
        console.log('❌ Password verification: FAILED');
      }
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixAdmin();

