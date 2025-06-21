-- Insert sample data for testing doctor examination functionality
-- Chạy script này sau khi đã có database và đã update passwords

USE HIV_HEATH_CARE;

-- 1. Insert sample Slots (nếu chưa có)
IF NOT EXISTS (SELECT * FROM Slots WHERE slot_id = 1)
BEGIN
    INSERT INTO Slots (start_time, end_time) VALUES 
    ('08:00', '08:30'),
    ('08:30', '09:00'),
    ('09:00', '09:30'),
    ('09:30', '10:00'),
    ('10:00', '10:30'),
    ('10:30', '11:00'),
    ('13:30', '14:00'),
    ('14:00', '14:30'),
    ('14:30', '15:00'),
    ('15:00', '15:30');
END

-- 2. Insert sample Rooms (nếu chưa có)
IF NOT EXISTS (SELECT * FROM Rooms WHERE room_id = 1)
BEGIN
    INSERT INTO Rooms (room_name, room_type) VALUES 
    ('Phòng khám 101', 'Khám'),
    ('Phòng khám 102', 'Khám'),
    ('Phòng XN Máu', 'Xét nghiệm'),
    ('Phòng XN Miễn dịch', 'Xét nghiệm');
END

-- 3. Insert ARV Regimens (nếu chưa có)
IF NOT EXISTS (SELECT * FROM ARVRegimens WHERE arv_regimen_id = 1)
BEGIN
    INSERT INTO ARVRegimens (name, for_group, components) VALUES 
    ('TDF/3TC/EFV', 'Người lớn', 'Tenofovir + Lamivudine + Efavirenz'),
    ('AZT/3TC/NVP', 'Mẹ bầu', 'Zidovudine + Lamivudine + Nevirapine'),
    ('ABC/3TC/DTG', 'Người lớn', 'Abacavir + Lamivudine + Dolutegravir');
END

-- 4. Insert Test Types (nếu chưa có)
IF NOT EXISTS (SELECT * FROM TestTypes WHERE test_type_id = 1)
BEGIN
    INSERT INTO TestTypes (name, unit, normal_range, result_type) VALUES 
    ('Sàng lọc', NULL, 'Âm tính', 'binary'),
    ('Khẳng định', NULL, 'Âm tính', 'binary'),
    ('Tải lượng virus', 'copies/ml', '<50', 'numeric'),
    ('CD4', 'cells/μL', '500-1500', 'numeric');
END

-- 5. Insert Services (nếu chưa có)
IF NOT EXISTS (SELECT * FROM Services WHERE service_id = 1)
BEGIN
    INSERT INTO Services (name, service_type, description, price, test_type_id) VALUES 
    ('HIV sàng lọc', 'test', 'Xét nghiệm sàng lọc HIV', 0.00, 1),
    ('HIV khẳng định', 'test', 'Xét nghiệm khẳng định HIV', 0.00, 2),
    ('Tải lượng virus HIV', 'test', 'Đo lượng virus HIV trong máu', 500000.00, 3),
    ('Đếm CD4', 'test', 'Đếm tế bào CD4', 300000.00, 4),
    ('Khám tổng quát', 'examination', 'Khám sức khỏe tổng quát', 200000.00, NULL);
END

-- 6. Insert Working Shifts cho doctor01 (hôm nay)
INSERT INTO WorkingShifts (account_id, doctor_id, shift_date, room_id, status, max_patients_per_slot)
SELECT 
    (SELECT account_id FROM Accounts WHERE username = 'doctor01'),
    (SELECT doctor_id FROM Doctors WHERE account_id = (SELECT account_id FROM Accounts WHERE username = 'doctor01')),
    CAST(GETDATE() AS DATE),
    1, -- room_id
    'approved',
    5
WHERE NOT EXISTS (
    SELECT 1 FROM WorkingShifts ws 
    WHERE ws.doctor_id = (SELECT doctor_id FROM Doctors WHERE account_id = (SELECT account_id FROM Accounts WHERE username = 'doctor01'))
    AND ws.shift_date = CAST(GETDATE() AS DATE)
);

-- 7. Insert sample Appointments
DECLARE @patient1_id INT = (SELECT patient_id FROM Patients WHERE account_id = (SELECT account_id FROM Accounts WHERE username = 'patient01'));
DECLARE @patient2_id INT = (SELECT patient_id FROM Patients WHERE account_id = (SELECT account_id FROM Accounts WHERE username = 'patient02'));
DECLARE @doctor1_id INT = (SELECT doctor_id FROM Doctors WHERE account_id = (SELECT account_id FROM Accounts WHERE username = 'doctor01'));

-- Appointment 1: Đang chờ khám
INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, queue_number, room_id, bookingDate)
VALUES (@patient1_id, @doctor1_id, 1, 5, 'requested', 1, 1, CAST(GETDATE() AS DATE));

-- Appointment 2: Đang khám
INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, queue_number, room_id, bookingDate)
VALUES (@patient2_id, @doctor1_id, 2, 5, 'in_progress', 2, 1, CAST(GETDATE() AS DATE));

