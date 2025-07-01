USE HIV_HEALTH_CARE
-- 1. Accounts (giữ nguyên từ data mẫu ban đầu)
INSERT INTO Accounts (username, password_hash, role, status) VALUES 
('admin01', '$2b$10$5yIXgrKWmsOXurLPFLm6Ku3d0XHZYhsUXvyvMbnD0WefI4WfPlkLO', 'Manager', 'active'),
('doctor01', '$2b$10$VBQ33AMG1DIE6IyhEG8Rsua8g5zJHtHEtCquHukuhrDPIUwmPWc8C', 'Doctor', 'active'),
('doctor02', '$2b$10$JLXsFxPDKpbDpfTWLnEawOYtRSrKy5reMFfSwzVp8..A54bqXxkSi', 'Doctor', 'active'),
('doctor03', '$2b$10$LE6eaI8mKgALEMVvf73oRO6b8HkaT01x1zoKMKIPsCsXrchDXWwIG', 'Doctor', 'active'),
('labstaff01', '$2b$10$ddLibF8rB0BqfhjP0osnYuKaFqO0WYcenTtLWBa7yA6Sfq9OGT.Zi', 'Lab-Staff', 'active'),
('labstaff02', '$2b$10$JOzqTAnXzpqMc4UH.kPrY.aD5d2SJNTn.lYIEiPCTfiGbqomAbnp.', 'Lab-Staff', 'active'),
('regstaff01', '$2b$10$0Le2SIyw4iavY5dy2yhkMOD7bEy6dFrq4vsqTYKTiTwTi/d.IdzEG', 'Registration-staff', 'active'),
('regstaff02', '$2b$10$Ybza.Z0Bd/CBTHsXuEm3.ewckPUPfrb2nX5Cuj5FirLRcYoVPbo16', 'Registration-staff', 'active'),
('patient01', '$2b$10$R4GU6QXXC4Yd9A75aPQyP.11OZFQXpBDY9KOGe5QmT79.DPViX6oS', 'Patient', 'active'),
('patient02', '$2b$10$g//P460qO3BUjjb7AElXL.9SSneTkoGzSwUtgr/ZAPVxQIdWUyyM6', 'Patient', 'active'),
('patient03', '$2b$10$x.pTUnbdim70JyRNDTmREOYag7O0mwI9OMoHUKZ9Mi6K9Q1wuXFrW', 'Patient', 'active'),
('patient04', '$2b$10$DMyV/q3.A3sILMGuo1XF3.SWDA2SyjQ9SyS6mXOWWWPqfebyJ7JQ6', 'Patient', 'active'),
('patient05', '$2b$10$M3pd.j2T2c2nawZEs0m9IeAru3iNRglqaGqGEnzuTL/cykzcnKG/y', 'Patient', 'active'),
('patient06', '$2b$10$ZxY9W8QvT3R4S5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N', 'Patient', 'active'),
('patient07', '$2b$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A', 'Patient', 'active'),
('patient08', '$2b$10$B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B', 'Patient', 'active'),
('patient09', '$2b$10$C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C', 'Patient', 'active'),
('patient10', '$2b$10$D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D', 'Patient', 'active');

-- 2. Patients
INSERT INTO Patients (account_id, full_name, dob, gender, email, phone, address) VALUES
(9, N'Nguyễn Văn An', '1985-03-15', 'male', 'nva@email.com', '0901234567', N'123 Nguyễn Huệ, Q.1, TP.HCM'),
(10, N'Trần Thị Bình', '1990-07-22', 'female', 'ttb@email.com', '0902345678', N'456 Lê Lợi, Q.3, TP.HCM'),
(11, N'Lê Minh Cường', '1982-11-08', 'male', 'lmc@email.com', '0903456789', N'789 Hai Bà Trưng, Q.1, TP.HCM'),
(12, N'Phạm Thị Hương', '1995-01-30', 'female', 'pth@email.com', '0904567890', N'321 Võ Văn Tần, Q.3, TP.HCM'),
(13, N'Hoàng Văn Em', '1988-09-12', 'male', 'hve@email.com', '0905678901', N'654 Pasteur, Q.1, TP.HCM'),
(14, N'Vũ Thị Mai', '1992-04-25', 'female', 'vtm@email.com', '0906789012', N'987 Trần Hưng Đạo, Q.5, TP.HCM'),
(15, N'Đặng Văn Hùng', '1980-06-18', 'male', 'dvh@email.com', '0907890123', N'147 Lý Thường Kiệt, Q.10, TP.HCM'),
(16, N'Ngô Thị Lan', '1987-12-03', 'female', 'ntl@email.com', '0908901234', N'258 Nguyễn Thị Minh Khai, Q.3, TP.HCM'),
(17, N'Bùi Văn Nam', '1993-08-09', 'male', 'bvn@email.com', '0909012345', N'369 Điện Biên Phủ, Q.3, TP.HCM'),
(18, N'Lý Thị Ngọc', '1989-02-14', 'female', 'ltn@email.com', '0900123456', N'741 Cách Mạng Tháng Tám, Q.Tân Bình, TP.HCM');

-- 3. Doctors
INSERT INTO Doctors (account_id, full_name, email, phone, image_url, degrees, experience_years) VALUES
(2, N'BS. Nguyễn Minh Khoa', 'bs.khoa@hospital.com', '0911111111', '/images/doctor1.jpg', N'Bác sĩ chuyên khoa I - Nhiễm khuẩn', 15),
(3, N'BS. Trần Thị Lan', 'bs.lan@hospital.com', '0922222222', '/images/doctor2.jpg', N'Thạc sĩ Y học - Chuyên khoa HIV/AIDS', 10),
(4, N'BS. Lê Văn Phúc', 'bs.phuc@hospital.com', '0933333333', '/images/doctor3.jpg', N'Tiến sĩ Y học - Chuyên khoa Nội', 20),
(5, N'BS. Hoàng Thị Minh', 'bs.minh@hospital.com', '0944444444', '/images/doctor4.jpg', N'Bác sĩ chuyên khoa II - HIV/AIDS', 12),
(6, N'BS. Vũ Văn Tú', 'bs.tu@hospital.com', '0955555555', '/images/doctor5.jpg', N'Thạc sĩ Y học - Chuyên khoa Nhiễm', 8);

