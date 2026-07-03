# HIV Treatment and Medical Services System

Hệ thống quản lý điều trị HIV và dịch vụ y tế, hỗ trợ quy trình từ đặt lịch, khám bệnh, xét nghiệm, thanh toán, quản lý phác đồ ARV đến vận hành nội bộ cho nhiều vai trò trong phòng khám.

## Mục tiêu dự án

Dự án được xây dựng để số hóa các nghiệp vụ chính của một cơ sở điều trị HIV:

- Quản lý bệnh nhân và lịch hẹn
- Hỗ trợ bác sĩ khám, chỉ định xét nghiệm và kê đơn
- Quản lý quy trình xét nghiệm và trả kết quả
- Hỗ trợ nhân viên tiếp nhận xử lý yêu cầu và thanh toán
- Hỗ trợ quản lý vận hành dịch vụ, ca làm việc, người dùng, nội dung blog và doanh thu

## Tính năng chính

### 1. Khu vực công khai
- Xem trang chủ, giới thiệu, danh sách bác sĩ
- Xem chi tiết bác sĩ và dịch vụ
- Xem tin tức / blog sức khỏe
- Đặt lịch hẹn khám, tư vấn hoặc xét nghiệm

### 2. Bệnh nhân
- Đăng ký và đăng nhập
- Xem hồ sơ cá nhân
- Xem lịch sử đặt lịch
- Theo dõi kết quả thanh toán

### 3. Bác sĩ
- Xem dashboard khám bệnh
- Xem hàng đợi bệnh nhân
- Khám và ghi nhận dấu hiệu lâm sàng
- Chỉ định xét nghiệm
- Kê đơn thuốc
- Quản lý phác đồ ARV liên quan đến điều trị

### 4. Nhân viên xét nghiệm
- Quản lý hàng đợi xét nghiệm
- Cập nhật trạng thái xét nghiệm
- Tạo phiếu xét nghiệm và kết quả xét nghiệm
- Theo dõi thống kê và ca làm việc

### 5. Nhân viên tiếp nhận (chức năng này dành cho thanh toán trực tiếp)
- Duyệt yêu cầu xét nghiệm chờ xử lý (khi doctor chỉ định)
- Quản lý thanh toán cho yêu cầu xét nghiệm
- Theo dõi lịch sử thanh toán
- Xem thống kê liên quan

### 6. Quản lý
- Quản lý người dùng
- Quản lý dịch vụ
- Quản lý blog / tin tức
- Quản lý phác đồ ARV
- Quản lý ca làm việc
- Theo dõi doanh thu

### 7. Tự động hóa hệ thống
- Gửi email nhắc lịch hẹn hằng ngày
- Tự động hủy lịch chưa hoàn thành lúc `17:00`
- Tự động đánh dấu hóa đơn hết hạn theo lịch cron

## Công nghệ sử dụng

### Frontend
- React 19
- Vite 6
- React Router DOM 7
- Tailwind CSS
- Axios
- Zustand
- Radix UI
- TipTap Editor
- Chart.js / React Chart.js 2

### Backend
- Node.js
- Express 5
- MSSQL
- Sequelize
- JWT Authentication
- Nodemailer
- Node-cron
- Multer
- Cloudinary

### Thanh toán & tích hợp
- VNPay Sandbox
- Email SMTP

## Cấu trúc thư mục

```text
.
├─ client/                     # Frontend React + Vite
├─ server/                     # Backend Express + SQL Server
├─ SQL/                        # Script tạo DB, dữ liệu mẫu, index
├─ package.json                # Script điều phối toàn bộ monorepo
└─ README.md
```

## Kiến trúc tổng quan

- `client/`: giao diện cho khách, bệnh nhân, bác sĩ, nhân viên xét nghiệm, nhân viên tiếp nhận và quản lý
- `server/`: REST API, xác thực, nghiệp vụ khám bệnh, xét nghiệm, thanh toán, email, cron jobs
- `SQL/`: script khởi tạo cơ sở dữ liệu và dữ liệu mẫu

## Vai trò người dùng

Theo schema hiện tại, hệ thống hỗ trợ các role:

