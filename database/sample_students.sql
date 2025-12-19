-- Sample Students Data for SAMS
-- 5 Stages with 10 Students Each

-- First, create the classes (stages)
INSERT INTO classes (class_name, class_code) VALUES
('Stage 1', 'ST1'),
('Stage 2', 'ST2'),
('Stage 3', 'ST3'),
('Stage 4', 'ST4'),
('Stage 5', 'ST5');

-- Stage 1 Students (10 students)
INSERT INTO students (student_name, student_id, class_id) VALUES
('Ahmed Ali Hassan', 'ST1-001', (SELECT id FROM classes WHERE class_code = 'ST1')),
('Sara Mohammed Ibrahim', 'ST1-002', (SELECT id FROM classes WHERE class_code = 'ST1')),
('Omar Khalil Mustafa', 'ST1-003', (SELECT id FROM classes WHERE class_code = 'ST1')),
('Fatima Youssef Ahmad', 'ST1-004', (SELECT id FROM classes WHERE class_code = 'ST1')),
('Hassan Abdullah Karim', 'ST1-005', (SELECT id FROM classes WHERE class_code = 'ST1')),
('Mariam Saleh Jamal', 'ST1-006', (SELECT id FROM classes WHERE class_code = 'ST1')),
('Youssef Nasser Ali', 'ST1-007', (SELECT id FROM classes WHERE class_code = 'ST1')),
('Layla Ibrahim Farid', 'ST1-008', (SELECT id FROM classes WHERE class_code = 'ST1')),
('Karim Rashid Omar', 'ST1-009', (SELECT id FROM classes WHERE class_code = 'ST1')),
('Noor Ahmed Sami', 'ST1-010', (SELECT id FROM classes WHERE class_code = 'ST1'));

-- Stage 2 Students (10 students)
INSERT INTO students (student_name, student_id, class_id) VALUES
('Ali Hassan Mahmoud', 'ST2-001', (SELECT id FROM classes WHERE class_code = 'ST2')),
('Huda Mohammed Tariq', 'ST2-002', (SELECT id FROM classes WHERE class_code = 'ST2')),
('Tariq Khalid Jamil', 'ST2-003', (SELECT id FROM classes WHERE class_code = 'ST2')),
('Aisha Salah Nader', 'ST2-004', (SELECT id FROM classes WHERE class_code = 'ST2')),
('Mahmoud Faisal Adel', 'ST2-005', (SELECT id FROM classes WHERE class_code = 'ST2')),
('Zainab Rashid Majid', 'ST2-006', (SELECT id FROM classes WHERE class_code = 'ST2')),
('Adel Jamal Hamed', 'ST2-007', (SELECT id FROM classes WHERE class_code = 'ST2')),
('Reem Nasser Kamal', 'ST2-008', (SELECT id FROM classes WHERE class_code = 'ST2')),
('Sami Abdullah Walid', 'ST2-009', (SELECT id FROM classes WHERE class_code = 'ST2')),
('Dina Ibrahim Rami', 'ST2-010', (SELECT id FROM classes WHERE class_code = 'ST2'));

-- Stage 3 Students (10 students)
INSERT INTO students (student_name, student_id, class_id) VALUES
('Khalid Omar Saeed', 'ST3-001', (SELECT id FROM classes WHERE class_code = 'ST3')),
('Amina Tariq Bassam', 'ST3-002', (SELECT id FROM classes WHERE class_code = 'ST3')),
('Rami Hassan Fouad', 'ST3-003', (SELECT id FROM classes WHERE class_code = 'ST3')),
('Nada Mohammed Qasim', 'ST3-004', (SELECT id FROM classes WHERE class_code = 'ST3')),
('Bassam Saleh Nabil', 'ST3-005', (SELECT id FROM classes WHERE class_code = 'ST3')),
('Hana Youssef Rida', 'ST3-006', (SELECT id FROM classes WHERE class_code = 'ST3')),
('Nabil Khalil Fadi', 'ST3-007', (SELECT id FROM classes WHERE class_code = 'ST3')),
('Lina Ahmed Ziad', 'ST3-008', (SELECT id FROM classes WHERE class_code = 'ST3')),
('Fadi Abdullah Bilal', 'ST3-009', (SELECT id FROM classes WHERE class_code = 'ST3')),
('Maya Ibrahim Samer', 'ST3-010', (SELECT id FROM classes WHERE class_code = 'ST3'));

-- Stage 4 Students (10 students)
INSERT INTO students (student_name, student_id, class_id) VALUES
('Bilal Nasser Munir', 'ST4-001', (SELECT id FROM classes WHERE class_code = 'ST4')),
('Rana Rashid Amin', 'ST4-002', (SELECT id FROM classes WHERE class_code = 'ST4')),
('Munir Jamal Tarek', 'ST4-003', (SELECT id FROM classes WHERE class_code = 'ST4')),
('Salma Mohammed Rayan', 'ST4-004', (SELECT id FROM classes WHERE class_code = 'ST4')),
('Tarek Hassan Jamal', 'ST4-005', (SELECT id FROM classes WHERE class_code = 'ST4')),
('Nour Khalid Sana', 'ST4-006', (SELECT id FROM classes WHERE class_code = 'ST4')),
('Jamal Saleh Bashar', 'ST4-007', (SELECT id FROM classes WHERE class_code = 'ST4')),
('Sana Ibrahim Marwan', 'ST4-008', (SELECT id FROM classes WHERE class_code = 'ST4')),
('Bashar Abdullah Farouk', 'ST4-009', (SELECT id FROM classes WHERE class_code = 'ST4')),
('Leila Ahmed Firas', 'ST4-010', (SELECT id FROM classes WHERE class_code = 'ST4'));

-- Stage 5 Students (10 students)
INSERT INTO students (student_name, student_id, class_id) VALUES
('Marwan Omar Hadi', 'ST5-001', (SELECT id FROM classes WHERE class_code = 'ST5')),
('Yasmin Mohammed Samir', 'ST5-002', (SELECT id FROM classes WHERE class_code = 'ST5')),
('Hadi Hassan Jalal', 'ST5-003', (SELECT id FROM classes WHERE class_code = 'ST5')),
('Mona Khalil Raed', 'ST5-004', (SELECT id FROM classes WHERE class_code = 'ST5')),
('Jalal Saleh Wassim', 'ST5-005', (SELECT id FROM classes WHERE class_code = 'ST5')),
('Rania Youssef Tamer', 'ST5-006', (SELECT id FROM classes WHERE class_code = 'ST5')),
('Wassim Nasser Hazim', 'ST5-007', (SELECT id FROM classes WHERE class_code = 'ST5')),
('Ghada Ibrahim Waleed', 'ST5-008', (SELECT id FROM classes WHERE class_code = 'ST5')),
('Hazim Abdullah Rashed', 'ST5-009', (SELECT id FROM classes WHERE class_code = 'ST5')),
('Jana Ahmed Mazen', 'ST5-010', (SELECT id FROM classes WHERE class_code = 'ST5'));