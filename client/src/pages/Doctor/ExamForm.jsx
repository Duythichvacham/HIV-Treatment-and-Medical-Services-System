import React, { useState } from 'react';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

const ExamForm = ({ patient, onSaveTemp, onFinish }) => {
  const [form, setForm] = useState({
    diagnosis: "",
    treatmentPlan: "",
    note: "",
    reExamDate: "",
  });

  const [errors, setErrors] = useState({});

  const validateReExamDate = (dateString) => {
    if (!dateString) return true; // Ngày tái khám không bắt buộc

    const selectedDate = new Date(dateString);
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 7); // Ít nhất 1 tuần từ hôm nay

    // Reset time để so sánh chỉ ngày
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    minDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return "Ngày hẹn tái khám không được là ngày trong quá khứ";
    }
    
    if (selectedDate < minDate) {
      return "Ngày hẹn tái khám phải ít nhất 1 tuần kể từ hôm nay";
    }

    return true;
  };  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Validate ngày tái khám khi thay đổi
    if (name === 'reExamDate') {
      const validation = validateReExamDate(value);
      setErrors(prev => ({
        ...prev,
        reExamDate: validation === true ? null : validation
      }));
    }
  };const handleFinish = async () => {
    if (!form.diagnosis.trim()) {
      alert('Vui lòng nhập chẩn đoán trước khi hoàn thành khám!');
      return;
    }

    // Validate ngày tái khám nếu có nhập
    if (form.reExamDate) {
      const validation = validateReExamDate(form.reExamDate);
      if (validation !== true) {
        setErrors(prev => ({ ...prev, reExamDate: validation }));
        alert('Vui lòng kiểm tra lại ngày hẹn tái khám!');
        return;
      }
    }    try {
      // Kiểm tra appointment_id
      const appointmentId = patient?.appointment_id;
      if (!appointmentId) {
        throw new Error('Không tìm thấy appointment_id của bệnh nhân');
      }
      
      // Gọi API lưu dữ liệu khám bệnh
      const token = localStorage.getItem('token');
      const requestData = {
        appointment_id: appointmentId,
        diagnosis: form.diagnosis,
        treatment_plan: form.treatmentPlan,
        note: form.note,
        reExamDate: form.reExamDate,
        // Có thể thêm các trường khác nếu cần
        vitals: null,
        weight: null,
        height: null,
        clinical_signs: null
      };
      
      const response = await fetch('http://localhost:5000/api/v1/doctor/save-exam-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
        if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi lưu dữ liệu khám bệnh');
      }
      
      // Sau khi lưu thành công, gọi onFinish để cập nhật status
      const examData = {
        ...patient,
        ...form,
        completed_at: new Date().toISOString()
      };
      
      onFinish?.(examData);
        } catch (error) {
      console.error('Error saving exam data:', error);
      alert('Có lỗi xảy ra khi lưu dữ liệu khám bệnh: ' + error.message);
    }
  };
  const handleSaveTemp = async () => {
    // Validate ngày tái khám nếu có nhập (cả khi lưu tạm)
    if (form.reExamDate) {
      const validation = validateReExamDate(form.reExamDate);
      if (validation !== true) {
        setErrors(prev => ({ ...prev, reExamDate: validation }));
        alert('Vui lòng kiểm tra lại ngày hẹn tái khám!');
        return;
      }
    }    try {
      // Kiểm tra appointment_id
      const appointmentId = patient?.appointment_id;
      if (!appointmentId) {
        throw new Error('Không tìm thấy appointment_id của bệnh nhân');
      }
      
      // Gọi API lưu tạm dữ liệu khám bệnh
      const token = localStorage.getItem('token');
      const requestData = {
        appointment_id: appointmentId,
        diagnosis: form.diagnosis || 'Đang khám...',
        treatment_plan: form.treatmentPlan,
        note: form.note,
        reExamDate: form.reExamDate,
        vitals: null,
        weight: null,
        height: null,
        clinical_signs: null
      };
      
      const response = await fetch('http://localhost:5000/api/v1/doctor/save-exam-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
        if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi lưu tạm dữ liệu khám bệnh');
      }
      
      alert('Đã lưu tạm thành công!');
      
      // Gọi callback nếu có
      const examData = {
        ...patient,
        ...form,
        saved_at: new Date().toISOString()
      };
      
      onSaveTemp?.(examData);
        } catch (error) {
      console.error('Error saving temporary exam data:', error);
      alert('Có lỗi xảy ra khi lưu tạm dữ liệu: ' + error.message);
    }
  };  return (
    <div className="bg-white rounded-xl shadow p-8 max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Chẩn đoán và kế hoạch điều trị
      </h2><div className="mb-4">
        <label className="font-semibold">Chẩn đoán *</label>        <textarea
          className="w-full border rounded p-2 mt-2"
          name="diagnosis"
          value={form.diagnosis}
          onChange={handleChange}
          placeholder="Chẩn đoán chi tiết..."
        />
      </div>
      <div className="mb-4">
        <label className="font-semibold">Kế hoạch điều trị</label>        <input
          className="w-full border rounded p-2 mt-2"
          name="treatmentPlan"
          value={form.treatmentPlan}
          onChange={handleChange}
          placeholder="Tiếp tục phác đồ hiện tại"
        />
      </div>
      <div className="mb-4">
        <label className="font-semibold">Hướng dẫn khác</label>        <textarea
          className="w-full border rounded p-2 mt-2"
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="Hướng dẫn thêm về chế độ ăn uống, tập thể dục..."
        />
      </div>      <div className="mb-4">
        <label className="font-semibold">Ngày hẹn tái khám</label>        <input
          type="date"
          className={`w-full border rounded p-2 mt-2 ${errors.reExamDate ? 'border-red-500' : ''}`}
          name="reExamDate"
          value={form.reExamDate}
          onChange={handleChange}
          min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Ít nhất 1 tuần từ hôm nay
        />
        {errors.reExamDate && (
          <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
            <AlertCircle className="w-4 h-4" />
            {errors.reExamDate}
          </div>
        )}
        <div className="text-gray-500 text-sm mt-1">
          Ngày hẹn tái khám phải ít nhất 1 tuần kể từ hôm nay
        </div>
      </div>
      <div className="flex gap-4 justify-end mt-8">
        <button
          className="bg-white border border-gray-300 px-6 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-gray-100"
          onClick={handleSaveTemp}
        >
          <FileText className="w-5 h-5" />
          Lưu tạm
        </button>
        <button
          className="bg-gray-900 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-gray-800"
          onClick={handleFinish}
        >
          <CheckCircle className="w-5 h-5" />
          Hoàn thành khám
        </button>
      </div>
    </div>
  );
};

export default ExamForm;
