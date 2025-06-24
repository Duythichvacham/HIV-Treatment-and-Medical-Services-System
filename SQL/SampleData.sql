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
(5, 4); -- Xét nghiệm khẳng định -> Khẳng định


-- 10. WorkingShifts
INSERT INTO WorkingShifts (account_id, doctor_id, lab_staff_id, registration_staff_id, shift_date, room_id, status, max_patients_per_slot) VALUES
(1, 1, NULL, NULL, '2025-06-23', 1, 'approved', 6),
(1, 2, NULL, NULL, '2025-06-23', 2, 'approved', 6),
(1, 3, NULL, NULL, '2025-06-23', 3, 'approved', 6),
(1, 4, NULL, NULL, '2025-06-24', 4, 'approved', 6),
(1, 5, NULL, NULL, '2025-06-24', 5, 'approved', 6),
(1, NULL, 5, NULL, '2025-06-23', 6, 'approved', NULL),
(1, NULL, 6, NULL, '2025-06-23', 10, 'approved', NULL),
(1, NULL, NULL, 7, '2025-06-23', NULL, 'approved', NULL),
(1, NULL, NULL, 8, '2025-06-24', NULL, 'approved', NULL),
(1, 1, NULL, NULL, '2025-06-25', 11, 'approved', 6),
(1, 2, NULL, NULL, '2025-06-25', 1, 'approved', 6);

-- 11. Appointments
INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, queue_number, room_id, bookingDate) VALUES
(1, 1, 1, 1, 'completed', 1, 1, '2025-06-23'),
(2, 2, 2, 1, 'completed', 1, 2, '2025-06-23'),
(3, 3, 3, 2, 'completed', 1, 7, '2025-06-23'),
(4, 4, 1, 1, 'in_progress', 1, 4, '2025-06-24'),
(5, 5, 2, 1, 'requested', 1, 5, '2025-06-24'),
(6, 1, 3, 1, 'completed', 1, 1, '2025-06-23'),
(7, 2, 4, 2, 'completed', 1, 8, '2025-06-23'),
(8, NULL, 1, 3, 'in_progress', 1, 6, '2025-06-24'),
(9, NULL, 2, 4, 'requested', 1, 10, '2025-06-24'),
(10, 3, 1, 1, 'requested', 1, 11, '2025-06-25'),
(1, 4, 5, 1, 'completed', 1, 4, '2025-06-24'),
(2, NULL, 6, 5, 'completed', 1, 6, '2025-06-24');

-- 12. TestRequests
INSERT INTO TestRequests (doctor_id, appointment_id, service_id, request_date, approved_by_id, approved_at, status) VALUES
(1, 1, 3, '2025-06-23 09:30:00', 7, '2025-06-23 10:00:00', 'completed'),
(1, 1, 5, '2025-06-23 09:30:00', 7, '2025-06-23 10:00:00', 'completed'),
(2, 2, 3, '2025-06-23 10:30:00', 7, '2025-06-23 11:00:00', 'completed'),
(3, 3, 4, '2025-06-23 11:30:00', 8, '2025-06-23 12:00:00', 'completed'),
(2, 6, 5, '2025-06-23 11:30:00', NULL, NULL, 'requested'),
(4, 4, 3, '2025-06-24 08:30:00', 7, '2025-06-24 09:00:00', 'in_progress'),
(5, 11, 5, '2025-06-24 13:30:00', 8, '2025-06-24 14:00:00', 'completed'),
(3, 8, 3, '2025-06-24 07:30:00', 7, '2025-06-24 08:00:00', 'in_progress'),
(1, 9, 4, '2025-06-24 08:30:00', NULL, NULL, 'requested'),
(2, 12, 5, '2025-06-24 14:30:00', 8, '2025-06-24 15:00:00', 'completed');

-- 13. TestNotes
INSERT INTO TestNotes (request_id, appointment_id, created_by_id, test_datetime, notes) VALUES
(1, 1, 5, '2025-06-23 14:00:00', N'Kết quả bình thường'),
(2, 1, 5, '2025-06-23 14:30:00', N'Tải lượng virus không phát hiện được'),
(3, 2, 6, '2025-06-23 15:00:00', N'Xác nhận dương tính'),
(4, 3, 6, '2025-06-23 15:30:00', N'CD4 trong giới hạn bình thường'),
(5, 6, 5, '2025-06-23 16:00:00', N'Sàng lọc âm tính'),
(6, 4, 5, '2025-06-24 09:30:00', N'Kết quả dương tính cần theo dõi'),
(7, 11, 6, '2025-06-24 15:00:00', N'CD4 ổn định'),
(8, 8, 5, '2025-06-24 08:30:00', N'Tải lượng virus thấp'),
(9, 9, 6, '2025-06-24 09:00:00', N'Kết quả tốt'),
(10, 12, 5, '2025-06-24 15:30:00', N'Sàng lọc âm tính');