- `Patient`
- `Lab-Staff`
- `Registration-staff`
- `Manager`
- `Doctor`

## Cơ sở dữ liệu

Hệ thống đang dùng **SQL Server**.

![alt text](/img/image.png)

## Yêu cầu môi trường

Trước khi chạy, cần cài:

- Node.js 18+
- npm 9+
- SQL Server

## Cài đặt dự án

### 1. Cài dependencies

Tại thư mục gốc, chạy:

```bash
npm run install-all
```

Nếu muốn cài thủ công:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

## Cấu hình biến môi trường

### 1. Backend

Tạo file `server/.env` từ `server/.env.example`.

Khuyến nghị dùng cấu hình local như sau:

```env
PORT=4000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=1433
DB_NAME=HIV_HEALTH_CARE
DB_USER=your_sql_user
DB_PASSWORD=your_sql_password
DB_DIALECT=mssql
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:5173

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

VNPAY_TMN_CODE=your_vnpay_tmn_code_here
VNPAY_HASH_SECRET=your_vnpay_hash_secret_here
```

### 2. Frontend

Tạo file `client/.env` từ `client/.env.example`.

Khuyến nghị dùng:

```env
VITE_API_URL=http://localhost:4000
VITE_API_PREFIX=/api/v1
VITE_API_TIMEOUT=10000

VITE_APP_NAME=HIV-Treatment-and-Medical-Services-System
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_API=false
```

## Khởi tạo cơ sở dữ liệu

### Bước 1: Tạo database

### Bước 2: Nạp dữ liệu mẫu

### Bước 3: Tối ưu index

## Chạy dự án

### Chạy cả frontend và backend

Tại thư mục gốc:

```bash
npm run dev
```

### Hoặc chạy riêng từng phần

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

## Địa chỉ truy cập mặc định

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- API base: `http://localhost:4000/api/v1`

## API modules chính

Hệ thống hiện có các nhóm route chính:

- `/api/v1/public`
- `/api/v1/auth`
- `/api/v1/payment`
- `/api/v1/doctors`
- `/api/v1/patients`
- `/api/v1/appointments`
- `/api/v1/lab`
- `/api/v1/registrations`
- `/api/v1/slots`
- `/api/v1/arv-regimens`
- `/api/v1/clinical`
- `/api/v1/prescriptions`
- `/api/v1/test-request`
- `/api/v1/managers`
- `/api/v1/blogs`

## Một số script hữu ích

### Thư mục gốc
- `npm run dev`: chạy cả frontend và backend
- `npm run build`: build frontend
- `npm run preview`: preview frontend build
- `npm run install-all`: cài toàn bộ dependencies

### Frontend
- `npm run dev`
- `npm run build`
- `npm run lint`

### Backend
- `npm run dev`
- `npm run start`

## Lưu ý khi chạy local

### 1. Đồng bộ cổng frontend / backend
Trong code hiện tại có một số giá trị mẫu chưa đồng bộ hoàn toàn giữa các file env mẫu và code. Khi chạy local, nên ưu tiên:

- Backend: `4000`
- Frontend: `5173`
- API URL frontend: `http://localhost:4000`
- API prefix: `/api/v1`

### 2. Cấu hình VNPay
File cấu hình `server/src/config/vnpay.js` đang dùng URL trả về:

```text
http://localhost:3000/payment-result
```

Nếu frontend của bạn chạy ở `5173`, cần cập nhật lại URL này cho phù hợp.
Trước khi deploy hãy xóa phần tương tác với DB ở handleReturn(Cho phép chỉnh sữa invoice id là giải pháp thay thế khi chạy local)

### 3. Email reminder
Tính năng nhắc lịch qua email yêu cầu cấu hình SMTP hợp lệ trong `server/.env`.

## Tình trạng kiểm thử

Hiện tại dự án chưa có bộ test tự động hoàn chỉnh. Nên kiểm thử thủ công các luồng chính sau sau khi setup:

- Đăng ký / đăng nhập
- Đặt lịch hẹn
- Thanh toán
- Dashboard bác sĩ
- Quy trình xét nghiệm
- Dashboard quản lý