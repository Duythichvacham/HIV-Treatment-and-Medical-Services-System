const { poolPromise } = require('../config/db');
const sql = require('mssql');

exports.getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('patient_id', sql.Int, patientId)
      .query('SELECT patient_id, full_name, dob, gender, email, phone, address FROM Patients WHERE patient_id = @patient_id');
    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
    }
    res.json({ data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin bệnh nhân' });
  }
};

exports.updatePatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { full_name, dob, gender, email, phone, address } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('patient_id', sql.Int, patientId)
      .input('full_name', sql.NVarChar, full_name)
      .input('dob', sql.Date, dob)
      .input('gender', sql.NVarChar, gender)
      .input('email', sql.VarChar, email)
      .input('phone', sql.VarChar, phone)
      .input('address', sql.NVarChar, address)
      .query('UPDATE Patients SET full_name=@full_name, dob=@dob, gender=@gender, email=@email, phone=@phone, address=@address WHERE patient_id=@patient_id');
    res.json({ message: 'Cập nhật thông tin bệnh nhân thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin bệnh nhân' });
  }
};
