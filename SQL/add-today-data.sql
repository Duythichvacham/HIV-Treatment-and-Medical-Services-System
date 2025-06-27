-- Thêm dữ liệu test cho ngày hiện tại (2025-06-25)
USE HIV_HEALTH_CARE;

-- Thêm appointment cho ngày hiện tại
INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, room_id, bookingDate, created_at)
VALUES 
(1, 1, 1, 3, 'requested', 1, '2025-06-25', GETDATE()),
(2, 2, 2, 4, 'requested', 1, '2025-06-25', GETDATE()),
(3, 3, 3, 5, 'requested', 1, '2025-06-25', GETDATE());

-- Lấy appointment_id của các appointment vừa tạo (giả sử là ID cuối)
DECLARE @appointment1 INT, @appointment2 INT, @appointment3 INT;
SELECT @appointment1 = MAX(appointment_id) - 2 FROM Appointments;
SELECT @appointment2 = MAX(appointment_id) - 1 FROM Appointments;
SELECT @appointment3 = MAX(appointment_id) FROM Appointments;

-- Thêm TestRequests cho ngày hiện tại
INSERT INTO TestRequests (doctor_id, appointment_id, request_date, status)
VALUES 
-- Appointment 1: 2 services
(1, @appointment1, GETDATE(), 'requested'),
(1, @appointment1,  GETDATE(), 'requested'),

-- Appointment 2: 1 service  
(2, @appointment2,  GETDATE(), 'requested'),

-- Appointment 3: 1 service
(3, @appointment3, GETDATE(), 'requested');

SELECT 'Đã thêm dữ liệu test cho ngày hiện tại' as Message;