-- 14. TestResults
INSERT INTO TestResults (test_note_id, result_value, unit, reference_range) VALUES
(1, '650', 'cells/mm³', '500-1500'),
(1, '25', 'copies/ml', '<50'),
(2, 'Positive', '', 'Positive'),
(3, '720', 'cells/mm³', '500-1500'),
(4, 'Negative', '', 'Negative'),
(5, 'Positive', '', 'Positive'),
(6, '580', 'cells/mm³', '500-1500'),
(7, '45', 'copies/ml', '<50'),
(8, '680', 'cells/mm³', '500-1500'),
(9, 'Negative', '', 'Negative'),
(10, 'Positive', '', 'Positive');

-- 15. MedicalHistory
INSERT INTO MedicalHistory (patient_id, hiv_discovered_at, arv_status, arv_adherence, arv_side_effects, medical_history, allergies) VALUES
(1, '2020-03-15', N'Đang điều trị', 'good', N'Không có tác dụng phụ', N'Không có bệnh lý đi kèm', N'Không dị ứng thuốc'),
(2, '2019-11-20', N'Đang điều trị', 'average', N'Buồn nôn nhẹ', N'Tiểu đường type 2', N'Dị ứng Penicillin'),
(3, '2021-07-10', N'Mới bắt đầu', 'good', N'Chưa có', N'Cao huyết áp', N'Không dị ứng thuốc'),
(4, '2022-01-05', N'Đang điều trị', 'poor', N'Mệt mỏi, chóng mặt', N'Không có', N'Dị ứng tôm cua'),
(5, '2020-09-30', N'Đang điều trị', 'good', N'Không có', N'Viêm gan B đã khỏi', N'Không dị ứng thuốc'),
(6, '2021-04-12', N'Đang điều trị', 'good', N'Ngứa nhẹ', N'Không có', N'Không dị ứng thuốc'),
(7, '2020-06-25', N'Mới bắt đầu', 'average', N'Chóng mặt', N'Không có', N'Dị ứng phấn hoa'),
(8, '2022-03-18', N'Đang điều trị', 'poor', N'Buồn nôn', N'Viêm dạ dày', N'Không dị ứng thuốc'),
(9, '2021-09-07', N'Chưa điều trị', NULL, NULL, N'Không có', N'Không dị ứng thuốc'),
(10, '2020-12-30', N'Đang điều trị', 'good', N'Không có', N'Không có', N'Dị ứng lông mèo');

-- 16. ClinicalExams
INSERT INTO ClinicalExams (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary) VALUES
(1, N'Huyết áp: 120/80, Mạch: 72/phút, Nhiệt độ: 36.5°C', 65.5, 170.0, 22.7, N'Không có dấu hiệu bất thường', N'HIV giai đoạn ổn định', N'Không có'),
(2, N'Huyết áp: 130/85, Mạch: 78/phút, Nhiệt độ: 36.8°C', 58.2, 162.0, 22.2, N'Hơi mệt mỏi', N'HIV với biến chứng nhẹ', N'Tiểu đường type 2'),
(3, N'Huyết áp: 140/90, Mạch: 80/phút, Nhiệt độ: 37.0°C', 72.0, 168.0, 25.5, N'Cao huyết áp', N'HIV mới phát hiện', N'Cao huyết áp grade 1'),
(4, N'Huyết áp: 125/82, Mạch: 75/phút, Nhiệt độ: 36.7°C', 68.3, 175.0, 22.3, N'Tình trạng ổn định', N'HIV giai đoạn mãn tính', N'Không có'),
(5, N'Huyết áp: 135/88, Mạch: 82/phút, Nhiệt độ: 36.9°C', 55.8, 160.0, 21.8, N'Có dấu hiệu stress', N'HIV đang điều trị', N'Rối loạn lo âu nhẹ'),
(6, N'Huyết áp: 118/78, Mạch: 70/phút, Nhiệt độ: 36.6°C', 60.5, 165.0, 22.2, N'Ổn định', N'HIV giai đoạn ổn định', N'Không có'),
(7, N'Huyết áp: 145/92, Mạch: 85/phút, Nhiệt độ: 37.1°C', 75.0, 170.0, 26.0, N'Huyết áp cao', N'HIV mới phát hiện', N'Cao huyết áp grade 2'),
(11, N'Huyết áp: 122/80, Mạch: 74/phút, Nhiệt độ: 36.5°C', 70.2, 172.0, 23.7, N'Bình thường', N'HIV giai đoạn mãn tính', N'Không có');

