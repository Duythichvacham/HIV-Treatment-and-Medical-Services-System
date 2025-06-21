import { CheckCircle, FileText } from "lucide-react";
import React, { useState } from "react";
// ...existing code...

const ExamForm2 = ({ patient, onSaveTemp, onFinish }) => {
  const [form, setForm] = useState({
    diagnosis: "",
    treatmentPlan: "",
    note: "",
    reExamDate: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-xl shadow p-8 max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Chẩn đoán và kế hoạch điều trị
      </h2>
      <div className="mb-4">
        <label className="font-semibold">Chẩn đoán *</label>
        <textarea
          className="w-full border rounded p-2 mt-2"
          name="diagnosis"
          value={form.diagnosis}
          onChange={handleChange}
          placeholder="Chẩn đoán chi tiết..."
        />
      </div>
      <div className="mb-4">
        <label className="font-semibold">Kế hoạch điều trị</label>
        <input
          className="w-full border rounded p-2 mt-2"
          name="treatmentPlan"
          value={form.treatmentPlan}
          onChange={handleChange}
          placeholder="Tiếp tục phác đồ hiện tại"
        />
      </div>
      <div className="mb-4">
        <label className="font-semibold">Hướng dẫn khác</label>
        <textarea
          className="w-full border rounded p-2 mt-2"
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="Hướng dẫn thêm về chế độ ăn uống, tập thể dục..."
        />
      </div>
      <div className="mb-4">
        <label className="font-semibold">Ngày hẹn tái khám</label>
        <input
          className="w-full border rounded p-2 mt-2"
          name="reExamDate"
          value={form.reExamDate}
          onChange={handleChange}
          placeholder="dd/mm/yyyy"
        />
      </div>
      <div className="flex gap-4 justify-end mt-8">
        <button
          className="bg-white border border-gray-300 px-6 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-gray-100"
          onClick={() => onSaveTemp({ ...patient, ...form })}
        >
          <FileText className="w-5 h-5" />
          Lưu tạm
        </button>
        <button
          className="bg-gray-900 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-gray-800"
          onClick={() => onFinish({ ...patient, ...form })}
        >
          <CheckCircle className="w-5 h-5" />
          Hoàn thành khám
        </button>
      </div>
    </div>
  );
};

export default ExamForm2;
