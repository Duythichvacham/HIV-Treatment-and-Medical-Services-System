-- ===========================================================
-- REGISTRATION STAFF TEST DATA CREATION SCRIPT
-- Created: 2025-06-30
-- Purpose: Create clean test data for Registration Staff testing
-- ===========================================================

USE HIV_HEALTH_CARE;

PRINT 'Creating Registration Staff test data...';

-- ===========================================================
-- STEP 1: CREATE APPOINTMENTS FOR TODAY
-- ===========================================================

DECLARE @today DATE = CAST(GETDATE() AS DATE);

-- Create 5 completed appointments for today (using existing patients 1-5)
INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, room_id, bookingDate, created_at) VALUES
(1, 1, 1, 1, 'completed', 1, @today, DATEADD(HOUR, -6, GETDATE())),
(2, 2, 2, 1, 'completed', 2, @today, DATEADD(HOUR, -5, GETDATE())),
(3, 3, 3, 1, 'completed', 3, @today, DATEADD(HOUR, -4, GETDATE())),
(4, 1, 6, 1, 'completed', 1, @today, DATEADD(HOUR, -3, GETDATE())),
(5, 2, 7, 1, 'completed', 2, @today, DATEADD(HOUR, -2, GETDATE()));

PRINT 'Created 5 appointments for today';

-- ===========================================================
-- STEP 2: CREATE TEST REQUESTS 
-- ===========================================================

-- Get the appointment IDs we just created
DECLARE @apt1 INT = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = @today ORDER BY appointment_id DESC);
DECLARE @apt2 INT = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = @today ORDER BY appointment_id DESC);
DECLARE @apt3 INT = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = @today ORDER BY appointment_id DESC);
DECLARE @apt4 INT = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 4 AND bookingDate = @today ORDER BY appointment_id DESC);
DECLARE @apt5 INT = (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 5 AND bookingDate = @today ORDER BY appointment_id DESC);

-- Create 3 test requests needing Registration approval (status = 'requested')
INSERT INTO TestRequests (doctor_id, appointment_id, request_date, status) VALUES
(1, @apt1, DATEADD(HOUR, -6, GETDATE()), 'requested'),
(2, @apt2, DATEADD(HOUR, -5, GETDATE()), 'requested'),
(3, @apt3, DATEADD(HOUR, -4, GETDATE()), 'requested');

-- Create 2 test requests already approved (for payment history)
INSERT INTO TestRequests (doctor_id, appointment_id, request_date, approved_by_id, approved_at, status) VALUES
(1, @apt4, DATEADD(HOUR, -3, GETDATE()), 7, DATEADD(HOUR, -2, GETDATE()), 'in_progress'),
(2, @apt5, DATEADD(HOUR, -2, GETDATE()), 7, DATEADD(HOUR, -1, GETDATE()), 'completed');

PRINT 'Created 5 test requests (3 pending, 2 approved)' ;

-- ===========================================================
-- STEP 3: CREATE TEST REQUEST DETAILS
-- ===========================================================

-- Get the test request IDs
DECLARE @req1 INT = (SELECT request_id FROM TestRequests WHERE appointment_id = @apt1);
DECLARE @req2 INT = (SELECT request_id FROM TestRequests WHERE appointment_id = @apt2);
DECLARE @req3 INT = (SELECT request_id FROM TestRequests WHERE appointment_id = @apt3);
DECLARE @req4 INT = (SELECT request_id FROM TestRequests WHERE appointment_id = @apt4);
DECLARE @req5 INT = (SELECT request_id FROM TestRequests WHERE appointment_id = @apt5);

-- Test request details for pending requests
INSERT INTO TestRequestDetails (request_id, service_id, notes) VALUES
-- Request 1: Patient 1 - CD4 + Screening (670,000 VND)
(@req1, 3, N'Xét nghiệm CD4 và Viral Load - Bệnh nhân mới'),
(@req1, 4, N'Xét nghiệm sàng lọc HIV - Bổ sung'),

-- Request 2: Patient 2 - CD4 + Confirmation (630,000 VND) 
(@req2, 3, N'Đo CD4 và Viral Load định kỳ'),
(@req2, 5, N'Xét nghiệm khẳng định HIV'),

-- Request 3: Patient 3 - Screening + Confirmation (200,000 VND)
(@req3, 4, N'Sàng lọc HIV - Trường hợp nghi ngờ'),
(@req3, 5, N'Khẳng định HIV nếu cần'),

