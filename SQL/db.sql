﻿USE master
GO
DROP DATABASE HIV_HEATH_CARE
GO
CREATE DATABASE HIV_HEATH_CARE
GO
USE HIV_HEATH_CARE
-- Accounts
CREATE TABLE Accounts (
    account_id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Patient', 'Lab-Staff','Registration-staff','Manager','Doctor')),-- gộp admin với manager
    status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'inactive')),
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- Patients
CREATE TABLE Patients (
    patient_id INT PRIMARY KEY IDENTITY(1,1),
    account_id INT NOT NULL FOREIGN KEY REFERENCES Accounts(account_id),
    full_name NVARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender NVARCHAR(10) NULL CHECK (gender IN('male','female')) ,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    address NVARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- Doctors
CREATE TABLE Doctors (
    doctor_id INT PRIMARY KEY IDENTITY(1,1),
    account_id INT NOT NULL FOREIGN KEY REFERENCES Accounts(account_id),
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    image_url VARCHAR(255), -- lưu đường dẫn ảnh đại diện
    degrees NVARCHAR(500),
    experience_years INT NULL CHECK (experience_years >= 0),
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- ARVRegimens
CREATE TABLE ARVRegimens (
    arv_regimen_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) UNIQUE NOT NULL,-- tên phác đồ
    for_group NVARCHAR(50),-- ex: mẹ bầu, trẻ em
    components NVARCHAR(500),-- thành phần
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);
--Rooms
CREATE TABLE Rooms (
    room_id INT PRIMARY KEY IDENTITY(1,1),
    room_name NVARCHAR(50) NOT NULL,     -- ví dụ: "Phòng 201", "XN Máu"
    room_type NVARCHAR(30) NOT NULL,     -- ví dụ: "Khám", "Xét nghiệm" -- này có thể không cần nhưng giữ lại có thể mở rộng
-- có thể thêm description để ghi chú phòng
   created_at DATETIME NOT NULL DEFAULT GETDATE()
);
-- Slots - lưu cố định các slot làm việc trong ngày
CREATE TABLE Slots (
    slot_id INT PRIMARY KEY IDENTITY(1,1),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE (start_time, end_time)
);
-- TestTypes
CREATE TABLE TestTypes (
    test_type_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(50) UNIQUE NOT NULL,
    unit VARCHAR(50),  -- VD: 'cells/mm³', có thể NULL cho binary
    normal_range VARCHAR(100), -- VD: '500 - 1500'
    result_type VARCHAR(20) CHECK (result_type IN ('numeric', 'binary')),
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);
-- Services
CREATE TABLE Services (
    service_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL, 
    service_type NVARCHAR(30) NOT NULL CHECK (service_type IN ('test', 'examination', 'consultation')), -- cần mở rộng thì tách bảng vì nó 1-M
    description NVARCHAR(500),
    price DECIMAL(10,2),
    test_type_id INT NULL FOREIGN KEY REFERENCES TestTypes(test_type_id), -- service_type phải là test
    is_active BIT DEFAULT 1
);
-- Appointments
CREATE TABLE Appointments (
    appointment_id INT PRIMARY KEY IDENTITY(1,1),
    patient_id INT NOT NULL FOREIGN KEY REFERENCES Patients(patient_id),
    doctor_id INT NULL FOREIGN KEY REFERENCES Doctors(doctor_id),
-- phân thành 2 luồng là đặt khám và xn nên mặc định docid = null và chỉ có nếu khám
    slot_id INT NOT NULL FOREIGN KEY REFERENCES Slots(slot_id),
    service_id INT NULL FOREIGN KEY REFERENCES Services(service_id),
    status VARCHAR(20) CHECK (status IN ('requested', 'in_progress', 'completed', 'cancelled')),
    queue_number INT NOT NULL DEFAULT 1,
    room_id INT NOT NULL FOREIGN KEY REFERENCES Rooms(room_id),
    bookingDate DATE, -- ngày khám
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT uq_patient_time UNIQUE (patient_id, slot_id)
);

-- TestRequests
CREATE TABLE TestRequests (
    request_id INT PRIMARY KEY IDENTITY(1,1),
    doctor_id INT NOT NULL FOREIGN KEY REFERENCES Doctors(doctor_id), -- người làm đơn
    appointment_id INT NULL FOREIGN KEY REFERENCES Appointments(appointment_id), -- phát sinh từ đơn đặt lịch nào khi đang khám
    service_id INT NULL FOREIGN KEY REFERENCES Services(service_id), -- nếu là dịch vụ thì sẽ có service_type
    request_date DATETIME DEFAULT GETDATE(),
    approved_by_id INT NULL FOREIGN KEY REFERENCES Accounts(account_id), -- registration-staff
    approved_at DATETIME NULL,
    status VARCHAR(20) CHECK (status IN ('requested', 'in_progress', 'completed', 'cancelled')),
);


-- WorkingShifts
CREATE TABLE WorkingShifts (
    shift_id INT PRIMARY KEY IDENTITY(1,1),
    account_id INT NOT NULL FOREIGN KEY REFERENCES Accounts(account_id),-- check và phân trang ở front để chỉ manager vào được trang này
    doctor_id INT NOT NULL FOREIGN KEY REFERENCES Doctors(doctor_id),
    shift_date DATE NOT NULL,-- phân ca cho bs theo ngày (các slots được cố định cho đặt lịch vì vậy làm cả ngày là full slots)
    room_id INT NOT NULL FOREIGN KEY REFERENCES Rooms(room_id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'canceled')) DEFAULT 'approved',
    max_patients_per_slot INT NOT NULL DEFAULT 6 CHECK (max_patients_per_slot > 0),
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- TestNotes
CREATE TABLE TestNotes(
   test_note_id INT PRIMARY KEY IDENTITY(1,1),
   request_id INT NOT NULL FOREIGN KEY REFERENCES TestRequests(request_id),
   appointment_id INT NULL FOREIGN KEY REFERENCES Appointments(appointment_id), -- có thể phát sinh không thông qua testrequest
   created_by_id INT NOT NULL FOREIGN KEY REFERENCES Accounts(account_id), -- người xn và tạo phiếu này
   test_datetime DATETIME NOT NULL,
   );
-- TestResults
CREATE TABLE TestResults (
    result_id INT PRIMARY KEY IDENTITY(1,1),
    test_note_id INT NOT NULL FOREIGN KEY REFERENCES TestNotes(test_note_id),
    result_value VARCHAR(100) NULL,
    unit VARCHAR(20) NULL,
    reference_range VARCHAR(100) NULL, -- khoảng tham chiếu
    notes NVARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);


-- MedicalHistory
CREATE TABLE MedicalHistory (
    history_id INT PRIMARY KEY IDENTITY(1,1),
    patient_id INT NOT NULL FOREIGN KEY REFERENCES Patients(patient_id),
    hiv_discovered_at DATE,
    arv_status VARCHAR(50),
    arv_adherence VARCHAR(20) NULL CHECK (arv_adherence IN ('good', 'average', 'poor')),
    arv_side_effects NVARCHAR(500),
    medical_history NVARCHAR(500),
    allergies NVARCHAR(500)
);

-- ClinicalExams
CREATE TABLE ClinicalExams (
    exam_id INT PRIMARY KEY IDENTITY(1,1),
    appointment_id INT NOT NULL FOREIGN KEY REFERENCES Appointments(appointment_id),
    vitals NVARCHAR(255),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    bmi DECIMAL(5,2),
    clinical_signs NVARCHAR(500),
    diagnosis_primary NVARCHAR(255),
    diagnosis_secondary NVARCHAR(500)
);

-- Prescriptions
CREATE TABLE Prescriptions (
    prescription_id INT PRIMARY KEY IDENTITY(1,1),
    appointment_id INT NOT NULL FOREIGN KEY REFERENCES Appointments(appointment_id),
    arv_regimen_id INT NULL FOREIGN KEY REFERENCES ARVRegimens(arv_regimen_id),
    support_drugs NVARCHAR(500),
    counseling_notes NVARCHAR(500),
    follow_up_plan NVARCHAR(500),
    doctor_notes NVARCHAR(500)
);
-- Bảng chi tiết các loại thuốc kê trong đơn thuốc
CREATE TABLE PrescriptionDetails (
    detail_id INT PRIMARY KEY IDENTITY(1,1),
    prescription_id INT NOT NULL FOREIGN KEY REFERENCES Prescriptions(prescription_id),
    drug_name NVARCHAR(100) NOT NULL,             -- Tên thuốc
    dosage NVARCHAR(50),                          -- Liều lượng, ví dụ: '300mg'
    frequency NVARCHAR(100),                      -- Tần suất dùng: '2 lần/ngày'
    duration_days INT,                            -- Số ngày dùng thuốc
    usage_instructions NVARCHAR(255),             -- Cách dùng: 'Uống sau ăn', 'Tiêm tĩnh mạch', v.v.
    notes NVARCHAR(255)                           -- Ghi chú thêm nếu có
);

-- BlogPosts
CREATE TABLE BlogPosts (
    post_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(500),
    author_id INT NOT NULL FOREIGN KEY REFERENCES Accounts(account_id),
    is_educational BIT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    published BIT NOT NULL DEFAULT 0
);

-- Invoices
CREATE TABLE Invoices (
    invoice_id INT PRIMARY KEY IDENTITY(1,1),
    patient_id INT NOT NULL FOREIGN KEY REFERENCES Patients(patient_id),
    appointment_id INT NULL FOREIGN KEY REFERENCES Appointments(appointment_id),
    request_id INT NULL FOREIGN KEY REFERENCES TestRequests(request_id),
    amount DECIMAL(10,2) NOT NULL,
    service_type NVARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
    issued_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    pdf_url VARCHAR(255) NULL -- lưu đường dẫn file pdf hóa đơn nếu có (có thể không cần vì có thể tạo từ app)
);
