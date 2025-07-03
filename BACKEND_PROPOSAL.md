# PROPOSAL: Cập nhật Backend để hỗ trợ WorkingShifts

## Vấn đề hiện tại:

1. API `/api/public/doctors/` trả về tất cả doctors (không filter theo ngày có shift)
2. API `/api/public/slots/` trả về tất cả slots cố định (không filter theo ngày + doctor)
3. Không tích hợp với WorkingShifts table

## Đề xuất cập nhật:

### 1. Cập nhật Doctor API

**Endpoint:** `GET /api/public/doctors?date=YYYY-MM-DD`

**Logic:** Chỉ trả về doctors có WorkingShifts trong ngày được chọn

```sql
SELECT DISTINCT
  d.doctor_id,
  d.full_name,
  d.email,
  d.phone,
  d.degrees,
  d.experience_years,
  a.username
FROM Doctors d
INNER JOIN Accounts a ON d.account_id = a.account_id
INNER JOIN WorkingShifts ws ON d.doctor_id = ws.doctor_id
WHERE a.status = 'active'
  AND ws.shift_date = @date
  AND ws.status = 'approved'
ORDER BY d.experience_years DESC;
```

### 2. Cập nhật Slots API

**Endpoint:** `GET /api/public/slots?date=YYYY-MM-DD&doctor_id=ID`

**Logic:** Trả về slots available cho doctor + ngày cụ thể

```sql
SELECT
  s.slot_id,
  s.start_time,
  s.end_time,
  ws.max_patients_per_slot,
  ISNULL(appointment_count.total, 0) as current_bookings,
  (ws.max_patients_per_slot - ISNULL(appointment_count.total, 0)) as available_slots
FROM Slots s
CROSS JOIN WorkingShifts ws
LEFT JOIN (
  SELECT
    slot_id,
    COUNT(*) as total
  FROM Appointments
  WHERE appointment_date = @date
    AND doctor_id = @doctor_id
    AND status NOT IN ('cancelled')
  GROUP BY slot_id
) appointment_count ON s.slot_id = appointment_count.slot_id
WHERE ws.doctor_id = @doctor_id
  AND ws.shift_date = @date
  AND ws.status = 'approved'
  AND (ws.max_patients_per_slot - ISNULL(appointment_count.total, 0)) > 0
ORDER BY s.start_time;
```

### 3. Cập nhật Controllers

**doctorController.js:**

```javascript
const getDoctors = async (req, res) => {
  try {
    const { date } = req.query;
    const doctors = await doctorService.getDoctorsByDate(date);
    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

**slotController.js:**

```javascript
const getSlots = async (req, res) => {
  try {
    const { date, doctor_id } = req.query;
    const slots = await slotService.getAvailableSlots(date, doctor_id);
    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
```

## Tạm thời - Quick Fix:

1. ✅ Tạo file `AddWorkingShifts.sql` để thêm data test
2. ✅ Cập nhật default date trong client
3. ✅ Client sẽ load được doctors và slots cơ bản

## Lâu dài - Proper Solution:

Implement backend changes như đề xuất trên để có logic nghiệp vụ đúng.