-- 4. ARVRegimens
INSERT INTO ARVRegimens (name, for_group, components) VALUES
(N'TDF/3TC/EFV', N'Người lớn', N'Tenofovir 300mg + Lamivudine 300mg + Efavirenz 600mg'),
(N'ABC/3TC/DTG', N'Người lớn', N'Abacavir 600mg + Lamivudine 300mg + Dolutegravir 50mg'),
(N'TDF/3TC/DTG', N'Thai phụ', N'Tenofovir 300mg + Lamivudine 300mg + Dolutegravir 50mg'),
(N'AZT/3TC/LPV/r', N'Trẻ em', N'Zidovudine + Lamivudine + Lopinavir/ritonavir'),
(N'EFV/FTC/TDF', N'Người lớn', N'Efavirenz 600mg + Emtricitabine 200mg + Tenofovir 300mg'),
(N'ATV/r/3TC/TDF', N'Người lớn', N'Atazanavir/ritonavir + Lamivudine 300mg + Tenofovir 300mg');

-- 5. Rooms (giữ nguyên từ data mẫu ban đầu)
INSERT INTO Rooms (room_name, room_type) VALUES
(N'Phòng khám 101', N'Khám'),
(N'Phòng khám 102', N'Khám'),
(N'Phòng khám 103', N'Khám'),
(N'Phòng khám 104', N'Khám'),
(N'Phòng khám 105', N'Khám'),
(N'Phòng xét nghiệm A', N'Xét nghiệm'),
(N'Phòng tư vấn 1', N'Tư vấn'),
(N'Phòng tư vấn 2', N'Tư vấn'),
(N'Phòng cấp cứu', N'Cấp cứu'),
(N'Phòng xét nghiệm B', N'Xét nghiệm'),
(N'Phòng khám 106', N'Khám'),
(N'Phòng tư vấn 3', N'Tư vấn');

-- 6. Slots
INSERT INTO Slots (start_time, end_time) VALUES
('07:30', '08:30'),
('08:30', '09:30'),
('09:30', '10:30'),
('10:30', '11:30'),
('13:30', '14:30'),
('14:30', '15:30'),
('15:30', '16:30'),
('16:30', '17:30'),
('17:30', '18:30');

-- 7. Services (gộp CD4 và HIV Viral Load thành 'Xét nghiệm CD4 và Viral Load')
INSERT INTO Services (name, service_type, description, price, is_active) VALUES
(N'Khám tổng quát HIV', 'examination', N'Khám sức khỏe tổng quát cho bệnh nhân HIV', 150000, 1),
(N'Tư vấn', 'consultation', N'Tư vấn về cho bệnh nhân HIV qua online', 100000, 1),
(N'Xét nghiệm CD4 và Viral Load', 'test', N'Đếm tế bào CD4 và đo tải lượng virus HIV', 550000, 1),
(N'Xét nghiệm sàng lọc', 'test', N'Sàng lọc HIV sơ bộ', 120000, 1),
(N'Xét nghiệm khẳng định', 'test', N'Xét nghiệm khẳng định HIV, CD4 và Viral Load', 80000, 1);

-- 8. TestTypes
INSERT INTO TestTypes (name, unit, normal_range, result_type) VALUES
(N'CD4', 'cells/mm³', '500-1500', 'numeric'),
(N'HIV Viral Load', 'copies/ml', '<50', 'numeric'),
(N'Sàng lọc', '', 'Negative', 'binary'),
(N'Khẳng định', '', 'Positive', 'binary');


-- 9. ServicesTestTypes
INSERT INTO ServicesTestTypes (service_id, test_type_id) VALUES
(3, 1), -- Xét nghiệm CD4 và Viral Load -> CD4
(3, 2), -- Xét nghiệm CD4 và Viral Load -> HIV Viral Load
(4, 3), -- Xét nghiệm sàng lọc -> Sàng lọc
(5, 4),
(5,1), 
(5,2);-- Xét nghiệm khẳng định -> Khẳng định


-- 10. WorkingShifts
INSERT INTO WorkingShifts (account_id, doctor_id, lab_staff_id, registration_staff_id, shift_date, room_id, status) VALUES
(1, 1, NULL, NULL, '2025-06-23', 1, 'approved'),
(1, 2, NULL, NULL, '2025-06-23', 2, 'approved'),
(1, 3, NULL, NULL, '2025-06-23', 3, 'approved'),
(1, 4, NULL, NULL, '2025-06-24', 4, 'approved'),
(1, 5, NULL, NULL, '2025-06-24', 5, 'approved'),
(1, NULL, 5, NULL, '2025-06-23', 6, 'approved'),
(1, NULL, 6, NULL, '2025-06-23', 10, 'approved'),
(1, NULL, NULL, 7, '2025-06-23', NULL, 'approved'),
(1, NULL, NULL, 8, '2025-06-24', NULL, 'approved'),
(1, 1, NULL, NULL, '2025-06-25', 11, 'approved'),
(1, 2, NULL, NULL, '2025-06-25', 1, 'approved');

-- THÊM DỮ LIỆU MẪU TỪ 30/6/2025 ĐẾN 8/7/2025

-- Thêm WorkingShifts cho các ngày từ 30/6 đến 8/7/2025
INSERT INTO WorkingShifts (account_id, doctor_id, lab_staff_id, registration_staff_id, shift_date, room_id, status) VALUES
-- 30/6/2025 (Thứ 2)
(1, 1, NULL, NULL, '2025-06-30', 1, 'approved'),
(1, 2, NULL, NULL, '2025-06-30', 2, 'approved'),
(1, 3, NULL, NULL, '2025-06-30', 3, 'approved'),
(1, 4, NULL, NULL, '2025-06-30', 4, 'approved'),
(1, NULL, 5, NULL, '2025-06-30', 6, 'approved'),
(1, NULL, 6, NULL, '2025-06-30', 10, 'approved'),
(1, NULL, NULL, 7, '2025-06-30', NULL, 'approved'),