-- Request 4: Patient 4 - Already approved (670,000 VND)
(@req4, 3, N'Xét nghiệm CD4 và Viral Load - Cần duyệt urgently'),
(@req4, 4, N'Xét nghiệm sàng lọc HIV - Bổ sung'),

-- Request 5: Patient 5 - Already approved (200,000 VND)
(@req5, 4, N'Sàng lọc HIV - Trường hợp nghi ngờ'),
(@req5, 5, N'Khẳng định HIV nếu cần');

PRINT 'Created test request details';

-- ===========================================================
-- STEP 4: CREATE INVOICES
-- ===========================================================

-- Pending invoices (for Registration Staff to process)
INSERT INTO Invoices (patient_id, request_id, amount, service_type, status, created_at) VALUES
(1, @req1, 670000, 'test', 'pending', GETDATE()),
(2, @req2, 630000, 'test', 'pending', GETDATE()),
(3, @req3, 200000, 'test', 'pending', GETDATE());

-- Paid invoices (for payment history)
INSERT INTO Invoices (patient_id, request_id, amount, service_type, status, issued_at, created_at) VALUES
(4, @req4, 670000, 'test', 'paid', DATEADD(HOUR, -2, GETDATE()), DATEADD(HOUR, -3, GETDATE())),
(5, @req5, 200000, 'test', 'paid', DATEADD(HOUR, -1, GETDATE()), DATEADD(HOUR, -2, GETDATE()));

PRINT 'Created invoices (3 pending, 2 paid)';

-- ===========================================================
-- STEP 5: CREATE QUEUE NUMBERS (for approved requests)
-- ===========================================================

INSERT INTO QueueNumbers (request_id, queue_type, current_number, queue_date, max_number) VALUES
(@req4, 'test', 1, @today, 1000),
(@req5, 'test', 2, @today, 1000);

PRINT 'Created queue numbers for approved requests';

-- ===========================================================
-- VERIFICATION AND SUMMARY
-- ===========================================================

PRINT '==========================================';
PRINT 'REGISTRATION STAFF TEST DATA CREATED!';
PRINT '==========================================';

-- Show what was created
SELECT 
    'Total Appointments Today' as Item,
    COUNT(*) as Count
FROM Appointments 
WHERE CAST(bookingDate AS DATE) = @today

UNION ALL

SELECT 
    'Test Requests Pending Approval',
    COUNT(*)
FROM TestRequests tr
JOIN Appointments a ON tr.appointment_id = a.appointment_id
WHERE tr.status = 'requested' 
AND CAST(a.bookingDate AS DATE) = @today

UNION ALL

SELECT 
    'Test Requests Already Approved',
    COUNT(*)
FROM TestRequests tr
JOIN Appointments a ON tr.appointment_id = a.appointment_id
WHERE tr.status IN ('in_progress', 'completed')
AND CAST(a.bookingDate AS DATE) = @today

UNION ALL

SELECT 
    'Pending Invoices (Need Payment)',
    COUNT(*)
FROM Invoices 
WHERE status = 'pending' AND service_type = 'test'

UNION ALL

SELECT 
    'Paid Invoices (Payment History)',
    COUNT(*)
FROM Invoices 
WHERE status = 'paid' AND service_type = 'test' 
AND CAST(issued_at AS DATE) = @today;

-- Show total amounts
SELECT 
    'Total Pending Amount' as AmountType,
    FORMAT(SUM(amount), 'N0') + ' VND' as Amount
FROM Invoices 
WHERE status = 'pending' AND service_type = 'test'

UNION ALL

SELECT 
    'Total Paid Amount Today',
    FORMAT(SUM(amount), 'N0') + ' VND'
FROM Invoices 
WHERE status = 'paid' AND service_type = 'test' 
AND CAST(issued_at AS DATE) = @today;

PRINT '==========================================';
PRINT 'EXPECTED STATISTICS:';
PRINT '- Pending Requests: 3';
PRINT '- Today Revenue: 870,000 VND (from paid invoices)';
PRINT '- Processed Today: 2';
PRINT '- Total Pending: 1,500,000 VND';
PRINT '==========================================';
PRINT 'Registration Staff can now:';
PRINT '1. See 3 test requests needing approval';
PRINT '2. Process payments for pending invoices';
PRINT '3. View payment history';
PRINT '4. See accurate dashboard statistics';
PRINT '==========================================';
