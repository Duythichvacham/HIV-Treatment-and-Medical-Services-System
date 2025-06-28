-- Simple INSERT script with specific IDs for today (2025-06-28)
-- Make sure you have existing data: Patients (1,2,3), Doctors (1), Services (1,2,3,4,5), Slots (1,2,3,4), Rooms (1,2)

-- Insert today's appointments
INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, room_id, bookingDate, created_at) VALUES 
(1, 1, 1, 1, 'completed', 1, '2025-06-28', DATEADD(HOUR, -2, GETDATE())),
(2, 1, 2, 2, 'completed', 1, '2025-06-28', DATEADD(HOUR, -1, GETDATE())),
(3, 1, 3, 3, 'completed', 2, '2025-06-28', DATEADD(MINUTE, -30, GETDATE()));

-- Get the last 3 appointment IDs (assuming they are sequential)
DECLARE @app1 INT = (SELECT MAX(appointment_id) - 2 FROM Appointments);
DECLARE @app2 INT = (SELECT MAX(appointment_id) - 1 FROM Appointments);
DECLARE @app3 INT = (SELECT MAX(appointment_id) FROM Appointments);

-- Insert TestRequests for today
INSERT INTO TestRequests (doctor_id, appointment_id, request_date, status) VALUES 
(1, @app1, DATEADD(MINUTE, -90, GETDATE()), 'requested'),
(1, @app2, DATEADD(MINUTE, -45, GETDATE()), 'requested'),
(1, @app3, DATEADD(MINUTE, -15, GETDATE()), 'requested');

-- Get the last 3 request IDs
DECLARE @req1 INT = (SELECT MAX(request_id) - 2 FROM TestRequests);
DECLARE @req2 INT = (SELECT MAX(request_id) - 1 FROM TestRequests);
DECLARE @req3 INT = (SELECT MAX(request_id) FROM TestRequests);

-- Insert TestRequestDetails
INSERT INTO TestRequestDetails (request_id, service_id, notes) VALUES 
(@req1, 1, N'Kiểm tra HIV'),
(@req1, 2, N'Kiểm tra CD4'),
(@req2, 3, N'Kiểm tra Viral Load'),
(@req3, 1, N'Xác nhận HIV'),
(@req3, 4, N'Kiểm tra gan');

PRINT 'Sample data added for today (2025-06-28)';
PRINT '- 3 Appointments completed';
PRINT '- 3 TestRequests with status = requested';
PRINT '- 5 TestRequestDetails (services)';
