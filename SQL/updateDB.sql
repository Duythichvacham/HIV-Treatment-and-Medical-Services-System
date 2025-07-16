-- Xóa cột isEducation
ALTER TABLE BlogPosts
DROP COLUMN isEducation;

-- Thêm cột is_active mặc định 1
ALTER TABLE BlogPosts
ADD is_active BIT NOT NULL DEFAULT 1;

-- Thay đổi kiểu dữ liệu content từ NVARCHAR(500) sang NVARCHAR(MAX)
ALTER TABLE BlogPosts
ALTER COLUMN content NVARCHAR(MAX);

ALTER TABLE Rooms
ADD is_active BIT NOT NULL DEFAULT 1;

ALTER TABLE ARVRegimens
ADD is_active BIT NOT NULL DEFAULT 1;

ALTER TABLE WorkingShifts
ADD is_active BIT NOT NULL DEFAULT 1;

ALTER TABLE Slots
ADD is_active BIT NOT NULL DEFAULT 1,
    create_at DATETIME NOT NULL DEFAULT GETDATE();

ALTER TABLE TestNotes
ADD create_at DATETIME NOT NULL DEFAULT GETDATE();
