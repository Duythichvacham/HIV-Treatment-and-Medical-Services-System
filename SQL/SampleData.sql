-- Dữ liệu mẫu cho cơ sở dữ liệu HIV_HEALTH_CARE (Đã chỉnh sửa và bổ sung)

-- 1. Accounts (phải đầu tiên)
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
('patient05', '$2b$10$M3pd.j2T2c2nawZEs0m9IeAru3iNRglqaGqGEnzuTL/cykzcnKG/y', 'Patient', 'active');

-- 2. Patients (cần Accounts trước)
INSERT INTO Patients (account_id, full_name, dob, gender, email, phone, address) VALUES
(13, N'Nguyễn Văn An', '1985-03-15', 'male', 'nva@email.com', '0901234567', N'123 Nguyễn Huệ, Q.1, TP.HCM'),
(14, N'Trần Thị Bình', '1990-07-22', 'female', 'ttb@email.com', '0902345678', N'456 Lê Lợi, Q.3, TP.HCM'),
(15, N'Lê Minh Cường', '1982-11-08', 'male', 'lmc@email.com', '0903456789', N'789 Hai Bà Trưng, Q.1, TP.HCM'),
(16, N'Phạm Thị Dung', '1995-01-30', 'female', 'ptd@email.com', '0904567890', N'321 Võ Văn Tần, Q.3, TP.HCM'),
(17, N'Hoàng Văn Em', '1988-09-12', 'male', 'hve@email.com', '0905678901', N'654 Pasteur, Q.1, TP.HCM'),
(18, N'Võ Thị Hoa', '1992-05-18', 'female', 'vth@email.com', '0906789012', N'987 Cống Quỳnh, Q.1, TP.HCM'),
(19, N'Đặng Văn Giang', '1987-12-03', 'male', 'dvg@email.com', '0907890123', N'159 Điện Biên Phủ, Q.3, TP.HCM'),
(20, N'Bùi Thị Kim', '1993-04-25', 'female', 'btk@email.com', '0908901234', N'753 Nguyễn Thị Minh Khai, Q.1, TP.HCM'),
(21, N'Phan Văn Long', '1986-08-14', 'male', 'pvl@email.com', '0909012345', N'246 Trần Hưng Đạo, Q.5, TP.HCM'),
(22, N'Ngô Thị Mai', '1991-10-07', 'female', 'ntm@email.com', '0900123456', N'369 Nam Kỳ Khởi Nghĩa, Q.3, TP.HCM');

-- 3. Doctors (cần Accounts trước)
INSERT INTO Doctors (account_id, full_name, email, phone, image_url, degrees, experience_years) VALUES
(2, N'BS. Nguyễn Minh Khoa', 'bs.khoa@hospital.com', '0911111111', '/images/doctor1.jpg', N'Bác sĩ chuyên khoa I - Nhiễm khuẩn', 15),
(3, N'BS. Trần Thị Lan', 'bs.lan@hospital.com', '0922222222', '/images/doctor2.jpg', N'Thạc sĩ Y học - Chuyên khoa HIV/AIDS', 10),
(4, N'BS. Lê Văn Phúc', 'bs.phuc@hospital.com', '0933333333', '/images/doctor3.jpg', N'Tiến sĩ Y học - Chuyên khoa Nội', 20),
(5, N'BS. Hoàng Thị Minh', 'bs.minh@hospital.com', '0944444444', '/images/doctor4.jpg', N'Bác sĩ chuyên khoa II - HIV/AIDS', 12),
(6, N'BS. Vũ Văn Tú', 'bs.tu@hospital.com', '0955555555', '/images/doctor5.jpg', N'Thạc sĩ Y học - Chuyên khoa Nhiễm', 8);

-- 4. ARVRegimens (độc lập)
INSERT INTO ARVRegimens (name, for_group, components) VALUES
(N'TDF/3TC/EFV', N'Người lớn', N'Tenofovir 300mg + Lamivudine 300mg + Efavirenz 600mg'),
(N'ABC/3TC/DTG', N'Người lớn', N'Abacavir 600mg + Lamivudine 300mg + Dolutegravir 50mg'),
(N'TDF/3TC/DTG', N'Thai phụ', N'Tenofovir 300mg + Lamivudine 300mg + Dolutegravir 50mg'),
(N'AZT/3TC/LPV/r', N'Trẻ em', N'Zidovudine + Lamivudine + Lopinavir/ritonavir'),
(N'ABC/3TC/RAL', N'Người cao tuổi', N'Abacavir 600mg + Lamivudine 300mg + Raltegravir 400mg'),
(N'TAF/FTC/BIC', N'Người lớn', N'Tenofovir Alafenamide 25mg + Emtricitabine 200mg + Bictegravir 50mg'),
(N'DRV/r + RAL', N'Kháng thuốc', N'Darunavir/ritonavir + Raltegravir');

