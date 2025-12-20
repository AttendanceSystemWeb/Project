import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.cguoxpmwqatnpuuommsh:WWG7OjwLJMGoN29G@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW(), version()');
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].now);
    console.log('PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    
    // Test if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  }
}

testConnection();