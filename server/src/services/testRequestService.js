const { poolPromise } = require("../config/db");

const updateStatus = async (id, status) => {
  const pool = await poolPromise;

  try {
    console.log("[updateStatus] Input parameters:", { id, status });

    const request = pool.request();

    // Validate id
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new Error("Invalid id: must be a valid number");
    }

    // Validate status
    if (!status || typeof status !== "string") {
      throw new Error("Invalid status: must be a non-empty string");
    }

    console.log("[updateStatus] Parsed values:", { parsedId, status });

    const result = await request
      .input("request_id", parsedId)
      .input("status", status).query(`
        UPDATE TestRequests
        SET status = @status
        WHERE request_id = @request_id;
      `);

    if (result.rowsAffected[0] === 0) {
      throw new Error("Test request not found");
    }

    return { request_id: parsedId, status };
  } catch (error) {
    console.error("[updateStatus] Error:", error);
    throw new Error(error.message || "Server error");
  }
};

const getTestRequests = async (bookingDate) => {
  const pool = await poolPromise;
  const request = pool.request();

  let query = `
    SELECT tr.appointment_id, tr.request_id, p.patient_id, p.full_name,
      DATEDIFF(YEAR, p.dob, GETDATE()) AS age,
      p.gender, p.phone, p.email, p.address, s.service_type,
      tr.status,
      FORMAT(tr.approved_at, 'dd-MM-yyyy HH:mm') AS created_at,
      FORMAT(a.bookingDate, 'yyyy-MM-dd') AS bookingDate,
      s.name AS service_name,
      s.service_id,
      tt.test_type_id AS tt_id,
      tt.name AS tt_name,
      tt.unit AS tt_unit,
      tt.normal_range AS reference_range
    FROM TestRequests tr
    JOIN Appointments a ON a.appointment_id = tr.appointment_id
    JOIN Doctors d ON d.doctor_id = tr.doctor_id
    JOIN Patients p ON p.patient_id = a.patient_id
    JOIN TestRequestDetails td ON td.request_id = tr.request_id
    JOIN Services s ON s.service_id = td.service_id
    JOIN ServicesTestTypes st ON st.service_id = s.service_id
    JOIN TestTypes tt ON tt.test_type_id = st.test_type_id
    WHERE tr.approved_by_id IS NOT NULL
  `;

  if (bookingDate) {
    query += ` AND a.bookingDate = @bookingDate`;
    request.input("bookingDate", bookingDate);
  }

  const result = await request.query(query);
  const rows = result.recordset;

  const grouped = [];
  const keyMap = new Map();

  for (const row of rows) {
    const key = row.request_id;

    if (!keyMap.has(key)) {
      const {
        appointment_id,
        request_id,
        patient_id,
        full_name,
        age,
        gender,
        phone,
        email,
        address,
        service_type,
        status,
        created_at,
        bookingDate,
      } = row;

      const newEntry = {
        appointment_id,
        request_id,
        patient_id,
        full_name,
        age,
        gender,
        phone,
        email,
        address,
        service_type,
        status,
        created_at,
        bookingDate,
        service_id: [],
        service_name: [],
        testTypes: [],
      };

      keyMap.set(key, newEntry);
      grouped.push(newEntry);
    }

    const current = keyMap.get(key);

    // Thêm service_id nếu chưa có
    if (!current.service_id.includes(row.service_id)) {
      current.service_id.push(row.service_id);
    }

    // Thêm service_name nếu chưa có
    if (!current.service_name.includes(row.service_name)) {
      current.service_name.push(row.service_name);
    }

    // Luôn thêm testType
    current.testTypes.push({
      tt_id: row.tt_id,
      tt_name: row.tt_name,
      tt_unit: row.tt_unit,
      reference_range: row.reference_range,
    });
  }

  return grouped;
};

module.exports = {
  updateStatus,
  getTestRequests,
};