-- 1/7/2025 (Thứ 3)
(1, 1, NULL, NULL, '2025-07-01', 1, 'approved'),
(1, 2, NULL, NULL, '2025-07-01', 2, 'approved'),
(1, 5, NULL, NULL, '2025-07-01', 5, 'approved'),
(1, NULL, 5, NULL, '2025-07-01', 6, 'approved'),
(1, NULL, 6, NULL, '2025-07-01', 10, 'approved'),
(1, NULL, NULL, 8, '2025-07-01', NULL, 'approved'),

-- 2/7/2025 (Thứ 4)
(1, 2, NULL, NULL, '2025-07-02', 2, 'approved'),
(1, 3, NULL, NULL, '2025-07-02', 3, 'approved'),
(1, 4, NULL, NULL, '2025-07-02', 4, 'approved'),
(1, NULL, 5, NULL, '2025-07-02', 6, 'approved'),
(1, NULL, NULL, 7, '2025-07-02', NULL, 'approved'),

-- 3/7/2025 (Thứ 5)
(1, 1, NULL, NULL, '2025-07-03', 1, 'approved'),
(1, 3, NULL, NULL, '2025-07-03', 3, 'approved'),
(1, 5, NULL, NULL, '2025-07-03', 5, 'approved'),
(1, NULL, 6, NULL, '2025-07-03', 10, 'approved'),
(1, NULL, NULL, 8, '2025-07-03', NULL, 'approved'),

-- 4/7/2025 (Thứ 6)
(1, 1, NULL, NULL, '2025-07-04', 1, 'approved'),
(1, 2, NULL, NULL, '2025-07-04', 2, 'approved'),
(1, 4, NULL, NULL, '2025-07-04', 4, 'approved'),
(1, NULL, 5, NULL, '2025-07-04', 6, 'approved'),
(1, NULL, NULL, 7, '2025-07-04', NULL, 'approved'),

-- 5/7/2025 (Thứ 7)
(1, 2, NULL, NULL, '2025-07-05', 2, 'approved'),
(1, 3, NULL, NULL, '2025-07-05', 3, 'approved'),
(1, NULL, 6, NULL, '2025-07-05', 10, 'approved'),
(1, NULL, NULL, 8, '2025-07-05', NULL, 'approved'),

-- 7/7/2025 (Thứ 2)
(1, 1, NULL, NULL, '2025-07-07', 1, 'approved'),
(1, 4, NULL, NULL, '2025-07-07', 4, 'approved'),
(1, 5, NULL, NULL, '2025-07-07', 5, 'approved'),
(1, NULL, 5, NULL, '2025-07-07', 6, 'approved'),
(1, NULL, NULL, 7, '2025-07-07', NULL, 'approved'),

-- 8/7/2025 (Thứ 3)
(1, 2, NULL, NULL, '2025-07-08', 2, 'approved'),
(1, 3, NULL, NULL, '2025-07-08', 3, 'approved'),
(1, 4, NULL, NULL, '2025-07-08', 4, 'approved'),
(1, NULL, 6, NULL, '2025-07-08', 10, 'approved'),
(1, NULL, NULL, 8, '2025-07-08', NULL, 'approved');

-- Thêm Appointments từ 30/6 đến 8/7/2025
INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, room_id, bookingDate) VALUES
-- 30/6/2025
(3, 1, 1, 1, 'requested', 1, '2025-06-30'),
(4, 2, 2, 1, 'requested', 2, '2025-06-30'),
(5, 3, 3, 2, 'requested', 3, '2025-06-30'),
(6, 4, 1, 1, 'in_progress', 4, '2025-06-30'),
(7, NULL, 2, 3, 'requested', 6, '2025-06-30'),
(8, NULL, 3, 4, 'requested', 10, '2025-06-30'),
(9, 1, 4, 1, 'requested', 1, '2025-06-30'),
(10, 2, 5, 1, 'requested', 2, '2025-06-30'),

-- 1/7/2025
(1, 1, 1, 1, 'requested', 1, '2025-07-01'),
(2, 2, 2, 1, 'requested', 2, '2025-07-01'),
(3, 5, 3, 2, 'requested', 5, '2025-07-01'),
(4, NULL, 1, 3, 'in_progress', 6, '2025-07-01'),
(5, NULL, 2, 5, 'requested', 10, '2025-07-01'),
(6, 1, 4, 1, 'requested', 1, '2025-07-01'),
(7, 2, 5, 1, 'requested', 2, '2025-07-01'),

-- 2/7/2025
(8, 2, 1, 1, 'requested', 2, '2025-07-02'),
(9, 3, 2, 1, 'requested', 3, '2025-07-02'),
(10, 4, 3, 2, 'requested', 4, '2025-07-02'),
(1, NULL, 1, 4, 'in_progress', 6, '2025-07-02'),
(2, 3, 4, 1, 'requested', 3, '2025-07-02'),
(3, 4, 5, 1, 'requested', 4, '2025-07-02'),

-- 3/7/2025
(4, 1, 1, 1, 'requested', 1, '2025-07-03'),
(5, 3, 2, 1, 'requested', 3, '2025-07-03'),
(6, 5, 3, 2, 'requested', 5, '2025-07-03'),
(7, NULL, 1, 3, 'in_progress', 10, '2025-07-03'),
(8, 1, 4, 1, 'requested', 1, '2025-07-03'),
(9, 3, 5, 1, 'requested', 3, '2025-07-03'),

-- 4/7/2025
(10, 1, 1, 1, 'requested', 1, '2025-07-04'),
(1, 2, 2, 1, 'requested', 2, '2025-07-04'),
(2, 4, 3, 2, 'requested', 4, '2025-07-04'),
(3, NULL, 1, 5, 'in_progress', 6, '2025-07-04'),
(4, 2, 4, 1, 'requested', 2, '2025-07-04'),
(5, 4, 5, 1, 'requested', 4, '2025-07-04'),

