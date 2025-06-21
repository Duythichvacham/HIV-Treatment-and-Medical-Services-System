import { useEffect, useState } from "react";
import axios from "axios";
import CurrentExam from "./CurrentExam";
import ExamHistory from "./ExamHistory";

const PatientExam = ({ patientId, appointmentId, onBack, onFinishExam, mode = "edit" }) => {
  const [tab, setTab] = useState(mode === "view" ? "history" : "current");
  const [info, setInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('PatientExam received appointmentId:', appointmentId);

  const handleFinishExam = (examData) => {
    console.log('PatientExam handleFinishExam called with:', examData);
    if (onFinishExam) {
      onFinishExam(examData);
    } else {
      console.warn('onFinishExam prop not provided');
      alert('Hoàn thành khám bệnh thành công!');
      onBack?.();
    }
  };

  const handleSaveTemp = (examData) => {
    console.log('Saving temporary exam data:', examData);
    alert('Đã lưu tạm thành công!');
  };useEffect(() => {
    console.log('PatientExam useEffect - tab:', tab, 'patientId:', patientId);
    if (tab === "current") {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/v1/doctor/current-exam/${patientId}`)        .then((res) => {
          console.log('Current exam API response:', res.data);
          setInfo(res.data.data?.[0] || null);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching current exam:', error);
          setLoading(false);
        });
    } else {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/v1/doctor/exam-history/${patientId}`)
        .then((res) => {
          console.log('Exam history API response:', res.data);
          setHistory(res.data.data || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching exam history:', error);
          setLoading(false);
        });
    }
  }, [tab, patientId]);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center mb-4">
        {onBack && (
          <button
            className="mr-4 px-4 py-2 rounded bg-gray-100"
            onClick={onBack}
          >
            ← Quay lại
          </button>
        )}
        <h2 className="text-2xl font-bold">
          {mode === "view" ? "Hồ sơ bệnh nhân" : "Phiếu khám bệnh"}
        </h2>
      </div>
      <div className="flex gap-2 mb-6">
        <button
          className={`py-2 px-4 rounded-lg font-semibold ${
            tab === "current"
              ? "bg-white text-blue-700 shadow"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setTab("current")}
        >
          🩺 Khám hiện tại
        </button>
        <button
          className={`py-2 px-4 rounded-lg font-semibold ${
            tab === "history"
              ? "bg-white text-blue-700 shadow"
              : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setTab("history")}
        >
          ⏳ Lịch sử khám
        </button>
      </div>      {tab === "current" ? (
        <CurrentExam 
          info={info} 
          onFinish={handleFinishExam} 
          onSaveTemp={handleSaveTemp} 
          mode={mode}
        />
      ) : (
        <ExamHistory history={history} />
      )}
    </div>
  );
};

export default PatientExam;
