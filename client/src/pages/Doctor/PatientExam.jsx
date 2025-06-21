import { useEffect, useState } from "react";
import axios from "axios";
import CurrentExam from "./CurrentExam";
import ExamHistory from "./ExamHistory";

const PatientExam = ({ patientId, onBack }) => {
  const [tab, setTab] = useState("current");
  const [info, setInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === "current") {
      setLoading(true);
      axios
        .get(`/api/v1/doctor/patient/currrent-exam/${patientId}`)
        .then((res) => {
          setInfo(res.data.data?.[0] || null);
          setLoading(false);
        });
    } else {
      setLoading(true);
      axios
        .get(`/api/v1/doctor/patient/exam-history/${patientId}`)
        .then((res) => {
          setHistory(res.data.data || []);
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
        <h2 className="text-2xl font-bold">Phiếu khám bệnh</h2>
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
      </div>
      {tab === "current" ? (
        <CurrentExam info={info} />
      ) : (
        <ExamHistory history={history} />
      )}
    </div>
  );
};

export default PatientExam;