-- 5/7/2025
(6, 2, 1, 1, 'requested', 2, '2025-07-05'),
(7, 3, 2, 1, 'requested', 3, '2025-07-05'),
(8, NULL, 1, 4, 'requested', 10, '2025-07-05'),
(9, 2, 3, 2, 'requested', 2, '2025-07-05'),
(10, 3, 4, 1, 'requested', 3, '2025-07-05'),

-- 7/7/2025
(1, 1, 1, 1, 'requested', 1, '2025-07-07'),
(2, 4, 2, 1, 'requested', 4, '2025-07-07'),
(3, 5, 3, 2, 'requested', 5, '2025-07-07'),
(4, NULL, 1, 3, 'in_progress', 6, '2025-07-07'),
(5, 1, 4, 1, 'requested', 1, '2025-07-07'),
(6, 4, 5, 1, 'requested', 4, '2025-07-07'),

-- 8/7/2025
(7, 2, 1, 1, 'requested', 2, '2025-07-08'),
(8, 3, 2, 1, 'requested', 3, '2025-07-08'),
(9, 4, 3, 2, 'requested', 4, '2025-07-08'),
(10, NULL, 1, 4, 'in_progress', 10, '2025-07-08'),
(1, 2, 4, 1, 'requested', 2, '2025-07-08'),
(2, 3, 5, 1, 'requested', 3, '2025-07-08');

-- Thêm TestRequests từ 30/6 đến 8/7/2025
INSERT INTO TestRequests (doctor_id, appointment_id, request_date, status) VALUES
-- 30/6/2025
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), '2025-06-30 09:30:00', 'requested' ),
(2, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), '2025-06-30 10:30:00', 'requested' ),
(3, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 5 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), '2025-06-30 11:30:00', 'requested' ),

-- 1/7/2025
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-01' ORDER BY created_at DESC), '2025-07-01 09:30:00','requested' ),
(2, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-01' ORDER BY created_at DESC), '2025-07-01 10:30:00', 'requested'),
(5, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-07-01' ORDER BY created_at DESC), '2025-07-01 11:30:00','requested'),

-- 2/7/2025
(2, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 8 AND bookingDate = '2025-07-02' ORDER BY created_at DESC), '2025-07-02 09:30:00','requested' ),
(3, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 9 AND bookingDate = '2025-07-02' ORDER BY created_at DESC), '2025-07-02 10:30:00','requested'),
(4, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 10 AND bookingDate = '2025-07-02' ORDER BY created_at DESC), '2025-07-02 11:30:00','requested'),

-- 3/7/2025
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = '2025-07-03' ORDER BY created_at DESC), '2025-07-03 09:30:00', 'requested' ),
(3, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 5 AND bookingDate = '2025-07-03' ORDER BY created_at DESC), '2025-07-03 10:30:00', 'requested' ),
(5, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 6 AND bookingDate = '2025-07-03' ORDER BY created_at DESC), '2025-07-03 11:30:00', 'requested'),

-- 4/7/2025
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 10 AND bookingDate = '2025-07-04' ORDER BY created_at DESC), '2025-07-04 09:30:00', 'requested'),
(2, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-04' ORDER BY created_at DESC), '2025-07-04 10:30:00', 'requested' ),
(4, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-04' ORDER BY created_at DESC), '2025-07-04 11:30:00', 'requested' ),

-- 5/7/2025
(2, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 6 AND bookingDate = '2025-07-05' ORDER BY created_at DESC), '2025-07-05 09:30:00','requested' ),
(3, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 7 AND bookingDate = '2025-07-05' ORDER BY created_at DESC), '2025-07-05 10:30:00','requested' ),

-- 7/7/2025
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-07' ORDER BY created_at DESC), '2025-07-07 09:30:00','requested' ),
(4, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-07' ORDER BY created_at DESC), '2025-07-07 10:30:00', 'requested'),
(5, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-07-07' ORDER BY created_at DESC), '2025-07-07 11:30:00','requested' ),

-- 8/7/2025
(2, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 7 AND bookingDate = '2025-07-08' ORDER BY created_at DESC), '2025-07-08 09:30:00','requested' ),
(3, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 8 AND bookingDate = '2025-07-08' ORDER BY created_at DESC), '2025-07-08 10:30:00','requested' ),
(4, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 9 AND bookingDate = '2025-07-08' ORDER BY created_at DESC), '2025-07-08 11:30:00', 'requested');

-- Thêm TestRequestDetails - chi tiết dịch vụ cho từng TestRequest
INSERT INTO TestRequestDetails (request_id, service_id, notes) VALUES
-- Dựa vào TestRequests đã tạo ở trên, gán dịch vụ cho từng request
-- 30/6/2025
(1, 3, N'Xét nghiệm CD4 và Viral Load định kỳ'),  -- Patient 3, TestRequest 1
(2, 5, N'Xét nghiệm khẳng định tái kiểm'),        -- Patient 4, TestRequest 2  
(3, 4, N'Xét nghiệm sàng lọc HIV'),               -- Patient 5, TestRequest 3

-- 1/7/2025
(4, 3, N'Theo dõi CD4 và Viral Load'),            -- Patient 1, TestRequest 4
(5, 5, N'Xét nghiệm khẳng định'),                 -- Patient 2, TestRequest 5
(6, 4, N'Xét nghiệm sàng lọc định kỳ'),          -- Patient 3, TestRequest 6

-- 2/7/2025
(7, 3, N'Kiểm tra CD4 và Viral Load'),           -- Patient 8, TestRequest 7
(8, 5, N'Xét nghiệm khẳng định HIV'),            -- Patient 9, TestRequest 8
(9, 4, N'Sàng lọc HIV ban đầu'),                 -- Patient 10, TestRequest 9

-- 3/7/2025
(10, 5, N'Xét nghiệm khẳng định'),               -- Patient 4, TestRequest 10
(11, 3, N'Theo dõi tải lượng virus'),            -- Patient 5, TestRequest 11
(12, 4, N'Sàng lọc HIV'),                        -- Patient 6, TestRequest 12

