-- Thêm dữ liệu TestRequests với status = 'completed' để có doanh thu hôm nay
-- Run this in SQL Server Management Studio or your SQL client

-- Insert additional completed test requests for today
INSERT INTO TestRequests (doctor_id, appointment_id, service_id, request_date, approved_by_id, approved_at, status) VALUES
(1, 1, 3, '2025-06-25 09:00:00', 1, '2025-06-25 09:30:00', 'completed'),
(2, 2, 5, '2025-06-25 10:00:00', 1, '2025-06-25 10:30:00', 'completed'),
(3, 3, 4, '2025-06-25 11:00:00', 1, '2025-06-25 11:30:00', 'completed');

-- Verify the data
SELECT 
    tr.request_id,
    tr.status,
    tr.approved_at,
    s.name as service_name,
    s.price,
    p.full_name as patient_name,
    d.full_name as doctor_name
FROM TestRequests tr
JOIN Services s ON tr.service_id = s.service_id
JOIN Appointments a ON tr.appointment_id = a.appointment_id
JOIN Patients p ON a.patient_id = p.patient_id
JOIN Doctors d ON tr.doctor_id = d.doctor_id
WHERE tr.status = 'completed'
AND CAST(tr.approved_at AS DATE) = CAST(GETDATE() AS DATE)
ORDER BY tr.approved_at DESC;
