# 🩺 HIV Treatment System - Registration Staff Module

## ✅ Tích hợp hoàn thành

Chức năng Registration Staff đã được hoàn thiện để quản lý và xử lý thanh toán các đơn xét nghiệm (TestRequests) tích hợp với backend thật. Hệ thống hỗ trợ việc nhóm nhiều dịch vụ theo appointment và hiển thị đúng trên UI.

### 🛠️ Đã triển khai:

#### Backend APIs

- ✅ `GET /api/v1/test-requests/pending` - Lấy đơn xét nghiệm chờ xử lý (nhóm theo appointment)
- ✅ `PATCH /api/v1/test-requests/:appointment_id/approve` - Thu tiền và duyệt tất cả TestRequests thuộc appointment
- ✅ `GET /api/v1/test-requests/statistics` - Thống kê doanh thu theo trạng thái
- ✅ `GET /api/v1/test-requests/payment-history` - Lịch sử thanh toán nhóm theo appointment

#### Frontend Features

- ✅ Dashboard thống kê realtime với SQL Server data
- ✅ Danh sách đơn xét nghiệm chờ xử lý (hỗ trợ nhiều services/appointment)
- ✅ Modal thanh toán hiển thị đầy đủ services và tổng tiền
- ✅ Lịch sử thanh toán với services array
- ✅ Responsive UI với loading/error states
- ✅ Real-time data update sau khi thanh toán

## Khởi động hệ thống

### 1. Khởi động Backend (Server)

```bash
cd server
npm start
```

Server sẽ chạy trên: http://localhost:5000

### 2. Khởi động Frontend (Client)

```bash
cd client
npm run dev
```

Client sẽ chạy trên: http://localhost:3002 (hoặc port khác nếu bị chiếm)

## Test APIs trực tiếp

### 1. Lấy đơn chờ xử lý

```bash
curl http://localhost:5000/api/v1/test-requests/pending
```

### 2. Duyệt đơn xét nghiệm (appointment_id = 66)

```bash
curl -X PATCH http://localhost:5000/api/v1/test-requests/66/approve \
  -H "Content-Type: application/json"
```

### 3. Lấy thống kê

```bash
curl http://localhost:5000/api/v1/test-requests/statistics
```

### 4. Lấy lịch sử thanh toán

```bash
curl http://localhost:5000/api/v1/test-requests/payment-history
```

    - Giá tiền
    - Thời gian

#### B. Thu tiền và duyệt đơn

- Click nút "Thu tiền + Duyệt"
- Chọn phương thức thanh toán (Tiền mặt/QR Code)
- Xác nhận thanh toán
- In phiếu xét nghiệm

#### C. Xem lịch sử thanh toán

- Tab "Lịch sử thanh toán" hiển thị:
  - Tìm kiếm theo tên bệnh nhân, bác sĩ
  - Danh sách đơn đã thanh toán
  - Tổng doanh thu
  - Thông tin chi tiết từng đơn

## API Endpoints đã tích hợp

```
GET    /api/v1/test-requests/pending          - Lấy đơn chờ xử lý
PATCH  /api/v1/test-requests/:id/approve      - Duyệt và thu tiền
GET    /api/v1/test-requests/statistics       - Thống kê
GET    /api/v1/test-requests/payment-history  - Lịch sử thanh toán
```

## Files đã được tạo/chỉnh sửa

### Backend

- `server/src/controllers/registrationController.js` - Controller xử lý logic
- `server/src/services/registrationService.js` - Service truy vấn database
- `server/src/routes/registration.js` - Định nghĩa routes
- `server/src/routes/index.js` - Mount registration routes

### Frontend

- `client/src/pages/Staff/RegistrationStaff.jsx` - UI chính (đã refactor)
- `client/src/services/api.js` - API calls (đã thêm functions)
- `client/src/components/common/PaymentModal.jsx` - Modal thanh toán (đã sửa)

## Database Requirements

Cần đảm bảo các bảng sau tồn tại:

- `TestRequests` - Đơn xét nghiệm
- `Doctors` - Bác sĩ
- `Patients` - Bệnh nhân
- `Services` - Dịch vụ
- `Appointments` - Lịch hẹn

## Lưu ý

- Cần có dữ liệu mẫu trong database để test
- Đảm bảo authentication middleware hoạt động
- Kiểm tra connection database trong file `.env`

## Troubleshooting

1. **Lỗi connection**: Kiểm tra database connection string
2. **401 Unauthorized**: Đảm bảo đã đăng nhập và có token
3. **Empty data**: Tạo dữ liệu mẫu trong database
4. **CORS error**: Kiểm tra CORS configuration trong server
