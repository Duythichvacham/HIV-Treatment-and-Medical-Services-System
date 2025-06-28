-- Simple sample data for today (2025-06-28)
-- Run this directly in MSSQL

-- Insert today's appointments
INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, room_id, bookingDate, created_at) VALUES 
(1, 1, 1, 1, 'completed', 1, '2025-06-28', DATEADD(HOUR, -2, GETDATE())),
(2, 1, 2, 2, 'completed', 1, '2025-06-28', DATEADD(HOUR, -1, GETDATE())),
(3, 1, 3, 3, 'completed', 2, '2025-06-28', DATEADD(MINUTE, -30, GETDATE()));

-- Insert TestRequests for today (status = 'requested' - waiting for registration staff)
INSERT INTO TestRequests (doctor_id, appointment_id, request_date, status) VALUES 
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 1 AND bookingDate = '2025-06-28' ORDER BY created_at DESC), DATEADD(MINUTE, -90, GETDATE()), 'requested'),
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 2 AND bookingDate = '2025-06-28' ORDER BY created_at DESC), DATEADD(MINUTE, -45, GETDATE()), 'requested'),
(1, (SELECT TOP 1 appointment_id FROM Appointments WHERE patient_id = 3 AND bookingDate = '2025-06-28' ORDER BY created_at DESC), DATEADD(MINUTE, -15, GETDATE()), 'requested');

-- Insert TestRequestDetails
INSERT INTO TestRequestDetails (request_id, service_id, notes) VALUES 
((SELECT TOP 1 r.request_id FROM TestRequests r JOIN Appointments a ON r.appointment_id = a.appointment_id WHERE a.patient_id = 1 AND a.bookingDate = '2025-06-28' ORDER BY r.request_date DESC), 1, N'Kiểm tra HIV'),
((SELECT TOP 1 r.request_id FROM TestRequests r JOIN Appointments a ON r.appointment_id = a.appointment_id WHERE a.patient_id = 1 AND a.bookingDate = '2025-06-28' ORDER BY r.request_date DESC), 2, N'Kiểm tra CD4'),
((SELECT TOP 1 r.request_id FROM TestRequests r JOIN Appointments a ON r.appointment_id = a.appointment_id WHERE a.patient_id = 2 AND a.bookingDate = '2025-06-28' ORDER BY r.request_date DESC), 3, N'Kiểm tra Viral Load'),
((SELECT TOP 1 r.request_id FROM TestRequests r JOIN Appointments a ON r.appointment_id = a.appointment_id WHERE a.patient_id = 3 AND a.bookingDate = '2025-06-28' ORDER BY r.request_date DESC), 1, N'Xác nhận HIV'),
((SELECT TOP 1 r.request_id FROM TestRequests r JOIN Appointments a ON r.appointment_id = a.appointment_id WHERE a.patient_id = 3 AND a.bookingDate = '2025-06-28' ORDER BY r.request_date DESC), 4, N'Kiểm tra gan');

PRINT 'Sample data added for today (2025-06-28)';
PRINT '- 3 TestRequests with status = requested';
PRINT '- 5 TestRequestDetails (services)';