-- 17. Prescriptions
INSERT INTO Prescriptions (appointment_id, arv_regimen_id, support_drugs, counseling_notes, follow_up_plan, doctor_notes) VALUES
(1, 1, N'Vitamin B complex, Calcium', N'Tiếp tục tuân thủ điều trị, ăn uống đầy đủ dinh dưỡng', N'Tái khám sau 3 tháng, xét nghiệm CD4 và Viral Load', N'Bệnh nhân tuân thủ điều trị tốt'),
(2, 2, N'Metformin 500mg, Vitamin D', N'Kiểm soát đường huyết, tập thể dục nhẹ nhàng', N'Tái khám sau 1 tháng, theo dõi đường huyết', N'Cần theo dõi tương tác thuốc ARV và Metformin'),
(3, 3, N'Amlodipine 5mg', N'Kiểm soát huyết áp, giảm muối ăn', N'Tái khám sau 2 tuần, đo huyết áp tại nhà', N'Bắt đầu điều trị ARV, cần theo dõi sát'),
(4, 1, N'Omega-3, Vitamin C', N'Tăng cường sức đề kháng, nghỉ ngơi đầy đủ', N'Tái khám sau 6 tuần, xét nghiệm CD4', N'Bệnh nhân có tiến triển tốt'),
(5, 4, N'Probiotics, Zinc', N'Hỗ trợ tiêu hóa, giảm stress', N'Tái khám sau 4 tuần, đánh giá tác dụng phụ', N'Chuyển đổi phác đồ mới, theo dõi sát'),
(6, 5, N'Vitamin A', N'Tuân thủ điều trị, bổ sung dinh dưỡng', N'Tái khám sau 2 tháng', N'Tình trạng ổn định'),
(11, 6, N'Calcium, Vitamin D', N'Tăng cường sức khỏe xương', N'Tái khám sau 3 tháng, xét nghiệm CD4', N'Phác đồ hiệu quả');

-- 18. PrescriptionDetails
INSERT INTO PrescriptionDetails (prescription_id, drug_name, dosage, frequency, duration_days, usage_instructions, notes) VALUES
(1, N'TDF/3TC/EFV', N'1 viên', N'1 lần/ngày', 90, N'Uống vào buổi tối, sau ăn', N'Tránh uống cùng với sữa'),
(1, N'Vitamin B complex', N'1 viên', N'1 lần/ngày', 90, N'Uống sau ăn sáng', N''),
(2, N'ABC/3TC/DTG', N'1 viên', N'1 lần/ngày', 30, N'Uống vào buổi sáng, sau ăn', N'Theo dõi dị ứng'),
(2, N'Metformin', N'500mg', N'2 lần/ngày', 30, N'Uống sau ăn sáng và tối', N'Theo dõi đường huyết'),
(3, N'TDF/3TC/DTG', N'1 viên', N'1 lần/ngày', 30, N'Uống vào buổi sáng, sau ăn', N'Liều khởi đầu'),
(3, N'Amlodipine', N'5mg', N'1 lần/ngày', 30, N'Uống vào buổi sáng', N'Theo dõi huyết áp'),
(4, N'TDF/3TC/EFV', N'1 viên', N'1 lần/ngày', 90, N'Uống vào buổi tối, sau ăn', N'Tiếp tục phác đồ cũ'),
(4, N'Omega-3', N'1 viên', N'1 lần/ngày', 42, N'Uống sau ăn', N''),
(4, N'Vitamin C', N'500mg', N'1 lần/ngày', 42, N'Uống sau ăn sáng', N''),
(5, N'AZT/3TC/LPV/r', N'1 viên', N'2 lần/ngày', 30, N'Uống sau ăn sáng và tối', N'Phác đồ cho trẻ em'),
(5, N'Probiotics', N'1 gói', N'1 lần/ngày', 28, N'Uống sau ăn tối', N''),
(5, N'Zinc', N'10mg', N'1 lần/ngày', 28, N'Uống sau ăn', N''),
(6, N'EFV/FTC/TDF', N'1 viên', N'1 lần/ngày', 60, N'Uống vào buổi tối, sau ăn', N''),
(6, N'Vitamin A', N'5000 IU', N'1 lần/ngày', 60, N'Uống sau ăn', N''),
(7, N'ATV/r/3TC/TDF', N'1 viên', N'1 lần/ngày', 90, N'Uống vào buổi tối, sau ăn', N'Theo dõi chức năng gan'),
(7, N'Calcium', N'500mg', N'2 lần/ngày', 90, N'Uống sau ăn sáng và tối', N''),
(7, N'Vitamin D', N'1000 IU', N'1 lần/ngày', 90, N'Uống sau ăn sáng', N'');

