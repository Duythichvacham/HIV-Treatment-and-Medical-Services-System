import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAllLabTests, getCurrentLabStaffShift, getLatestTestResultsForPatient } from "../../services/api";
import axios from "axios";
import '../../styles/animations.css';

const API_BASE = "http://localhost:5000/api/v1";

// Hàm format thời gian đẹp
function formatDateTime(str) {
  if (!str) return "";
  // Nếu là dạng "YYYY-MM-DD HH:mm:ss.SSS" hoặc "YYYY-MM-DD HH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)) {
    const [date, time] = str.split(' ');
    const [year, month, day] = date.split('-');
    const [hour, min] = time.split(':');
    return `${hour}:${min} ${day}/${month}/${year}`;
  }
  // Nếu là dạng "HH:mm:ss DD/MM/YYYY" hoặc "HH:mm:ss DD/M/YYYY"
  if (/^\d{2}:\d{2}:\d{2} \d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [time, date] = str.split(' ');
    const [hour, min] = time.split(':');
    const [day, month, year] = date.split('/');
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');
    return `${hour}:${min} ${paddedDay}/${paddedMonth}/${year}`;
  }
  // Nếu là ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) {
    const [date, time] = str.split('T');
    const [year, month, day] = date.split('-');
    const [hour, min] = time.split(':');
    return `${hour}:${min} ${day}/${month}/${year}`;
  }
  // Nếu là ISO hoặc dạng khác, fallback về cũ
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hour = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${hour}:${min} ${day}/${month}/${year}`;
}

const getResultByType = (results, typeId) => {
  return (results || []).find(r => r.test_type_id === typeId);
};

const parseVNDateTime = (str) => {
  if (!str) return null;
  const [time, date] = str.split(' ');
  if (!date) return null;
  const [day, month, year] = date.split('/');
  // Đảm bảo ngày và tháng có 2 chữ số
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');
  return new Date(`${year}-${paddedMonth}-${paddedDay}T${time}`);
};

const Card = ({ data, section, onStart, onProcess, onResult }) => {
  const [latest, setLatest] = useState({ cd4: null, vl: null });
  const [loadingLatest, setLoadingLatest] = useState(false);

  useEffect(() => {
    if (data.patient_id) {
      setLoadingLatest(true);
      getLatestTestResultsForPatient(data.patient_id)
        .then(res => {
          setLatest({
            cd4: res?.data?.latest_cd4 || null,
            vl: res?.data?.latest_viral_load || null
          });
        })
        .catch(error => {
          setLatest({ cd4: null, vl: null });
        })
        .finally(() => {
          setLoadingLatest(false);
        });
    }
  }, [data.patient_id]);

  return (
    <div className="bg-white rounded-3xl p-7 shadow-2xl border border-blue-100 mb-6 flex flex-col gap-2 transition-all hover:shadow-blue-200 animate-fade-in animate-slide-up duration-500">
      <div className="flex items-center mb-2 gap-3">
        <div className="font-bold text-blue-700 text-lg bg-blue-50 rounded-full px-4 py-1 shadow-sm">
          {data.queue_number !== undefined && data.queue_number !== null
            ? `STT: ${data.queue_number}`
            : data.id || data.code}
        </div>
        <div className="font-semibold text-xl text-blue-900">
          {data.patient_name || data.name}
        </div>
      </div>
      <div className="text-base text-gray-700 mb-1 flex gap-6">
        <span className="font-medium">{data.age} tuổi</span>
        <span className="font-medium">{data.gender}</span>
      </div>
      <div className="text-xs text-gray-400 mb-1">
        Đặt lúc: {formatDateTime(data.bookTime)}
      </div>
      {data.phone && (
        <div className="text-sm text-gray-700 mb-1">📞 {data.phone}</div>
      )}
      <div className="flex flex-wrap gap-2 my-2">
        {data.source === 'doctor_request' && Array.isArray(data.type_names) ? (
          [...new Set(data.type_names)].map((tn, idx) => (
            <span key={idx}
              className="px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-200 to-purple-100 text-purple-800 font-semibold shadow">
              {tn}
            </span>
          ))
        ) : (
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold shadow ${
              data.type === "Sàng lọc"
                ? "bg-yellow-100 text-yellow-700"
                : data.type === "Khẳng định"
                ? "bg-red-100 text-red-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {data.type_name}
          </span>
        )}
      </div>
      <div className="text-sm text-gray-600 mb-1 flex gap-6">
        {section === "Hoàn thành" ? (
          (() => {
            const cd4s = (data.results || []).filter(r => r.test_type_id === 1);
            const latestCD4 = cd4s.reduce((a, b) => (a && a.created_at > b.created_at ? a : b), cd4s[0]);
            const vls = (data.results || []).filter(r => r.test_type_id === 2);
            const latestVL = vls.reduce((a, b) => (a && a.created_at > b.created_at ? a : b), vls[0]);
            return (
              <>
                <div>CD4: <b>{latestCD4 ? latestCD4.result_value : 'Chưa có'}</b></div>
                <div>Viral Load: <b>{latestVL ? latestVL.result_value : 'Chưa có'}</b></div>
              </>
            );
          })()
        ) : (
          loadingLatest ? (
            <div className="text-gray-400">Đang tải lịch sử xét nghiệm...</div>
          ) : (
            <>
              <div>CD4: <b>{latest.cd4 || 'Chưa có'}</b></div>
              <div>Viral Load: <b>{latest.vl || 'Chưa có'}</b></div>
            </>
          )
        )}
      </div>
      <div className="text-xs text-gray-500 mb-1">
        {data.source === "doctor_request" ? (
          <>
            Nguồn: <span className="font-semibold text-blue-700">Bác sĩ chỉ định</span>
            {data.doctor ? (
              <>
                {" "}- BS: <b>{data.doctor}</b>
              </>
            ) : null}
          </>
        ) : data.source === "self_booking" ? (
          <span className="font-semibold text-green-700">Bệnh nhân tự đăng ký</span>
        ) : data.id ? (
          <>BS chỉ định: <b>{data.doctor}</b></>
        ) : (
          <b>Đăng kí xét nghiệm</b>
        )}
      </div>
      {section === "Chờ xét nghiệm" && (
        <button
          onClick={() => onStart(data)}
          className="w-full mt-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white py-3 rounded-full font-bold text-lg hover:from-blue-800 hover:to-blue-600 transition-all shadow-lg"
        >
          Bắt đầu xét nghiệm
        </button>
      )}
      {section === "Đang xét nghiệm" && (
        <button
          onClick={() => onProcess(data)}
          className="w-full mt-3 bg-gradient-to-r from-yellow-400 to-yellow-200 text-yellow-900 py-3 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-yellow-300 transition-all shadow-lg"
        >
          Nhập kết quả
        </button>
      )}
      {section === "Hoàn thành" && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 my-2 text-sm text-green-700 flex flex-col gap-1">
            {(() => {
              const results = data.results || [];
              let doneTime = "-";
              if (results.length > 0) {
                const latest = results.reduce((a, b) => {
                  const aTime = a.created_at || "";
                  const bTime = b.created_at || "";
                  return aTime > bTime ? a : b;
                });
                if (latest && latest.created_at) {
                  doneTime = formatDateTime(latest.created_at);
                }
              }
              return <div>Hoàn thành: {doneTime}</div>;
            })()}
            {(() => {
              const r = getResultByType(data.results, 3);
              return r ? <div>Kết quả sàng lọc: <b>{r.result_value}</b></div> : null;
            })()}
            {(() => {
              const r = getResultByType(data.results, 4);
              return r ? <div>Kết quả khẳng định: <b>{r.result_value}</b></div> : null;
            })()}
          </div>
          <button
            onClick={() => onResult && onResult(data)}
            className="w-full mt-1 bg-gradient-to-r from-green-400 to-green-200 border border-green-400 text-green-900 py-3 rounded-full font-bold text-lg hover:from-green-500 hover:to-green-300 transition-all shadow-lg"
          >
            Xem kết quả
          </button>
        </>
      )}
    </div>
  );
};

const LabStaff = () => {
  const [sections, setSections] = useState([
    {
      title: "Chờ xét nghiệm",
      color: "border-yellow-400",
      icon: "🕒",
      count: 0,
      cards: [],
    },
    {
      title: "Đang xét nghiệm",
      color: "border-blue-500",
      icon: "🔬",
      count: 0,
      cards: [],
    },
    {
      title: "Hoàn thành",
      color: "border-green-500",
      icon: "✅",
      count: 0,
      cards: [],
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    return (
      localStorage.getItem("lab_selected_date") ||
      new Date().toISOString().slice(0, 10)
    );
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    screening: 0,
    confirmation: 0,
    periodic: 0,
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasShift, setHasShift] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const lab_staff_id = user?.id;
      // Lấy tất cả dữ liệu cho queue và inProgress
      const allTests = await getAllLabTests(null, selectedDate, lab_staff_id);
      // Gộp các doctor_request theo id (request_id)
      const groupByRequest = (arr) => {
        const map = new Map();
        arr.forEach(item => {
          if (item.source === 'doctor_request') {
            const key = item.id;
            if (!map.has(key)) {
              map.set(key, { ...item, 
                type_names: [item.type_name],
                service_names: [item.service_name],
                service_ids: [item.service_id],
              });
            } else {
              const exist = map.get(key);
              exist.type_names.push(item.type_name);
              exist.service_names.push(item.service_name);
              exist.service_ids.push(item.service_id);
            }
          } else {
            // self_booking giữ nguyên
            map.set('self_' + (item.appointment_id || Math.random()), item);
          }
        });
        return Array.from(map.values());
      };
      const queue = groupByRequest(allTests.filter((test) => test.status === "requested"));
      const inProgress = groupByRequest(allTests.filter((test) => test.status === "in_progress"));
      const completed = await getAllLabTests('completed', selectedDate, lab_staff_id);
      const completedGrouped = groupByRequest(completed);
      // Tính toán summary từ dữ liệu thật
      // Cần group theo request để tránh đếm gấp đôi
      const groupedForSummary = groupByRequest(allTests);
      
      const screening = groupedForSummary.filter(
        (test) => {
          if (test.source === 'doctor_request' && test.type_names) {
            return test.type_names.some(name => name && name.toLowerCase().includes("sàng lọc"));
          }
          return test.type_name && test.type_name.toLowerCase().includes("sàng lọc");
        }
      ).length;
      
      const confirmation = groupedForSummary.filter(
        (test) => {
          if (test.source === 'doctor_request' && test.type_names) {
            return test.type_names.some(name => name && name.toLowerCase().includes("khẳng định"));
          }
          return test.type_name && test.type_name.toLowerCase().includes("khẳng định");
        }
      ).length;
      
      const periodic = groupedForSummary.filter(
        (test) => {
          if (test.source === 'doctor_request' && test.type_names) {
            // Kiểm tra nếu có cả CD4 và Viral Load trong cùng một request
            const hasCD4 = test.type_names.some(name => name && name.toLowerCase().includes("cd4"));
            const hasViralLoad = test.type_names.some(name => name && name.toLowerCase().includes("viral load"));
            return hasCD4 || hasViralLoad;
          }
          // Cho self_booking, kiểm tra type_name
          return test.type_name && (
            test.type_name.toLowerCase().includes("cd4") || 
            test.type_name.toLowerCase().includes("viral load")
          );
        }
      ).length;
      setSummary({ screening, confirmation, periodic });
      setSections((prevSections) => [
        { ...prevSections[0], cards: queue || [], count: (queue || []).length },
        {
          ...prevSections[1],
          cards: inProgress || [],
          count: (inProgress || []).length,
        },
        { ...prevSections[2], cards: completedGrouped || [], count: (completedGrouped || []).length },
      ]);
    } catch (err) {
      console.error("Lỗi tải dữ liệu lab:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const fetchShift = async () => {
      if (user?.id && selectedDate) {
        try {
          const shift = await getCurrentLabStaffShift(user.id, selectedDate);
          setHasShift(!!shift);
        } catch (error) {
          console.error("Error checking shift:", error);
          setHasShift(false);
        }
      }
    };
    fetchShift();
    // eslint-disable-next-line
  }, [selectedDate]);

  const handleStart = async (card) => {
    if (!hasShift) {
      alert("Bạn không được phân công ca làm việc trong ngày này!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      let test_note_id = card.test_note_id;
      // Nếu chưa có test_note_id, tạo mới TestNote (ghi nhận test_datetime, notes=null)
      if (!test_note_id) {
        const payload = { 
          created_by_id: user.id, 
          notes: null,
          test_datetime: new Date().toISOString()
        };
        if (card.source === "doctor_request") {
          payload.request_id = card.id;
          payload.appointment_id = card.appointment_id;
        } else if (card.source === "self_booking") {
          payload.appointment_id = card.appointment_id;
        }
        const testNoteRes = await axios.post(
          `${API_BASE}/lab/test-notes`,
          payload,
          { headers }
        );
        test_note_id = testNoteRes.data.data.test_note_id;
      }
      // Sau đó chuyển trạng thái
      if (card.source === "doctor_request") {
        const url = `${API_BASE}/lab/test-requests/${card.id}/status`;
        await axios.patch(url, { status: "in_progress" }, { headers });
      } else if (card.source === "self_booking") {
        const url = `${API_BASE}/appointments/${card.appointment_id}/status`;
        await axios.post(url, { status: "in_progress" }, { headers });
      } else {
        alert("Không xác định được loại mẫu xét nghiệm!");
        return;
      }
      await fetchData();
    } catch (err) {
      alert(
        "Không thể bắt đầu xét nghiệm! " + (err?.response?.data?.message || "")
      );
    }
  };

  const handleProcess = async (card) => {
    if (!hasShift) {
      alert("Bạn không được phân công ca làm việc trong ngày này!");
      return;
    }
    try {
      let test_note_id = card.test_note_id;
      if (!test_note_id) {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const payload = { created_by_id: user.id };
        if (card.source === "doctor_request") {
          payload.request_id = card.id;
          payload.appointment_id = card.appointment_id;
        } else if (card.source === "self_booking") {
          payload.appointment_id = card.appointment_id;
        }
        const testNoteRes = await axios.post(
          `${API_BASE}/lab/test-notes`,
          payload,
          { headers }
        );
        test_note_id = testNoteRes.data.data.test_note_id;
      }
      navigate("/lab-process", { state: { ...card, test_note_id } });
    } catch (err) {
      alert(
        "Không thể tạo phiếu xét nghiệm! " +
          (err?.response?.data?.message || "")
      );
    }
  };

  const handleViewResult = async (card) => {
    const test_note_id = card.test_note_id || card.id;
    if (!test_note_id) {
      alert("Không tìm thấy mã phiếu xét nghiệm!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      // Lấy chi tiết phiếu xét nghiệm
      const noteRes = await axios.get(
        `${API_BASE}/lab/test-notes/${test_note_id}`,
        { headers }
      );
      // Lấy kết quả xét nghiệm từ API riêng
      const resultsRes = await axios.get(
        `${API_BASE}/lab/test-results/${test_note_id}`,
        { headers }
      );

      const note = noteRes.data.data;
      const results = resultsRes.data.data || [];

      navigate("/lab-result", { state: { note, results } });
    } catch (err) {
      alert("Không thể lấy chi tiết kết quả!");
    }
  };

  // Filter sections based on search term
  const filteredSections = sections.map((section) => ({
    ...section,
    cards: section.cards.filter((card) => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (card.patient_name || card.name || "")
          .toLowerCase()
          .includes(searchLower) ||
        (card.code || "").toLowerCase().includes(searchLower) ||
        (card.service_name || card.test || "")
          .toLowerCase()
          .includes(searchLower) ||
        (card.type_name || card.type || "").toLowerCase().includes(searchLower)
      );
    }),
  }));

  if (!user || user.role !== "Lab-Staff") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600 font-bold text-xl">
        Bạn cần đăng nhập với vai trò Lab-Staff để truy cập trang này.
      </div>
    );
  }
  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-blue-600 font-bold text-xl">
        Đang tải dữ liệu...
      </div>
    );
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-2 animate-fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-8 tracking-tight text-center drop-shadow-lg animate-slide-up duration-700">Quản lý xét nghiệm</h1>
        {user?.id && !hasShift && !loading && (
          <div className="text-center text-red-600 font-semibold text-lg my-8">
            Bạn không được phân công ca làm việc trong ngày này. Chỉ xem được danh sách bệnh nhân.
          </div>
        )}
        <div className="text-gray-600 mb-8 text-center text-lg">Quản lý mẫu xét nghiệm từ bác sĩ chỉ định và đăng ký xét nghiệm</div>
        {/* Chọn ngày */}
        <div className="mb-8 flex flex-col md:flex-row items-center gap-4 justify-center">
          <label className="font-semibold text-lg">Chọn ngày:</label>
          <input
            type="date"
            className="px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 text-lg shadow"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              localStorage.setItem("lab_selected_date", e.target.value);
            }}
          />
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full font-bold text-lg hover:from-blue-800 hover:to-blue-600 transition-all shadow-lg"
          >
            Làm mới
          </button>
        </div>
        {/* Summary - dùng dữ liệu thật */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-2xl shadow-xl p-7 flex items-center gap-6 border-2 border-yellow-200 transition-all duration-500 hover:scale-105 animate-fade-in animate-slide-up">
            <div className="text-4xl">🧪</div>
            <div>
              <div className="text-3xl font-extrabold text-yellow-700">{summary.screening}</div>
              <div className="text-yellow-800 font-semibold text-lg">XN Sàng lọc</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-100 to-red-50 rounded-2xl shadow-xl p-7 flex items-center gap-6 border-2 border-red-200 transition-all duration-500 hover:scale-105 animate-fade-in animate-slide-up delay-100">
            <div className="text-4xl">📄</div>
            <div>
              <div className="text-3xl font-extrabold text-red-700">{summary.confirmation}</div>
              <div className="text-red-800 font-semibold text-lg">XN Khẳng định</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-2xl shadow-xl p-7 flex items-center gap-6 border-2 border-purple-200 transition-all duration-500 hover:scale-105 animate-fade-in animate-slide-up delay-200">
            <div className="text-4xl">✔️</div>
            <div>
              <div className="text-3xl font-extrabold text-purple-700">{summary.periodic}</div>
              <div className="text-purple-800 font-semibold text-lg">XN CD4 & Viral Load</div>
            </div>
          </div>
        </div>
        {/* Search */}
        <div className="mb-10 max-w-2xl mx-auto animate-fade-in animate-slide-up delay-200">
          <input
            className="w-full px-6 py-4 rounded-xl border-2 border-blue-200 focus:ring-2 focus:ring-blue-300 text-lg shadow transition-all duration-300 focus:scale-105"
            placeholder="Tìm theo tên, mã bệnh nhân hoặc xét nghiệm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Sections */}
        <div className="grid md:grid-cols-3 gap-10">
          {filteredSections.map((section, idx) => (
            <div
              key={section.title}
              className={`border-t-8 ${section.color} bg-white rounded-2xl shadow-xl p-6 flex-1 min-w-0 transition-all hover:shadow-blue-200 animate-fade-in animate-slide-up duration-700 delay-${idx * 100}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{section.icon}</span>
                <span
                  className={`font-extrabold text-2xl ${section.color.replace(
                    "border-",
                    "text-"
                  )}`}
                >
                  {section.title} ({section.cards.length})
                </span>
              </div>
              {section.cards.length === 0 ? (
                <div className="text-center text-gray-400 py-6 text-lg">
                  {searchTerm
                    ? "Không tìm thấy kết quả phù hợp."
                    : "Không có mẫu xét nghiệm nào."}
                </div>
              ) : (
                [...section.cards]
                  .sort((a, b) => (a.queue_number || 0) - (b.queue_number || 0))
                  .map((card) => (
                    <Card
                      key={
                        card.test_note_id !== undefined &&
                        card.test_note_id !== null
                          ? `note-${card.test_note_id}`
                          : card.appointment_id !== undefined &&
                            card.appointment_id !== null
                          ? `app-${card.appointment_id}`
                          : card.id !== undefined && card.id !== null
                          ? `id-${card.id}`
                          : Math.random()
                      }
                      data={card}
                      section={section.title}
                      onStart={handleStart}
                      onProcess={handleProcess}
                      onResult={handleViewResult}
                    />
                  ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabStaff;
