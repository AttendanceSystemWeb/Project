// Script to create 5 teachers with proper password hashing
// Username is the same as full name
import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createTeachers() {
  try {
    const password = 'teacher123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    const teachers = [
      { name: 'Dr. Ahmed Rashid', stage: 'ST1' },
      { name: 'Dr. Sara Hassan', stage: 'ST2' },
      { name: 'Dr. Omar Karim', stage: 'ST3' },
      { name: 'Dr. Mariam Youssef', stage: 'ST4' },
      { name: 'Dr. Hassan Ibrahim', stage: 'ST5' }
    ];
    
    for (const teacher of teachers) {
      // Create teacher user (username = full name)
      const userResult = await pool.query(
        'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [teacher.name, passwordHash, teacher.name, 'teacher']
      );
      
      const teacherId = userResult.rows[0].id;
      
      // Get class ID for this stage
      const classResult = await pool.query(
        'SELECT id FROM classes WHERE class_code = $1',
        [teacher.stage]
      );
      
      if (classResult.rows.length === 0) {
        console.log(`⚠️  Warning: Stage ${teacher.stage} not found. Create classes first.`);
        continue;
      }
      
      const classId = classResult.rows[0].id;
      
      // Get all subjects for this stage (based on subject_code pattern)
      const stageNum = teacher.stage.replace('ST', '');
      const subjectsResult = await pool.query(
        `SELECT id FROM subjects 
         WHERE subject_code LIKE 'CS${stageNum}%' 
            OR subject_code LIKE 'MATH${stageNum}%' 
            OR subject_code LIKE 'PHYS${stageNum}%'
            OR subject_code LIKE 'ENG${stageNum}%'
            OR subject_code LIKE 'RES${stageNum}%'
            OR subject_code LIKE 'BUS${stageNum}%'
            OR subject_code LIKE 'ETH${stageNum}%'
            OR subject_code LIKE 'THESIS${stageNum}%'`
      );
      
      // Assign teacher to all subjects in their stage
      for (const subject of subjectsResult.rows) {
        await pool.query(
          'INSERT INTO teacher_assignments (teacher_id, class_id, subject_id) VALUES ($1, $2, $3)',
          [teacherId, classId, subject.id]
        );
      }
      
      console.log(`✅ Created ${teacher.name} with ${subjectsResult.rows.length} subject assignments`);
    }
    
    console.log('\n🎉 All teachers created successfully!');
    console.log('\n📋 Login credentials (password: teacher123):');
    console.log('  Username: Dr. Ahmed Rashid (Stage 1)');
    console.log('  Username: Dr. Sara Hassan (Stage 2)');
    console.log('  Username: Dr. Omar Karim (Stage 3)');
    console.log('  Username: Dr. Mariam Youssef (Stage 4)');
    console.log('  Username: Dr. Hassan Ibrahim (Stage 5)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTeachers();