-- Sample data inserts for HIV_HEATH_CARE database

USE HIV_HEATH_CARE;
GO

-- 1. Accounts
INSERT INTO Accounts (username, password_hash, role, status)
VALUES
('patient1', 'hash_patient1', 'Patient', 'active'),
('patient2', 'hash_patient2', 'Patient', 'active'),
('labstaff1', 'hash_labstaff1', 'Lab-Staff', 'active'),
('regstaff1', 'hash_regstaff1', 'Registration-staff', 'active'),
('doctor1', 'hash_doctor1', 'Doctor', 'active'),
('manager1', 'hash_manager1', 'Manager', 'active');

-- 2. Patients
INSERT INTO Patients (account_id, full_name, dob, gender, email, phone, address)
VALUES
(1, N'Nguyễn Văn A', '1990-05-15', 'Male', 'patient1@example.com', '0123456789', N'Hà Nội'),
(2, N'Trần Thị B', '1985-08-20', 'Female', 'patient2@example.com', '0987654321', N'Hồ Chí Minh');

-- 3. Doctors
INSERT INTO Doctors (account_id, full_name, email, phone, image_url, degrees, experience_years)
VALUES
(5, N'Bác sĩ Kiên', 'doctor1@example.com', '0111222333', 'http://example.com/doctor1.jpg', 'MD, HIV Specialist', 5);

-- 4. ARVRegimens
INSERT INTO ARVRegimens (name, for_group, components)
VALUES
('Regimen A', 'General Adult', 'Tenofovir, Lamivudine, Efavirenz'),
('Regimen B', 'Pregnant Women', 'Zidovudine, Lamivudine, Nevirapine');

-- 5. Rooms
INSERT INTO Rooms (room_name, room_type)
VALUES
('Phòng 201', N'Khám'),
('XN Máu', N'Xét nghiệm');

-- 6. Slots
INSERT INTO Slots (start_time, end_time)
VALUES
('08:00', '09:00'),
('09:00', '10:00'),
('10:00', '11:00');

-- 7. TestTypes
INSERT INTO TestTypes (name, unit, normal_range, result_type)
VALUES
('CD4', 'cells/mm³', '500-1500', 'numeric'),
(N'Tải lượng virus', 'copies/mL', '0-1000', 'numeric'),
(N'Sàng lọc', NULL, NULL, 'binary'),
(N'Khẳng định', NULL, NULL, 'binary');

-- 8. Appointments
INSERT INTO Appointments (patient_id, doctor_id, slot_id, status, queue_number, room_id)
VALUES
(1, 1, 1, 'requested', 1, 1),  -- Appointment for Nguyễn Văn A with doctor1
(2, 1, 2, 'requested', 1, 1);  -- Appointment for Trần Thị B with doctor1

-- 9. TestRequests
INSERT INTO TestRequests (doctor_id, appointment_id, notes, status)
VALUES
(1, 1, N'Cần kiểm tra CD4 và Sàng lọc', 'requested'),
(1, 2, N'Cần kiểm tra Tải lượng virus và Khẳng định', 'requested');

-- 10. Services (example of linking to appointments or testrequests)
INSERT INTO Services (request_id, appointment_id, name, service_type, description, price, test_type_id)
VALUES
(1, NULL, N'Xét nghiệm lần 1', 'test', N'Test CD4', 200000, 1), -- CD4
(1, NULL, N'Xét nghiệm lần 2', 'test', N'Test Sàng lọc', 100000, 3),
(NULL, 1, N'Khám tổng quát', 'examination', N'Khám tổng quát cho bệnh nhân', 150000, NULL),
(NULL, 2, N'Tư vấn sức khỏe', 'consultation', N'Tư vấn cho bệnh nhân', 50000, NULL),
(2, NULL, N'Xét nghiệm khẳng định', 'test', N'Xét nghiệm khẳng định', 130000, 4),
(2, NULL, N'Xét nghiệm tải lượng virus', 'test', N'Test tải lượng virus', 250000, 2);

-- 11. WorkingShifts
INSERT INTO WorkingShifts (account_id, doctor_id, shift_date, room_id, status, max_patients_per_slot)
VALUES
(6, 1, '2025-06-20', 1, 'approved', 6),
(6, 1, '2025-06-21', 1, 'approved', 6);

-- 12. TestNotes
INSERT INTO TestNotes (request_id, appointment_id, created_by_id, test_datetime)
VALUES
(1, 1, 3, '2025-06-19 08:30:00'),
(2, 2, 3, '2025-06-19 09:00:00');