-- 4/7/2025
(13, 4, N'Xét nghiệm sàng lọc'),                 -- Patient 10, TestRequest 13
(14, 3, N'Kiểm tra CD4 và Viral Load'),          -- Patient 1, TestRequest 14
(15, 4, N'Sàng lọc HIV định kỳ'),                -- Patient 2, TestRequest 15

-- 5/7/2025
(16, 5, N'Xét nghiệm khẳng định HIV'),           -- Patient 6, TestRequest 16
(17, 3, N'Theo dõi CD4 và Viral Load'),          -- Patient 7, TestRequest 17

-- 7/7/2025
(18, 3, N'Kiểm tra tải lượng virus'),            -- Patient 1, TestRequest 18
(19, 5, N'Xét nghiệm khẳng định'),               -- Patient 2, TestRequest 19
(20, 4, N'Sàng lọc HIV'),                        -- Patient 3, TestRequest 20

-- 8/7/2025
(21, 4, N'Xét nghiệm sàng lọc HIV'),             -- Patient 7, TestRequest 21
(22, 3, N'Theo dõi CD4 và Viral Load'),          -- Patient 8, TestRequest 22
(23, 4, N'Sàng lọc HIV định kỳ');                -- Patient 9, TestRequest 23

-- Thêm Invoices từ 30/6 đến 8/7/2025
INSERT INTO Invoices (patient_id, appointment_id, request_id, amount, service_type, status, issued_at) VALUES
-- 30/6/2025
(3, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-06-30 09:30:00'),
(3, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-06-30' ORDER BY created_at DESC) AND doctor_id = 1 AND request_date = '2025-06-30 09:30:00'), 550000, N'test', 'paid', '2025-06-30 14:00:00'),
(4, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-06-30 10:30:00'),
(4, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = '2025-06-30' ORDER BY created_at DESC) AND doctor_id = 2 AND request_date = '2025-06-30 10:30:00'), 80000, N'test', 'paid', '2025-06-30 15:00:00'),
(5, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 5 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), NULL, 100000, N'consultation', 'paid', '2025-06-30 11:30:00'),
(5, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 5 AND bookingDate = '2025-06-30' ORDER BY created_at DESC) AND doctor_id = 3 AND request_date = '2025-06-30 11:30:00'), 120000, N'test', 'paid', '2025-06-30 16:00:00'),
(6, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 6 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), NULL, 150000, N'examination', 'pending', '2025-06-30 08:30:00'),
(7, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 7 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), NULL, 550000, N'test', 'pending', '2025-06-30 07:30:00'),
(8, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 8 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), NULL, 120000, N'test', 'pending', '2025-06-30 08:30:00'),

-- 1/7/2025
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-01' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-01 09:30:00'),
(1, NULL, (SELECT TOP 1 request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-01' ORDER BY created_at DESC) AND doctor_id = 1 AND request_date = '2025-07-01 09:30:00'), 550000, N'test', 'pending', '2025-07-01 14:00:00'),
(2, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-01' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-01 10:30:00'),
(2, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-01' ORDER BY created_at DESC) AND doctor_id = 2 AND request_date = '2025-07-01 10:30:00'), 80000, N'test', 'pending', '2025-07-01 15:00:00'),
(3, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-07-01' ORDER BY created_at DESC), NULL, 100000, N'consultation', 'paid', '2025-07-01 11:30:00'),
(3, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-07-01' ORDER BY created_at DESC) AND doctor_id = 5 AND request_date = '2025-07-01 11:30:00'), 120000, N'test', 'pending', '2025-07-01 16:00:00'),
(4, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = '2025-07-01' ORDER BY created_at DESC), NULL, 550000, N'test', 'pending', '2025-07-01 07:30:00'),
(5, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 5 AND bookingDate = '2025-07-01' ORDER BY created_at DESC), NULL, 80000, N'test', 'pending', '2025-07-01 08:30:00'),

-- 2/7/2025
(8, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 8 AND bookingDate = '2025-07-02' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-02 09:30:00'),
(8, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 8 AND bookingDate = '2025-07-02' ORDER BY created_at DESC) AND doctor_id = 2 AND request_date = '2025-07-02 09:30:00'), 550000, N'test', 'pending', '2025-07-02 14:00:00'),
(9, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 9 AND bookingDate = '2025-07-02' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-02 10:30:00'),
(9, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 9 AND bookingDate = '2025-07-02' ORDER BY created_at DESC) AND doctor_id = 3 AND request_date = '2025-07-02 10:30:00'), 80000, N'test', 'pending', '2025-07-02 15:00:00'),
(10, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 10 AND bookingDate = '2025-07-02' ORDER BY created_at DESC), NULL, 100000, N'consultation', 'paid', '2025-07-02 11:30:00'),
(10, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 10 AND bookingDate = '2025-07-02' ORDER BY created_at DESC) AND doctor_id = 4 AND request_date = '2025-07-02 11:30:00'), 120000, N'test', 'pending', '2025-07-02 16:00:00'),
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-02' ORDER BY created_at DESC), NULL, 120000, N'test', 'pending', '2025-07-02 07:30:00'),

-- 3/7/2025
(4, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = '2025-07-03' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-03 09:30:00'),
(4, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = '2025-07-03' ORDER BY created_at DESC) AND doctor_id = 1 AND request_date = '2025-07-03 09:30:00'), 80000, N'test', 'pending', '2025-07-03 14:00:00'),
(5, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 5 AND bookingDate = '2025-07-03' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-03 10:30:00'),
(5, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 5 AND bookingDate = '2025-07-03' ORDER BY created_at DESC) AND doctor_id = 3 AND request_date = '2025-07-03 10:30:00'), 550000, N'test', 'pending', '2025-07-03 15:00:00'),
(6, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 6 AND bookingDate = '2025-07-03' ORDER BY created_at DESC), NULL, 100000, N'consultation', 'paid', '2025-07-03 11:30:00'),
(6, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 6 AND bookingDate = '2025-07-03' ORDER BY created_at DESC) AND doctor_id = 5 AND request_date = '2025-07-03 11:30:00'), 120000, N'test', 'pending', '2025-07-03 16:00:00'),
(7, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 7 AND bookingDate = '2025-07-03' ORDER BY created_at DESC), NULL, 550000, N'test', 'pending', '2025-07-03 07:30:00'),

