import { useEffect, useState } from "react";
import axios from "axios";
import CurrentExam from "./CurrentExam";
import ExamHistory from "./ExamHistory";

const PatientExam = ({
  patientId,
  appointmentId,
  onBack,
  onFinishExam,
  mode = "edit",
}) => {
  const [tab, setTab] = useState(mode === "view" ? "history" : "current");
  const [info, setInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("PatientExam received appointmentId:", appointmentId);

  const handleFinishExam = (examData) => {
    console.log("PatientExam handleFinishExam called with:", examData);
    if (onFinishExam) {
      onFinishExam(examData);
    } else {
      console.warn("onFinishExam prop not provided");
      alert("Hoàn thành khám bệnh thành công!");
      onBack?.();
    }
  };
  const handleSaveTemp = (examData) => {
    console.log("Saving temporary exam data:", examData);

    // Show success message
    const result = window.confirm(
      "Đã lưu tạm thành công! Bạn có muốn tiếp tục khám không?"
    );

    // If user wants to continue, just stay on the form
    // If user doesn't want to continue, go back to the queue
    if (!result && onBack) {
      onBack();
    }
  }; // Fetch data cho cả current và history
  useEffect(() => {
    const fetchCurrentExamData = async () => {
      if (!patientId) return;

      setLoading(true);
      try {
        console.log(
          "Fetching current exam data for patient:",
          patientId,
          "appointmentId:",
          appointmentId
        );
        const response = await axios.get(
          `http://localhost:5000/api/v1/doctor/current-exam/${patientId}?appointmentId=${appointmentId}`
        );

        console.log("Current exam API response:", response.data);
        if (
          response.data.success &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          try {
            // Lưu kết quả vào state info
            const examInfo = response.data.data[0];

            // Kiểm tra xem có dữ liệu khám tạm không trước khi hiển thị
            if (examInfo.exam_data) {
              console.log("✅ Found temporary exam data:", examInfo.exam_data);

              // Nếu có dữ liệu khám tạm, kiểm tra xem các trường cần thiết có tồn tại không
              if (
                examInfo.exam_data.vitals !== null ||
                examInfo.exam_data.diagnosis_primary !== null ||
                examInfo.exam_data.clinical_signs !== null
              ) {
                console.log("✅ Temp exam data contains valid fields");
              } else {
                console.log("⚠️ Temp exam data exists but fields are empty");
              }
            } else {
              console.log(
                "⚠️ No temporary exam data found in the API response"
              );
            }

            setInfo(examInfo);
            console.log("Exam data loaded successfully:", examInfo);
          } catch (error) {
            console.error("Error processing exam data:", error);
            setInfo(response.data.data[0]);
          }
        } else {
          console.log("No data returned from API, using default values");
          // Use default info with patient_id and appointment_id
          setInfo({
            patient_id: patientId,
            appointment_id: appointmentId,
            ho_ten: "Bệnh nhân ẩn danh",
            ma_bn: `HIV${String(patientId).padStart(3, "0")}`,
            tuoi: 28,
            gender: "Female",
            gio_hen: "09:00",
            phac_do: "TDF/3TC/DTG",
            ngay_bat_dau: "2024-03-10",
            tuan_thu: "Khá (90-95%)",
            tac_dung_phu: "Không",
            viral_load: "150 copies/ml",
            cd4: "350 cells/μL",
            sang_loc: "HIV Ag/Ab: Dương tính",
            khang_dinh: "Western Blot: Dương tính",
            queue_number: 3,
          });
        }
      } catch (error) {
        console.error("Error fetching current exam:", error);
        // Set default info with patient_id and appointment_id
        setInfo({
          patient_id: patientId,
          appointment_id: appointmentId,
          ho_ten: "Bệnh nhân ẩn danh",
          ma_bn: `HIV${String(patientId).padStart(3, "0")}`,
          tuoi: 28,
          gender: "Female",
          gio_hen: "09:00",
          phac_do: "TDF/3TC/DTG",
          ngay_bat_dau: "2024-03-10",
          tuan_thu: "Khá (90-95%)",
          tac_dung_phu: "Không",
          viral_load: "150 copies/ml",
          cd4: "350 cells/μL",
          sang_loc: "HIV Ag/Ab: Dương tính",
          khang_dinh: "Western Blot: Dương tính",
          queue_number: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchExamHistory = async () => {
      if (!patientId) return;

      setLoading(true);
      try {
        console.log("Fetching exam history for patient:", patientId);
        const response = await axios.get(
          `http://localhost:5000/api/v1/doctor/exam-history/${patientId}`
        );

        console.log("Exam history API response:", response.data);

        if (response.data.success && response.data.data) {
          setHistory(response.data.data);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Error fetching exam history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch all data at once when component loads
    Promise.all([fetchCurrentExamData(), fetchExamHistory()]).then(() => {
      setLoading(false);
    });
  }, [patientId, appointmentId]); // Removed tab dependency

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="bg-blue-50 p-6 min-h-screen">
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center mb-2">
          {onBack && (
            <button
              className="mr-4 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={onBack}
            >
              ← Quay lại
            </button>
          )}
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">Phiếu khám bệnh</h2>
          </div>
          <div className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium text-sm">
            STT: {info?.queue_number || 3}
          </div>
        </div>{" "}
        <p className="text-gray-600 text-sm ml-12">
          {info?.ho_ten} -{" "}
          {info?.ma_bn ||
            (info?.patient_id
              ? `HIV${String(info?.patient_id).padStart(3, "0")}`
              : "HIV002")}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-800">
            Thông tin bệnh nhân
          </h3>
        </div>
        <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Họ tên:</div>{" "}
            <div className="font-medium">{info?.ho_ten}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Mã BN:</div>
            <div className="font-medium">
              {info?.ma_bn ||
                (info?.patient_id
                  ? `HIV${String(info?.patient_id).padStart(3, "0")}`
                  : "HIV002")}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Tuổi/Giới:</div>
            <div className="font-medium">
              {info?.tuoi || 28} tuổi -{" "}
              {info?.gender === "Male"
                ? "Nam"
                : info?.gender === "Female"
                ? "Nữ"
                : "Nữ"}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Giờ hẹn:</div>
            <div className="font-medium">{info?.gio_hen || "09:00"}</div>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 rounded-lg shadow mb-6">
        <div className="p-5 border-b border-blue-100">
          <h3 className="font-bold text-lg text-blue-800">
            Thông tin điều trị ARV hiện tại
          </h3>
        </div>
        <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <div className="text-blue-700 mb-1">Phác đồ:</div>
            <div className="font-medium">{info?.phac_do || "TDF/3TC/DTG"}</div>
          </div>
          <div>
            <div className="text-blue-700 mb-1">Bắt đầu:</div>
            <div className="font-medium">
              {info?.ngay_bat_dau || "2024-03-10"}
            </div>
          </div>
          <div>
            <div className="text-blue-700 mb-1">Tuân thủ:</div>
            <div className="font-medium">
              {info?.tuan_thu || "Khá (90-95%)"}
            </div>
          </div>
          <div>
            <div className="text-blue-700 mb-1">Tác dụng phụ:</div>
            <div className="font-medium">{info?.tac_dung_phu || "Không"}</div>
          </div>
        </div>
      </div>
      <div className="bg-green-50 rounded-lg shadow mb-6">
        <div className="p-5 border-b border-green-100">
          <h3 className="font-bold text-lg text-green-800">
            Kết quả xét nghiệm gần nhất
          </h3>
        </div>
        <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <div className="text-green-700 mb-1">Viral Load:</div>
            <div className="font-medium">
              {info?.viral_load || "150 copies/ml"}
            </div>
          </div>
          <div>
            <div className="text-green-700 mb-1">CD4:</div>
            <div className="font-medium">{info?.cd4 || "350 cells/μL"}</div>
          </div>
          <div>
            <div className="text-green-700 mb-1">Sàng lọc:</div>
            <div className="font-medium">
              {info?.sang_loc || "HIV Ag/Ab: Dương tính"}
            </div>
          </div>
          <div>
            <div className="text-green-700 mb-1">Khẳng định:</div>
            <div className="font-medium">
              {info?.khang_dinh || "Western Blot: Dương tính"}
            </div>
          </div>
        </div>
      </div>{" "}
      <div className="flex w-full mb-6 bg-white rounded-lg overflow-hidden shadow">
        <button
          type="button"
          className={`flex-1 py-3 px-4 transition-all duration-200 ease-in-out ${
            tab === "current"
              ? "bg-blue-500 text-white font-medium shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={(e) => {
            e.preventDefault();
            setTab("current");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline-block mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Khám hiện tại
        </button>
        <button
          type="button"
          className={`flex-1 py-3 px-4 transition-all duration-200 ease-in-out ${
            tab === "history"
              ? "bg-blue-500 text-white font-medium shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={(e) => {
            e.preventDefault();
            setTab("history");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline-block mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Lịch sử khám
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        {tab === "current" ? (
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
    </div>
  );
};

export default PatientExam;
