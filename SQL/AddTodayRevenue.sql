-- Thêm dữ liệu TestRequests với status = 'completed' để có doanh thu hôm nay
-- Run this in SQL Server Management Studio or your SQL client

-- Insert additional completed test requests for today
INSERT INTO TestRequests (doctor_id, appointment_id,  request_date, approved_by_id, approved_at, status) VALUES
(1, 1,  '2025-06-25 09:00:00', 1, '2025-06-25 09:30:00', 'completed'),
(2, 2,  '2025-06-25 10:00:00', 1, '2025-06-25 10:30:00', 'completed'),
(3, 3,  '2025-06-25 11:00:00', 1, '2025-06-25 11:30:00', 'completed');