-- 8. Insert Medical History cho patients
INSERT INTO MedicalHistory (patient_id, hiv_discovered_at, arv_status, arv_adherence, arv_side_effects, medical_history, allergies)
VALUES 
(@patient1_id, '2023-01-15', 'Đang điều trị', 'good', 'Chóng mặt nhẹ', 'Phát hiện HIV từ 2023', 'Không có'),
(@patient2_id, '2022-06-10', 'Đang điều trị', 'average', 'Mệt mỏi', 'Phát hiện HIV từ 2022', 'Dị ứng Penicillin');

-- 9. Insert some old appointments (completed) để có history
DECLARE @old_appointment1 INT;
INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, queue_number, room_id, bookingDate, created_at)
VALUES (@patient1_id, @doctor1_id, 3, 5, 'completed', 1, 1, DATEADD(day, -30, GETDATE()), DATEADD(day, -30, GETDATE()));
SET @old_appointment1 = SCOPE_IDENTITY();

-- Insert clinical exam for old appointment
INSERT INTO ClinicalExams (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary)
VALUES (@old_appointment1, 'Huyết áp: 120/80, Nhịp tim: 72', 65.0, 170.0, 22.5, 'Bình thường', 'HIV/AIDS ổn định', 'Tuân thủ điều trị tốt');

-- Insert prescription for old appointment
DECLARE @prescription1 INT;
INSERT INTO Prescriptions (appointment_id, arv_regimen_id, support_drugs, counseling_notes, follow_up_plan, doctor_notes)
VALUES (@old_appointment1, 1, 'Vitamin B, Calcium', 'Tiếp tục tuân thủ điều trị', 'Tái khám sau 3 tháng', 'Bệnh nhân ổn định');
SET @prescription1 = SCOPE_IDENTITY();

-- 10. Insert Test Requests cho current examination
DECLARE @current_appointment INT = (SELECT appointment_id FROM Appointments WHERE patient_id = @patient2_id AND status = 'in_progress');

INSERT INTO TestRequests (doctor_id, appointment_id, service_id, request_date, status)
VALUES 
(@doctor1_id, @current_appointment, 1, GETDATE(), 'requested'), -- HIV sàng lọc
(@doctor1_id, @current_appointment, 3, GETDATE(), 'requested'); -- Tải lượng virus

-- 11. Insert some completed test results
DECLARE @old_test_request INT;
INSERT INTO TestRequests (doctor_id, appointment_id, service_id, request_date, approved_at, status)
VALUES (@doctor1_id, @old_appointment1, 1, DATEADD(day, -30, GETDATE()), DATEADD(day, -29, GETDATE()), 'completed');
SET @old_test_request = SCOPE_IDENTITY();

-- Insert test note
DECLARE @test_note INT;
INSERT INTO TestNotes (request_id, appointment_id, created_by_id, test_datetime)
VALUES (@old_test_request, @old_appointment1, (SELECT account_id FROM Accounts WHERE username = 'labstaff01'), DATEADD(day, -29, GETDATE()));
SET @test_note = SCOPE_IDENTITY();

-- Insert test result
INSERT INTO TestResults (test_note_id, result_value, unit, reference_range, notes)
VALUES (@test_note, NULL, NULL, 'Âm tính', 'HIV Ag/Ab: Dương tính');

-- 12. Insert recent test results để hiển thị trong current exam
DECLARE @recent_test_request1 INT, @recent_test_request2 INT;
INSERT INTO TestRequests (doctor_id, appointment_id, service_id, request_date, approved_at, status)
VALUES 
(@doctor1_id, @old_appointment1, 3, DATEADD(day, -7, GETDATE()), DATEADD(day, -6, GETDATE()), 'completed'),
(@doctor1_id, @old_appointment1, 4, DATEADD(day, -7, GETDATE()), DATEADD(day, -6, GETDATE()), 'completed');

SELECT @recent_test_request1 = SCOPE_IDENTITY();

INSERT INTO TestRequests (doctor_id, appointment_id, service_id, request_date, approved_at, status)
VALUES (@doctor1_id, @old_appointment1, 4, DATEADD(day, -7, GETDATE()), DATEADD(day, -6, GETDATE()), 'completed');
SET @recent_test_request2 = SCOPE_IDENTITY();

-- Test notes cho recent tests
DECLARE @recent_note1 INT, @recent_note2 INT;
INSERT INTO TestNotes (request_id, appointment_id, created_by_id, test_datetime)
VALUES 
(@recent_test_request1, @old_appointment1, (SELECT account_id FROM Accounts WHERE username = 'labstaff01'), DATEADD(day, -6, GETDATE())),
(@recent_test_request2, @old_appointment1, (SELECT account_id FROM Accounts WHERE username = 'labstaff01'), DATEADD(day, -6, GETDATE()));

SELECT @recent_note1 = @@IDENTITY;
SET @recent_note2 = SCOPE_IDENTITY();

-- Test results cho recent tests
INSERT INTO TestResults (test_note_id, result_value, unit, reference_range, notes)
VALUES 
(@recent_note1, '<50', 'copies/ml', '<50', 'Không phát hiện'),
(@recent_note2, '520', 'cells/μL', '500-1500', 'Bình thường');

PRINT 'Sample data inserted successfully!';
PRINT 'You can now test the doctor examination functionality with:';
PRINT '- doctor01 login';
PRINT '- Patient in queue: patient01';
PRINT '- Patient in progress: patient02';
PRINT '- Historical data available for both patients';