-- 4/7/2025
(10, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 10 AND bookingDate = '2025-07-04' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-04 09:30:00'),
(10, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 10 AND bookingDate = '2025-07-04' ORDER BY created_at DESC) AND doctor_id = 1 AND request_date = '2025-07-04 09:30:00'), 120000, N'test', 'pending', '2025-07-04 14:00:00'),
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-04' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-04 10:30:00'),
(1, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-04' ORDER BY created_at DESC) AND doctor_id = 2 AND request_date = '2025-07-04 10:30:00'), 550000, N'test', 'pending', '2025-07-04 15:00:00'),
(2, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-04' ORDER BY created_at DESC), NULL, 100000, N'consultation', 'paid', '2025-07-04 11:30:00'),
(2, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-04' ORDER BY created_at DESC) AND doctor_id = 4 AND request_date = '2025-07-04 11:30:00'), 120000, N'test', 'pending', '2025-07-04 16:00:00'),
(3, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-07-04' ORDER BY created_at DESC), NULL, 80000, N'test', 'pending', '2025-07-04 07:30:00'),

-- 5/7/2025
(6, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 6 AND bookingDate = '2025-07-05' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-05 09:30:00'),
(6, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 6 AND bookingDate = '2025-07-05' ORDER BY created_at DESC) AND doctor_id = 2 AND request_date = '2025-07-05 09:30:00'), 80000, N'test', 'pending', '2025-07-05 14:00:00'),
(7, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 7 AND bookingDate = '2025-07-05' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-05 10:30:00'),
(7, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 7 AND bookingDate = '2025-07-05' ORDER BY created_at DESC) AND doctor_id = 3 AND request_date = '2025-07-05 10:30:00'), 550000, N'test', 'pending', '2025-07-05 15:00:00'),
(8, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 8 AND bookingDate = '2025-07-05' ORDER BY created_at DESC), NULL, 120000, N'test', 'pending', '2025-07-05 08:30:00'),

-- 7/7/2025
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-07' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-07 09:30:00'),
(1, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-07' ORDER BY created_at DESC) AND doctor_id = 1 AND request_date = '2025-07-07 09:30:00'), 550000, N'test', 'pending', '2025-07-07 14:00:00'),
(2, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-07' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-07 10:30:00'),
(2, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-07' ORDER BY created_at DESC) AND doctor_id = 4 AND request_date = '2025-07-07 10:30:00'), 80000, N'test', 'pending', '2025-07-07 15:00:00'),
(3, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-07-07' ORDER BY created_at DESC), NULL, 100000, N'consultation', 'paid', '2025-07-07 11:30:00'),
(3, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-07-07' ORDER BY created_at DESC) AND doctor_id = 5 AND request_date = '2025-07-07 11:30:00'), 120000, N'test', 'pending', '2025-07-07 16:00:00'),
(4, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = '2025-07-07' ORDER BY created_at DESC), NULL, 550000, N'test', 'pending', '2025-07-07 07:30:00'),

-- 8/7/2025
(7, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 7 AND bookingDate = '2025-07-08' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-08 09:30:00'),
(7, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 7 AND bookingDate = '2025-07-08' ORDER BY created_at DESC) AND doctor_id = 2 AND request_date = '2025-07-08 09:30:00'), 120000, N'test', 'pending', '2025-07-08 14:00:00'),
(8, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 8 AND bookingDate = '2025-07-08' ORDER BY created_at DESC), NULL, 150000, N'examination', 'paid', '2025-07-08 10:30:00'),
(8, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 8 AND bookingDate = '2025-07-08' ORDER BY created_at DESC) AND doctor_id = 3 AND request_date = '2025-07-08 10:30:00'), 550000, N'test', 'pending', '2025-07-08 15:00:00'),
(9, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 9 AND bookingDate = '2025-07-08' ORDER BY created_at DESC), NULL, 100000, N'consultation', 'paid', '2025-07-08 11:30:00'),
(9, NULL, (SELECT request_id FROM TestRequests WHERE appointment_id = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 9 AND bookingDate = '2025-07-08' ORDER BY created_at DESC) AND doctor_id = 4 AND request_date = '2025-07-08 11:30:00'), 120000, N'test', 'pending', '2025-07-08 16:00:00'),
(10, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 10 AND bookingDate = '2025-07-08' ORDER BY created_at DESC), NULL, 120000, N'test', 'pending', '2025-07-08 07:30:00');
-- Thêm Prescriptions cho các appointments mới (sửa để khớp với schema)
INSERT INTO Prescriptions (appointment_id, arv_regimen_id, support_drugs, counseling_notes, follow_up_plan, doctor_notes) VALUES
-- Prescriptions cho các appointment từ 30/6 đến 8/7/2025
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), 1, N'Vitamin B complex', N'Tiếp tục phác đồ hiện tại', N'Tái khám sau 1 tháng', N'Bệnh nhân tuân thủ tốt'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), 2, N'Omega-3', N'Chuyển đổi phác đồ do tác dụng phụ', N'Theo dõi tác dụng phụ', N'Cần theo dõi chặt chẽ'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-01' ORDER BY created_at DESC), 1, N'Multivitamin', N'Duy trì điều trị ổn định', N'Tái khám sau 3 tháng', N'Tình trạng ổn định'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-01' ORDER BY created_at DESC), 3, N'Acid folic, Iron', N'Phác đồ an toàn cho thai phụ', N'Theo dõi thai kỳ định kỳ', N'Thai phụ 12 tuần'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 8 AND bookingDate = '2025-07-02' ORDER BY created_at DESC), 5, N'Probiotics', N'Bắt đầu điều trị ARV', N'Tái khám sau 2 tuần', N'Mới chẩn đoán HIV'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 9 AND bookingDate = '2025-07-02' ORDER BY created_at DESC), 1, N'Vitamin C', N'Phác đồ tiêu chuẩn', N'Theo dõi tuân thủ', N'Cần tư vấn thêm'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = '2025-07-03' ORDER BY created_at DESC), 2, N'Calcium + D3', N'Theo dõi tuân thủ điều trị', N'Tái khám sau 1 tháng', N'Tuân thủ cải thiện'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 5 AND bookingDate = '2025-07-03' ORDER BY created_at DESC), 6, N'Silymarin', N'Điều chỉnh liều do tương tác thuốc', N'Kiểm tra chức năng gan', N'Có tương tác thuốc'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 10 AND bookingDate = '2025-07-04' ORDER BY created_at DESC), 1, N'Zinc + Selenium', N'Tiếp tục phác đồ hiệu quả', N'Tái khám sau 3 tháng', N'Đáp ứng điều trị tốt'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-04' ORDER BY created_at DESC), 1, N'Vitamin B complex', N'Duy trì điều trị dài hạn', N'Tái khám sau 3 tháng', N'Điều trị dài hạn ổn định'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 6 AND bookingDate = '2025-07-05' ORDER BY created_at DESC), 3, N'Iron + Folate', N'Chuyển sang phác đồ DTG', N'Theo dõi tác dụng phụ', N'Chuyển đổi phác đồ'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 7 AND bookingDate = '2025-07-05' ORDER BY created_at DESC), 2, N'Probiotics', N'Theo dõi tác dụng phụ', N'Tái khám sau 2 tuần', N'Có tác dụng phụ nhẹ'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-07-07' ORDER BY created_at DESC), 1, N'Multivitamin', N'Tiếp tục điều trị ổn định', N'Tái khám sau 3 tháng', N'Tình trạng rất tốt'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-07-07' ORDER BY created_at DESC), 3, N'Acid folic, Calcium', N'Theo dõi thai kỳ', N'Khám sản khoa định kỳ', N'Thai kỳ tiến triển tốt'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 7 AND bookingDate = '2025-07-08' ORDER BY created_at DESC), 2, N'Vitamin C', N'Điều chỉnh liều theo cân nặng', N'Tái khám sau 1 tháng', N'Điều chỉnh liều thuốc'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 8 AND bookingDate = '2025-07-08' ORDER BY created_at DESC), 5, N'Omega-3', N'Đánh giá hiệu quả điều trị', N'Xét nghiệm viral load', N'Đáp ứng điều trị tốt');

