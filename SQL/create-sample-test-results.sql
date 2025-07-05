-- Script tạo sample data có kết quả xét nghiệm
USE HIV_HEALTH_CARE;

-- Tạo TestNotes cho request_id = 17 (Xét nghiệm CD4 và Viral Load)
INSERT INTO TestNotes (request_id, appointment_id, created_by_id, test_datetime, notes) 
VALUES (17, 1, 2, GETDATE(), 'Kết quả xét nghiệm CD4 và Viral Load cho bệnh nhân');

-- Lấy test_note_id vừa tạo
DECLARE @test_note_id INT = SCOPE_IDENTITY();

-- Tạo kết quả cho CD4 (test_type_id = 3)
INSERT INTO TestResults (test_note_id, test_type_id, result_value, unit, reference_range) 
VALUES (@test_note_id, 3, '450', 'cells/mm³', '500-1500');

-- Tạo kết quả cho Viral Load (test_type_id = 4) 
INSERT INTO TestResults (test_note_id, test_type_id, result_value, unit, reference_range) 
VALUES (@test_note_id, 4, 'Không phát hiện', 'copies/ml', '<50');

-- Tạo TestNotes cho request_id = 18 (test mới tạo)
INSERT INTO TestNotes (request_id, appointment_id, created_by_id, test_datetime, notes) 
VALUES (18, 1, 2, GETDATE(), 'Kết quả xét nghiệm CD4 và Viral Load lần 2');

-- Lấy test_note_id thứ 2
DECLARE @test_note_id2 INT = SCOPE_IDENTITY();

-- Tạo kết quả cho CD4 
INSERT INTO TestResults (test_note_id, test_type_id, result_value, unit, reference_range) 
VALUES (@test_note_id2, 3, '520', 'cells/mm³', '500-1500');

-- Tạo kết quả cho Viral Load 
INSERT INTO TestResults (test_note_id, test_type_id, result_value, unit, reference_range) 
VALUES (@test_note_id2, 4, '<20', 'copies/ml', '<50');

PRINT 'Sample test results created successfully!';
