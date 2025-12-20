// Quick script to create admin user
import bcrypt from 'bcrypt';
import pg from 'pg';

// Use your production connection string
const connectionString = 'postgresql://postgres.cguoxpmwqatnpuuommsh:WWG7OjwLJMGoN29G@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

const { Pool } = pg;
const pool = new Pool({
  connectionString: connectionString
});

async function createAdmin() {
  try {
    // Generate hash for password 'admin123'
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('Generated password hash:', passwordHash);
    
    // Delete existing admin if any
    await pool.query("DELETE FROM users WHERE username = 'admin'");
    
    // Insert new admin with proper hash
    await pool.query(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
      ['admin', passwordHash, 'System Administrator', 'admin']
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();