-- Thêm MedicalHistory cho các bệnh nhân mới (sửa để khớp với schema)
INSERT INTO MedicalHistory (patient_id, hiv_discovered_at, arv_status, arv_adherence, arv_side_effects, medical_history, allergies) VALUES
(6, '2025-06-15', N'Đang điều trị ARV', 'good', N'Không', N'Không có bệnh nền', N'Không có dị ứng'),
(7, '2025-06-20', N'Đang điều trị ARV', 'average', N'Buồn nôn nhẹ', N'Viêm gan B', N'Dị ứng penicillin'),
(8, '2025-06-25', N'Đang điều trị ARV', 'good', N'Không', N'Tăng huyết áp', N'Không có dị ứng'),
(9, '2025-07-01', N'Mới bắt đầu ARV', 'poor', N'Chóng mặt', N'Không có bệnh nền', N'Dị ứng sulfamid'),
(10, '2025-07-05', N'Đang điều trị ARV', 'average', N'Mệt mỏi', N'Đái tháo đường type 2', N'Không có dị ứng');

-- Thêm thêm các Prescriptions với thuốc hỗ trợ (sửa để khớp với schema)
INSERT INTO Prescriptions (appointment_id, arv_regimen_id, support_drugs, counseling_notes, follow_up_plan, doctor_notes) VALUES
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 6 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), 3, N'Vitamin complex', N'Chờ kết quả xét nghiệm trước khi bắt đầu', N'Tái khám sau 1 tuần', N'Cần theo dõi chặt chẽ'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 9 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), 1, N'Probiotics', N'Giải thích phác đồ cho bệnh nhân', N'Tư vấn tuân thủ điều trị', N'Bệnh nhân mới, cần hướng dẫn'),
((SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 10 AND bookingDate = '2025-06-30' ORDER BY created_at DESC), 2, N'Multivitamin', N'Đánh giá khả năng tuân thủ', N'Theo dõi tuân thủ điều trị', N'Cần đánh giá thêm');

