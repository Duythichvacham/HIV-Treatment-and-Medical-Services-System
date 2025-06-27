# Cập nhật Filter Ngày Hiện Tại - Registration Staff

## Thay đổi đã thực hiện

### Backend (Server)

#### 1. `registrationService.js` - Cập nhật các query để filter theo ngày hiện tại:

**getPendingTestRequests():**

- Thêm filter: `AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)`
- Chỉ lấy TestRequests có appointment trong ngày hiện tại
- Sắp xếp theo thời gian slot tăng dần

**getRegistrationStatistics():**

- Thống kê chỉ dữ liệu ngày hiện tại
- Trả về: `pending_requests`, `processed_today`, `today_revenue`
- Filter tất cả queries theo `bookingDate = today`

**getPaymentHistory():**

- Chỉ lấy lịch sử thanh toán ngày hiện tại
- Filter: `AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)`

### Frontend (Client)

#### 1. `RegistrationStaff.jsx` - Cập nhật UI để hiển thị ngày hiện tại:

**Import dateUtil:**

```jsx
import { getCurrentDate, formatDateVietnamese } from "../../utils/dateUtil";
```

**Thêm biến ngày:**

```jsx
const today = getCurrentDate();
const todayFormatted = formatDateVietnamese(today);
```

**Cập nhật tiêu đề:**

- Header: "Xử lý đơn xét nghiệm và thu tiền từ bệnh nhân - Ngày {todayFormatted}"
- Tab Process: "Danh sách đơn xét nghiệm chờ xử lý - Hôm nay ({todayFormatted})"
- Tab History: "Lịch sử thanh toán hôm nay ({todayFormatted})"

**Cập nhật empty states:**

- Hiển thị ngày hiện tại trong thông báo khi không có dữ liệu

**Sửa lỗi:**

- Thay đổi `request.total_amount` thành `request.total_price` (2 chỗ)

## Kết quả

### API Responses (ngày 2025-06-25):

**GET /api/v1/test-requests/pending:**

```json
{ "message": "Lấy danh sách đơn xét nghiệm chờ xử lý thành công", "data": [] }
```

**GET /api/v1/test-requests/statistics:**

```json
{
  "data": {
    "statusCounts": {},
    "totalRevenue": 0,
    "pending_requests": 0,
    "processed_today": 0,
    "today_revenue": 0
  }
}
```

**GET /api/v1/test-requests/payment-history:**

```json
{ "message": "Lấy lịch sử thanh toán thành công", "data": [] }
```

### UI Updates:

- ✅ Header hiển thị: "Ngày 25/6/2025"
- ✅ Tab titles có thông tin ngày hiện tại
- ✅ Empty states hiển thị ngày cụ thể
- ✅ Tất cả dữ liệu được filter theo ngày hiện tại

## Để test với dữ liệu:

1. **Chạy script tạo dữ liệu test:**

   ```sql
   -- Chạy file add-today-data.sql trong SQL Server
   -- Tạo appointments và TestRequests cho ngày 2025-06-25
   ```

2. **Hoặc thay đổi ngày hệ thống tạm thời:**

   - Đổi ngày máy về 2025-06-24 để test với dữ liệu có sẵn

3. **Hoặc tạo dữ liệu thủ công:**
   - Thêm appointments với bookingDate = '2025-06-25'
   - Thêm TestRequests tương ứng

## Lợi ích:

✅ **Performance tối ưu:** Chỉ query dữ liệu cần thiết của ngày hiện tại
✅ **UX rõ ràng:** User biết đang xem dữ liệu ngày nào  
✅ **Logic nghiệp vụ đúng:** Registration Staff thường chỉ làm việc với appointments trong ngày
✅ **Dữ liệu chính xác:** Không bị nhầm lẫn với các ngày khác

Hệ thống đã được cập nhật để hoạt động với dữ liệu ngày hiện tại như yêu cầu!
