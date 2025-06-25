const doctorService = require("../services/examsService");


// GET: Lấy thông tin cơ bản thẻ khám bệnh
const getExams = async (req, res) => {
    try {
      const { exam_id } = req.params;
      if (!exam_id) {
        return res.status(400).json({ message: 'ID không khả dụng!' });
      }
      const list = await doctorService.getExams(exam_id);
      if (list.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy bệnh nhân nào phù hợp.' });
      }
      res.json({ message: 'Tìm kiếm bệnh nhân thành công', data: list });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // PATCH: Cập nhật thẻ khám bệnh
const updateExam = async (req, res) => {
    try {
      const examID = req.params.examID;
      const {
        appointment_id,
        vitals,
        weight,
        height,
        bmi,
        clinical_signs,
        diagnosis_primary,
        diagnosis_secondary,
        exam_date,
        full_name,
        gender,
        dob
      } = req.body;
  
      const updatedData = await doctorService.updateExam({
        exam_id: examID,
        appointment_id,
        vitals,
        weight,
        height,
        bmi,
        clinical_signs,
        diagnosis_primary,
        diagnosis_secondary,
        exam_date,
        full_name,
        gender,
        dob
      });
  
      res.json({ message: 'Cập nhật thẻ khám thành công', data: updatedData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
  };
  module.exports = {
 
    updateExam,
    getExams
 
  };