-- 13. TestResults
INSERT INTO TestResults (test_note_id, result_value, unit, reference_range, notes)
VALUES
(1, '750', 'cells/mm³', '500-1500', N'CD4 trong giới hạn'),
(1, 'Negative', NULL, NULL, N'Kết quả sàng lọc âm tính'),
(2, 'Positive', NULL, NULL, N'Kết quả khẳng định dương tính'),
(2, '850', 'copies/mL', '0-1000', N'Tải lượng virus nhẹ');

-- 14. MedicalHistory
INSERT INTO MedicalHistory (patient_id, hiv_discovered_at, arv_status, arv_adherence, arv_side_effects, medical_history, allergies)
VALUES
(1, '2020-01-01', 'On ARV', 'good', 'None', 'Không có tiền sử bệnh nặng', 'None'),
(2, '2021-03-10', 'On ARV', 'average', 'Chóng mặt', 'Tiền sử viêm gan B', 'Penicillin');

-- 15. ClinicalExams
INSERT INTO ClinicalExams (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary)
VALUES
(1, 'HA: 120/80, M: 80', 60, 1.65, 22.03, N'Không thấy dấu hiệu bất thường rõ rệt', N'Nghi ngờ HIV', N'Cần làm thêm xét nghiệm'),
(2, 'HA: 115/75, M: 78', 55, 1.60, 21.48, N'Có triệu chứng mệt mỏi', N'Theo dõi tiến triển', N'Cần xét nghiệm thường xuyên');

-- 16. Prescriptions
INSERT INTO Prescriptions (appointment_id, arv_regimen_id, support_drugs, counseling_notes, follow_up_plan, doctor_notes)
VALUES
(1, 1, N'Bổ sung vitamin C', N'Cần nghỉ ngơi, tăng cường dinh dưỡng', N'Tái khám sau 1 tháng', N'Chú ý vận động nhẹ nhàng'),
(2, 2, N'Drug XYZ', N'Cân nhắc theo dõi tác dụng phụ', N'Tái khám sau 2 tuần', N'Theo dõi sát');

-- 17. PrescriptionDetails
INSERT INTO PrescriptionDetails (prescription_id, drug_name, dosage, frequency, duration_days, usage_instructions, notes)
VALUES
(1, N'Tenofovir', '300mg', N'2 lần/ngày', 30, N'Uống sau ăn', N''),
(1, N'Lamivudine', '150mg', N'2 lần/ngày', 30, N'Uống trước ăn 30 phút', N''),
(2, N'Zidovudine', '300mg', N'2 lần/ngày', 14, N'Uống kèm nước nhiều', N'Chú ý giám sát tác dụng phụ'),
(2, N'Nevirapine', '200mg', N'1 lần/ngày', 14, N'Uống buổi tối', N'');

-- 18. BlogPosts
INSERT INTO BlogPosts (title, content, author_id, is_educational, published)
VALUES
(N'Cách bảo vệ sức khỏe HIV', N'Nội dung bài viết...', 6, 1, 1),
(N'Thông tin về ARV', N'Nội dung mô tả chi tiết...', 6, 1, 0);

-- 19. Invoices
INSERT INTO Invoices (patient_id, appointment_id, request_id, amount, service_type, status)
VALUES
(1, 1, NULL, 150000, N'examination', 'unpaid'),
(1, NULL, 1, 300000, N'test', 'paid'),
(2, 2, NULL, 50000, N'consultation', 'pending'),
(2, NULL, 2, 380000, N'test', 'unpaid');

-- insert more sample for working shifts
INSERT INTO WorkingShifts (account_id, doctor_id, shift_date, room_id, status, max_patients_per_slot)
VALUES
-- Doctor 1 làm việc từ thứ 2 đến thứ 6
(5, 1, '2025-06-19', 1, 'approved', 6), -- Thứ 5
(5, 1, '2025-06-20', 1, 'approved', 6), -- Thứ 6  
(5, 1, '2025-06-21', 1, 'approved', 6), -- Thứ 7
(5, 1, '2025-06-23', 1, 'approved', 6), -- Thứ 2
(5, 1, '2025-06-24', 1, 'approved', 6), -- Thứ 3
(5, 1, '2025-06-25', 1, 'approved', 6), -- Thứ 4
(5, 1, '2025-06-26', 1, 'approved', 6), -- Thứ 5
(5, 1, '2025-06-27', 1, 'approved', 6); -- Thứ 6

GO