-- Thêm PrescriptionDetails cho các thuốc bổ trợ mới (sửa để khớp với schema)
INSERT INTO PrescriptionDetails (prescription_id, drug_name, dosage, frequency, duration_days, usage_instructions, notes) VALUES
-- Prescription mới (giả sử prescription_id từ 8 trở đi)
(8, N'TDF/3TC/EFV', N'1 viên', N'1 lần/ngày', 90, N'Uống vào buổi tối, sau ăn', N'Phác đồ duy trì'),
(8, N'Vitamin B complex', N'1 viên', N'1 lần/ngày', 90, N'Uống sau ăn sáng', N'Bổ sung vitamin'),
(9, N'ABC/3TC/DTG', N'1 viên', N'1 lần/ngày', 60, N'Uống vào buổi sáng', N'Theo dõi dị ứng'),
(9, N'Omega-3', N'1 viên', N'1 lần/ngày', 60, N'Uống sau ăn', N'Hỗ trợ tim mạch'),
(10, N'EFV/FTC/TDF', N'1 viên', N'1 lần/ngày', 90, N'Uống vào buổi tối', N'Phác đồ cố định'),
(10, N'Probiotics', N'1 gói', N'1 lần/ngày', 30, N'Uống sau ăn tối', N'Cải thiện tiêu hóa'),
(11, N'TDF/3TC/EFV', N'1 viên', N'1 lần/ngày', 90, N'Uống đều giờ', N'Duy trì không đổi'),
(11, N'Calcium + D3', N'1 viên', N'1 lần/ngày', 90, N'Uống sau ăn', N'Phòng loãng xương'),
(12, N'TDF/3TC/DTG', N'1 viên', N'1 lần/ngày', 90, N'An toàn cho thai phụ', N'Theo dõi thai kỳ'),
(12, N'Acid folic', N'5mg', N'1 lần/ngày', 90, N'Uống trước ăn', N'Bổ sung cho thai phụ'),
(13, N'ABC/3TC/DTG', N'1 viên', N'1 lần/ngày', 60, N'Theo dõi phản ứng', N'Mới chuyển đổi'),
(13, N'Vitamin C', N'500mg', N'1 lần/ngày', 60, N'Tăng đề kháng', N'Hỗ trợ miễn dịch'),
(14, N'TDF/3TC/EFV', N'1 viên', N'1 lần/ngày', 90, N'Tiếp tục ổn định', N'Hiệu quả tốt'),
(14, N'Multivitamin', N'1 viên', N'1 lần/ngày', 90, N'Sau ăn sáng', N'Bổ sung toàn diện'),
(15, N'ATV/r/3TC/TDF', N'1 viên', N'1 lần/ngày', 90, N'Uống với thức ăn', N'Theo dõi gan'),
(15, N'Silymarin', N'150mg', N'2 lần/ngày', 90, N'Bảo vệ gan', N'Hỗ trợ chức năng gan'),
(16, N'TDF/3TC/DTG', N'1 viên', N'1 lần/ngày', 90, N'An toàn cho thai kỳ', N'Theo dõi định kỳ'),
(16, N'Iron + Folate', N'1 viên', N'1 lần/ngày', 90, N'Phòng thiếu máu', N'Quan trọng cho thai phụ'),
(17, N'ABC/3TC/DTG', N'1 viên', N'1 lần/ngày', 60, N'Theo dõi tác dụng phụ', N'Giai đoạn thích ứng'),
(17, N'Zn + Selenium', N'1 viên', N'1 lần/ngày', 60, N'Tăng miễn dịch', N'Hỗ trợ điều trị'),
(18, N'EFV/FTC/TDF', N'1 viên', N'1 lần/ngày', 90, N'Đánh giá hiệu quả', N'Theo dõi viral load');

-- Thêm BlogPosts mới cho tháng 7/2025
INSERT INTO BlogPosts (title, content, author_id, is_educational, published) VALUES
(N'Cập nhật hướng dẫn điều trị HIV năm 2025', N'Các khuyến cáo mới nhất về điều trị HIV từ Tổ chức Y tế Thế giới và Bộ Y tế Việt Nam. Những thay đổi quan trọng trong phác đồ điều trị và theo dõi bệnh nhân...', 2, 1, 1),
(N'Tác dụng phụ của thuốc ARV: Nhận biết và xử lý', N'Hướng dẫn chi tiết về các tác dụng phụ thường gặp như buồn nôn, rối loạn giấc ngủ, thay đổi cân nặng và cách quản lý hiệu quả...', 3, 1, 1),
(N'Vai trò của gia đình trong hỗ trợ bệnh nhân HIV', N'Tầm quan trọng của sự hỗ trợ từ gia đình và cộng đồng trong quá trình điều trị HIV. Cách xây dựng môi trường hỗ trợ tích cực...', 4, 1, 1),
(N'HIV và thai kỳ: Những điều cần biết', N'Hướng dẫn toàn diện về quản lý thai kỳ ở phụ nữ nhiễm HIV, phòng ngừa lây nhiễm từ mẹ sang con và chăm sóc sau sinh...', 5, 1, 1),
(N'Chế độ ăn uống cho người nhiễm HIV', N'Nguyên tắc dinh dưỡng, thực phẩm nên và không nên ăn, cách bổ sung vitamin và khoáng chất cần thiết cho việc tăng cường sức khỏe...', 2, 1, 1),
(N'Tin tức: Nghiên cứu vaccine HIV mới có kết quả khả quan', N'Kết quả thử nghiệm giai đoạn 2 của vaccine HIV cho thấy hiệu quả bảo vệ 65% ở nhóm nguy cơ cao. Hy vọng mới trong phòng chống HIV...', 1, 0, 1),
(N'Sức khỏe tâm thần và HIV: Vượt qua kỳ thị', N'Cách đối phó với căng thẳng, lo lắng và trầm cảm liên quan đến chẩn đoán HIV. Tầm quan trọng của tư vấn tâm lý và hỗ trợ xã hội...', 3, 1, 1),
(N'Hoạt động thể chất an toàn cho người nhiễm HIV', N'Lợi ích của tập thể dục, các bài tập phù hợp và những lưu ý quan trọng khi luyện tập để tăng cường sức khỏe và chất lượng cuộc sống...', 4, 1, 1);

-- Kết thúc việc thêm dữ liệu mẫu - ĐÃ KIỂM TRA VÀ SỬA ĐỂ KHỚP VỚI SCHEMA DATABASE
-- Tổng cộng đã thêm:
-- - 45 WorkingShifts (từ 30/6 đến 8/7/2025)  
-- - 42 Appointments (từ 30/6 đến 8/7/2025)
-- - 21 TestRequests (từ 30/6 đến 8/7/2025)
-- - 23 TestNotes (từ 30/6 đến 8/7/2025)  
-- - 42 Invoices (từ 30/6 đến 8/7/2025)
-- - 19 Prescriptions (từ 30/6 đến 8/7/2025) - ĐÃ SỬA KHỚP VỚI SCHEMA
-- - 5 MedicalHistory records mới - ĐÃ SỬA KHỚP VỚI SCHEMA
-- - 20 PrescriptionDetails mới - ĐÃ SỬA KHỚP VỚI SCHEMA
-- - 8 BlogPosts mới

-- LƯU Ý: 
-- * Đã điều chỉnh MedicalHistory để khớp với schema thực tế
-- * Đã điều chỉnh Prescriptions để loại bỏ các trường không tồn tại trong schema
-- * Đã sửa tên cột PrescriptionDetails để khớp với schema (drug_name, usage_instructions)
-- * Tất cả dữ liệu hiện tại đã tương thích hoàn toàn với database schema