-- 5. Rooms (độc lập)
INSERT INTO Rooms (room_name, room_type) VALUES
(N'Phòng khám 101', N'Khám'),
(N'Phòng khám 102', N'Khám'),
(N'Phòng khám 103', N'Khám'),
(N'Phòng khám 104', N'Khám'),
(N'Phòng khám 105', N'Khám'),
(N'Phòng xét nghiệm A', N'Xét nghiệm'),
(N'Phòng xét nghiệm B', N'Xét nghiệm'),
(N'Phòng tư vấn 1', N'Tư vấn'),
(N'Phòng tư vấn 2', N'Tư vấn'),
(N'Phòng cấp cứu', N'Cấp cứu');

-- 6. Slots (độc lập)
INSERT INTO Slots (start_time, end_time) VALUES
('07:30', '08:30'),
('08:30', '09:30'),
('09:30', '10:30'),
('10:30', '11:30'),
('13:30', '14:30'),
('14:30', '15:30'),
('15:30', '16:30'),
('16:30', '17:30');

-- 7. TestTypes (Giữ nguyên theo yêu cầu)

INSERT INTO TestTypes (name, unit, normal_range, result_type) VALUES
(N'CD4', 'cells/mm³', '500-1500', 'numeric'),
(N'HIV Viral Load', 'copies/ml', '<50', 'numeric'),
(N'Sàng lọc', '', 'Negative', 'binary'),
(N'Khẳng định', '', 'Positive', 'binary');

-- 8. Services (Giữ nguyên theo yêu cầu)

INSERT INTO Services (name, service_type, description, price, test_type_id, is_active) VALUES
(N'Khám tổng quát HIV', 'examination', N'Khám sức khỏe tổng quát cho bệnh nhân HIV', 150000, NULL, 1),
(N'Tư vấn', 'consultation', N'Tư vấn về cho bệnh nhân HIV qua online', 100000, NULL, 1),
(N'Xét nghiệm CD4', 'test', N'Đếm tế bào CD4', 200000, 1, 1),
(N'Xét nghiệm Viral Load', 'test', N'Đo tải lượng virus HIV', 350000, 2, 1),
(N'Xét nghiệm sàng lọc', 'test', N'abcxyz', 120000, 3, 1),
(N'Xét nghiệm khẳng định', 'test', N'Tầm soát viêm gan SSR', 80000, 4, 1);

-- 9. WorkingShifts (cần Accounts, Doctors, Rooms trước)
INSERT INTO WorkingShifts (account_id, doctor_id, shift_date, room_id, status, max_patients_per_slot) VALUES
(1, 1, '2025-06-23', 1, 'approved', 6),
(1, 2, '2025-06-23', 2, 'approved', 6),
(1, 3, '2025-06-23', 3, 'approved', 6),
(1, 4, '2025-06-23', 4, 'approved', 6),
(1, 5, '2025-06-23', 5, 'approved', 6),
(1, 1, '2025-06-24', 1, 'approved', 6),
(1, 2, '2025-06-24', 2, 'approved', 6),
(1, 3, '2025-06-24', 3, 'approved', 6),
(1, 1, '2025-06-25', 1, 'pending', 6),
(1, 2, '2025-06-25', 2, 'pending', 6),
(1, 4, '2025-06-26', 4, 'approved', 6),
(1, 5, '2025-06-26', 5, 'approved', 6);

-- 10. Appointments (cần Patients, Doctors, Slots, Services, Rooms trước)
INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, queue_number, room_id, bookingDate) VALUES
(1, 1, 1, 1, 'completed', 1, 1, '2025-06-21'),
(2, 2, 2, 1, 'completed', 1, 2, '2025-06-21'),
(3, 3, 3, 2, 'completed', 1, 3, '2025-06-21'),
(4, 1, 4, 1, 'completed', 2, 1, '2025-06-21'),
(5, 2, 5, 1, 'in_progress', 1, 2, '2025-06-22'),
(6, 3, 6, 1, 'requested', 1, 3, '2025-06-23'),
(7, 4, 7, 2, 'requested', 1, 4, '2025-06-23'),
(8, 5, 8, 1, 'requested', 1, 5, '2025-06-23'),
(9, 1, 1, 1, 'cancelled', 2, 1, '2025-06-22'),
(10, 2, 2, 1, 'requested', 2, 2, '2025-06-24'),
(1, 3, 3, 1, 'requested', 2, 3, '2025-06-24'),
(2, 4, 4, 2, 'requested', 1, 4, '2025-06-25');

