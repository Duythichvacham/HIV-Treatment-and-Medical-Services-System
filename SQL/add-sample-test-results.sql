-- Tạo sample data cho TestNotes và TestResults để test hiển thị kết quả xét nghiệm

-- Tạo TestNote cho request_id = 17 (CD4 và Viral Load test)
INSERT INTO TestNotes (request_id, appointment_id, created_by_id, notes) 
VALUES (17, 1, 6, 'Kết quả xét nghiệm CD4 và Viral Load');

-- Lấy test_note_id vừa tạo
DECLARE @test_note_id INT = SCOPE_IDENTITY();
PRINT 'Created TestNote with ID: ' + CAST(@test_note_id AS VARCHAR);

-- Tạo kết quả cho CD4 (test_type_id = 1)
INSERT INTO TestResults (test_note_id, test_type_id, result_value, unit, reference_range) 
VALUES (@test_note_id, 1, '450', 'cells/mm³', '500-1500');
PRINT 'Created TestResult for CD4';

-- Tạo TestNote cho request_id = 18 (CD4 và Viral Load test)
INSERT INTO TestNotes (request_id, appointment_id, created_by_id, notes) 
VALUES (18, 1, 6, 'Kết quả xét nghiệm CD4 và Viral Load lần 2');

-- Lấy test_note_id vừa tạo
DECLARE @test_note_id2 INT = SCOPE_IDENTITY();
PRINT 'Created TestNote with ID: ' + CAST(@test_note_id2 AS VARCHAR);

-- Tạo kết quả cho request thứ 2
INSERT INTO TestResults (test_note_id, test_type_id, result_value, unit, reference_range) 
VALUES (@test_note_id2, 2, '<40', 'copies/mL', '<40 không phát hiện');
PRINT 'Created TestResult for Viral Load';

-- Cập nhật status của test requests đã có kết quả
UPDATE TestRequests SET status = 'completed' WHERE request_id IN (17, 18);
PRINT 'Updated TestRequests status to completed';

SELECT 'Sample test results created successfully' AS Result;