-- 19. BlogPosts
INSERT INTO BlogPosts (title, content, author_id, is_educational, published) VALUES
(N'Hiểu về HIV và cách phòng tránh', N'HIV là virus gây suy giảm miễn dịch ở người. Virus này tấn công hệ thống miễn dịch, đặc biệt là các tế bào CD4, làm suy yếu khả năng chống lại các bệnh nhiễm trùng và ung thư...', 2, 1, 1),
(N'Tầm quan trọng của việc tuân thủ điều trị ARV', N'Việc uống thuốc ARV đúng giờ, đủ liều là yếu tố quyết định thành công của điều trị. Tuân thủ điều trị giúp giảm tải lượng virus xuống mức không phát hiện được...', 3, 1, 1),
(N'Dinh dưỡng cho người nhiễm HIV', N'Chế độ dinh dưỡng hợp lý giúp tăng cường sức khỏe và hỗ trợ điều trị hiệu quả. Cần bổ sung đầy đủ protein, vitamin và khoáng chất...', 4, 1, 1),
(N'Tin tức: Nghiên cứu mới về điều trị HIV', N'Các nhà khoa học vừa công bố kết quả nghiên cứu mới về phương pháp điều trị HIV hiệu quả hơn với ít tác dụng phụ...', 1, 0, 1),
(N'Quản lý tác dụng phụ của thuốc ARV', N'Hướng dẫn cách nhận biết và xử lý các tác dụng phụ thường gặp khi sử dụng thuốc ARV như buồn nôn, chóng mặt, mệt mỏi...', 5, 1, 1),
(N'Hỗ trợ tâm lý cho bệnh nhân HIV', N'Tầm quan trọng của sức khỏe tinh thần trong quá trình điều trị HIV. Cách vượt qua tâm lý lo lắng và xây dựng lối sống tích cực...', 2, 1, 1),
(N'Phòng ngừa lây nhiễm HIV ở phụ nữ mang thai', N'Hướng dẫn điều trị ARV cho thai phụ nhằm phòng ngừa lây nhiễm từ mẹ sang con. Các biện pháp theo dõi trong thai kỳ...', 3, 1, 1);

-- 20. Invoices
INSERT INTO Invoices (patient_id, appointment_id, request_id, amount, service_type, status, issued_at) VALUES
(1, 1, NULL, 150000, N'Khám bệnh', 'paid', '2025-06-23 09:30:00'),
(1, NULL, 1, 550000, N'Xét nghiệm', 'paid', '2025-06-23 14:00:00'),
(1, NULL, 2, 80000, N'Xét nghiệm', 'paid', '2025-06-23 14:30:00'),
(2, 2, NULL, 150000, N'Khám bệnh', 'paid', '2025-06-23 10:30:00'),
(2, NULL, 3, 550000, N'Xét nghiệm', 'paid', '2025-06-23 15:00:00'),
(3, 3, NULL, 100000, N'Tư vấn', 'paid', '2025-06-23 11:30:00'),
(3, NULL, 4, 120000, N'Xét nghiệm', 'paid', '2025-06-23 15:30:00'),
(4, 4, NULL, 150000, N'Khám bệnh', 'pending', '2025-06-24 08:30:00'),
(4, NULL, 6, 550000, N'Xét nghiệm', 'pending', '2025-06-24 09:30:00'),
(5, 5, NULL, 150000, N'Khám bệnh', 'pending', '2025-06-24 09:30:00'),
(6, 6, NULL, 150000, N'Khám bệnh', 'paid', '2025-06-23 11:30:00'),
(6, NULL, 5, 80000, N'Xét nghiệm', 'pending', '2025-06-23 16:00:00'),
(7, 7, NULL, 100000, N'Tư vấn', 'paid', '2025-06-23 12:30:00'),
(8, 8, NULL, 550000, N'Xét nghiệm', 'pending', '2025-06-24 07:30:00'),
(8, NULL, 8, 550000, N'Xét nghiệm', 'pending', '2025-06-24 08:30:00'),
(9, 9, NULL, 120000, N'Xét nghiệm', 'pending', '2025-06-24 08:30:00'),
(9, NULL, 9, 120000, N'Xét nghiệm', 'pending', '2025-06-24 09:00:00'),
(10, 10, NULL, 150000, N'Khám bệnh', 'pending', '2025-06-25 07:30:00'),
(1, 11, NULL, 150000, N'Khám bệnh', 'paid', '2025-06-24 13:30:00'),
(1, NULL, 7, 80000, N'Xét nghiệm', 'paid', '2025-06-24 15:00:00'),
(2, 12, NULL, 80000, N'Xét nghiệm', 'paid', '2025-06-24 14:30:00'),
(2, NULL, 10, 80000, N'Xét nghiệm', 'paid', '2025-06-24 15:30:00');