-- 11. TestRequests (cần Doctors, Appointments, Services trước)
INSERT INTO TestRequests (doctor_id, appointment_id, service_id, request_date, approved_by_id, approved_at, status) VALUES
(1, 1, 3, '2025-06-21 09:30:00', 7, '2025-06-21 10:00:00', 'completed'),
(1, 1, 4, '2025-06-21 09:30:00', 7, '2025-06-21 10:00:00', 'completed'),
(2, 2, 3, '2025-06-21 10:30:00', 7, '2025-06-21 11:00:00', 'completed'),
(2, 2, 5, '2025-06-21 10:30:00', 7, '2025-06-21 11:00:00', 'completed'),
(3, 3, 5, '2025-06-21 11:30:00', 8, '2025-06-21 12:00:00', 'completed'),
(3, 3, 6, '2025-06-21 11:30:00', 8, '2025-06-21 12:00:00', 'completed'),
(1, 4, 3, '2025-06-21 15:30:00', 7, '2025-06-21 16:00:00', 'in_progress'),
(1, 4, 4, '2025-06-21 15:30:00', 7, '2025-06-21 16:00:00', 'requested'),
(2, 5, 3, '2025-06-22 09:30:00', NULL, NULL, 'requested'),
(4, 7, 5, '2025-06-23 08:00:00', NULL, NULL, 'requested');


-- 12. TestNotes (cần TestRequests, Appointments trước)
INSERT INTO TestNotes (request_id, appointment_id, created_by_id, test_datetime) VALUES
(1, 1, 7, '2025-06-21 14:00:00'),
(2, 1, 7, '2025-06-21 14:30:00'),
(3, 2, 8, '2025-06-21 15:00:00'),
(4, 2, 8, '2025-06-21 15:30:00'),
(5, 3, 9, '2025-06-21 16:00:00'),
(6, 3, 9, '2025-06-21 16:30:00'),
(7, 4, 7, '2025-06-21 17:00:00');

-- 13. TestResults (cần TestNotes trước)
INSERT INTO TestResults (test_note_id, result_value, unit, reference_range, notes) VALUES
(1, '650', 'cells/mm³', '500-1500', N'Kết quả bình thường'),
(2, '25', 'copies/ml', '<50', N'Tải lượng virus không phát hiện được'),
(3, '720', 'cells/mm³', '500-1500', N'CD4 trong giới hạn bình thường'),
(4, 'Negative', '', 'Negative', N'Kết quả âm tính'),
(5, 'Negative', '', 'Negative', N'Sàng lọc âm tính'),
(6, 'Positive', '', 'Positive', N'Kết quả dương tính cần theo dõi'),
(7, '480', 'cells/mm³', '500-1500', N'CD4 hơi thấp, cần theo dõi');

-- 14. MedicalHistory (cần Patients trước)
INSERT INTO MedicalHistory (patient_id, hiv_discovered_at, arv_status, arv_adherence, arv_side_effects, medical_history, allergies) VALUES
(1, '2020-03-15', N'Đang điều trị', 'good', N'Không có tác dụng phụ', N'Không có bệnh lý đi kèm', N'Không dị ứng thuốc'),
(2, '2019-11-20', N'Đang điều trị', 'average', N'Buồn nôn nhẹ', N'Tiểu đường type 2', N'Dị ứng Penicillin'),
(3, '2021-07-10', N'Mới bắt đầu', 'good', N'Chưa có', N'Cao huyết áp', N'Không dị ứng thuốc'),
(4, '2022-01-05', N'Đang điều trị', 'poor', N'Mệt mỏi, chóng mặt', N'Không có', N'Dị ứng tôm cua'),
(5, '2020-09-30', N'Đang điều trị', 'good', N'Không có', N'Viêm gan B đã khỏi', N'Không dị ứng thuốc'),
(6, '2018-05-12', N'Đang điều trị', 'good', N'Rối loạn giấc ngủ nhẹ', N'Viêm gan C mạn tính', N'Dị ứng Aspirin'),
(7, '2023-02-28', N'Mới bắt đầu', 'average', N'Buồn nôn, mệt mỏi', N'Không có', N'Không dị ứng thuốc'),
(8, '2021-12-15', N'Đang điều trị', 'good', N'Không có', N'Bệnh thận mạn giai đoạn 2', N'Dị ứng Sulfonamide'),
(9, '2019-06-03', N'Đang điều trị', 'average', N'Chóng mặt nhẹ', N'Cao cholesterol máu', N'Không dị ứng thuốc'),
(10, '2022-08-20', N'Đang điều trị', 'good', N'Không có', N'Viêm khớp dạng thấp', N'Dị ứng Iodine');

-- 15. ClinicalExams (cần Appointments trước)
INSERT INTO ClinicalExams (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary) VALUES
(1, N'Huyết áp: 120/80, Mạch: 72/phút, Nhiệt độ: 36.5°C', 65.5, 170.0, 22.7, N'Không có dấu hiệu bất thường', N'HIV giai đoạn ổn định', N'Không có'),
(2, N'Huyết áp: 130/85, Mạch: 78/phút, Nhiệt độ: 36.8°C', 58.2, 162.0, 22.2, N'Hơi mệt mỏi', N'HIV với biến chứng nhẹ', N'Tiểu đường type 2'),
(3, N'Huyết áp: 140/90, Mạch: 80/phút, Nhiệt độ: 37.0°C', 72.0, 168.0, 25.5, N'Cao huyết áp', N'HIV mới phát hiện', N'Cao huyết áp grade 1'),
(4, N'Huyết áp: 125/82, Mạch: 75/phút, Nhiệt độ: 36.7°C', 68.3, 175.0, 22.3, N'Tình trạng ổn định', N'HIV giai đoạn mãn tính', N'Không có'),
(5, N'Huyết áp: 135/88, Mạch: 82/phút, Nhiệt độ: 36.9°C', 55.8, 160.0, 21.8, N'Có dấu hiệu stress', N'HIV đang điều trị', N'Rối loạn lo âu nhẹ');

-- 16. Prescriptions (cần Appointments, ARVRegimens trước)
INSERT INTO Prescriptions (appointment_id, arv_regimen_id, support_drugs, counseling_notes, follow_up_plan, doctor_notes) VALUES
(1, 1, N'Vitamin B complex, Calcium', N'Tiếp tục tuân thủ điều trị, ăn uống đầy đủ dinh dưỡng', N'Tái khám sau 3 tháng, xét nghiệm CD4 và Viral Load', N'Bệnh nhân tuân thủ điều trị tốt'),
(2, 2, N'Metformin 500mg, Vitamin D', N'Kiểm soát đường huyết, tập thể dục nhẹ nhàng', N'Tái khám sau 1 tháng, theo dõi đường huyết', N'Cần theo dõi tương tác thuốc ARV và Metformin'),
(3, 3, N'Amlodipine 5mg', N'Kiểm soát huyết áp, giảm muối ăn', N'Tái khám sau 2 tuần, đo huyết áp tại nhà', N'Bắt đầu điều trị ARV, cần theo dõi sát'),
(4, 1, N'Omega-3, Vitamin C', N'Tăng cường sức đề kháng, nghỉ ngơi đầy đủ', N'Tái khám sau 6 tuần, xét nghiệm CD4', N'Bệnh nhân có tiến triển tốt'),
(5, 6, N'Probiotics, Zinc', N'Hỗ trợ tiêu hóa, giảm stress', N'Tái khám sau 4 tuần, đánh giá tác dụng phụ', N'Chuyển đổi phác đồ mới, theo dõi sát');

-- 17. PrescriptionDetails (cần Prescriptions trước)
INSERT INTO PrescriptionDetails (prescription_id, drug_name, dosage, frequency, duration_days, usage_instructions, notes) VALUES
(1, N'TDF/3TC/EFV', '1 viên', N'1 lần/ngày', 90, N'Uống vào buổi tối, sau ăn', N'Tránh uống cùng với sữa'),
(1, N'Vitamin B complex', '1 viên', N'1 lần/ngày', 90, N'Uống sau ăn sáng', N''),
(2, N'ABC/3TC/DTG', '1 viên', N'1 lần/ngày', 30, N'Uống vào buổi sáng, sau ăn', N'Theo dõi dị ứng'),
(2, N'Metformin', '500mg', N'2 lần/ngày', 30, N'Uống sau ăn sáng và tối', N'Theo dõi đường huyết'),
(3, N'TDF/3TC/DTG', '1 viên', N'1 lần/ngày', 30, N'Uống vào buổi sáng, sau ăn', N'Liều khởi đầu'),
(3, N'Amlodipine', '5mg', N'1 lần/ngày', 30, N'Uống vào buổi sáng', N'Theo dõi huyết áp'),
(4, N'TDF/3TC/EFV', '1 viên', N'1 lần/ngày', 90, N'Uống vào buổi tối, sau ăn', N'Tiếp tục phác đồ cũ'),
(4, N'Omega-3', '1000mg', N'1 lần/ngày', 90, N'Uống sau ăn tối', N''),
(5, N'TAF/FTC/BIC', '1 viên', N'1 lần/ngày', 30, N'Uống vào buổi sáng, sau ăn', N'Phác đồ mới, theo dõi tác dụng phụ'),
(5, N'Probiotics', '1 viên', N'2 lần/ngày', 30, N'Uống sau ăn sáng và tối', N'Hỗ trợ tiêu hóa');

-- 18. BlogPosts (cần Accounts trước)
INSERT INTO BlogPosts (title, content, author_id, is_educational, published) VALUES
(N'Hiểu về HIV và cách phòng tránh', N'HIV là virus gây suy giảm miễn dịch ở người. Bài viết này sẽ giúp bạn hiểu rõ hơn về HIV và các biện pháp phòng tránh hiệu quả...', 2, 1, 1),
(N'Tầm quan trọng của việc tuân thủ điều trị ARV', N'Việc uống thuốc ARV đúng giờ, đủ liều là vô cùng quan trọng trong điều trị HIV. Bài viết chia sẻ những lưu ý cần thiết...', 3, 1, 1),
(N'Dinh dưỡng cho người nhiễm HIV', N'Chế độ dinh dưỡng hợp lý giúp tăng cường sức khỏe và hiệu quả điều trị. Hãy cùng tìm hiểu những thực phẩm nên và không nên ăn...', 4, 1, 1),
(N'Tin tức: Nghiên cứu mới về điều trị HIV', N'Các nhà khoa học vừa công bố kết quả nghiên cứu mới về phương pháp điều trị HIV hiệu quả hơn...', 1, 0, 1),
(N'Quản lý tác dụng phụ của thuốc ARV', N'Hướng dẫn cách nhận biết và xử lý các tác dụng phụ thường gặp khi điều trị ARV...', 5, 1, 1),
(N'HIV và thai kỳ: Những điều cần biết', N'Thông tin quan trọng cho phụ nữ mang thai nhiễm HIV về cách bảo vệ thai nhi...', 6, 1, 1),
(N'Sống tích cực với HIV', N'Chia sẻ kinh nghiệm và động lực từ những người đang sống khỏe mạnh với HIV...', 2, 1, 1),
(N'Cập nhật: Thuốc ARV thế hệ mới', N'Tin tức về các loại thuốc ARV mới có hiệu quả cao và ít tác dụng phụ...', 1, 0, 1);

-- 19. Invoices (cần Patients, Appointments, TestRequests trước)
INSERT INTO Invoices (patient_id, appointment_id, request_id, amount, service_type, status, issued_at) VALUES
(1, 1, NULL, 150000, N'Khám bệnh', 'paid', '2025-06-21 09:00:00'),
(1, NULL, 1, 200000, N'Xét nghiệm CD4', 'paid', '2025-06-21 14:00:00'),
(1, NULL, 2, 350000, N'Xét nghiệm Viral Load', 'paid', '2025-06-21 14:30:00'),
(2, 2, NULL, 150000, N'Khám bệnh', 'paid', '2025-06-21 10:00:00'),
(2, NULL, 3, 200000, N'Xét nghiệm CD4', 'paid', '2025-06-21 15:00:00'),
(2, NULL, 4, 120000, N'Xét nghiệm sàng lọc', 'paid', '2025-06-21 15:30:00'),
(3, 3, NULL, 100000, N'Tư vấn', 'paid', '2025-06-21 11:00:00'),
(3, NULL, 5, 120000, N'Xét nghiệm sàng lọc', 'paid', '2025-06-21 16:00:00'),
(3, NULL, 6, 80000, N'Xét nghiệm khẳng định', 'paid', '2025-06-21 16:30:00'),
(4, 4, NULL, 150000, N'Khám bệnh', 'paid', '2025-06-21 15:00:00'),
(4, NULL, 7, 200000, N'Xét nghiệm CD4', 'pending', '2025-06-21 17:00:00'),
(4, NULL, 8, 350000, N'Xét nghiệm Viral Load', 'pending', '2025-06-21 17:00:00'),
(5, 5, NULL, 150000, N'Khám bệnh', 'pending', NULL),
(6, 6, NULL, 150000, N'Khám bệnh', 'pending', NULL),
(7, 7, NULL, 100000, N'Tư vấn', 'pending', NULL),
(8, 8, NULL, 150000, N'Khám bệnh', 'pending', NULL),
(10, 10, NULL, 150000, N'Khám bệnh', 'pending', NULL),
(1, 11, NULL, 150000, N'Khám bệnh', 'pending', NULL),
(2, 12, NULL, 100000, N'Tư vấn', 'pending', NULL);