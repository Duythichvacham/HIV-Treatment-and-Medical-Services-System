import React from "react";

const ExamHistory = ({ history }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Lịch sử khám bệnh</h2>
    {history.length === 0 ? (
      <div>Không có lịch sử khám</div>
    ) : (
      <div>
        {history.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-6 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-lg">{item.ngay_kham}</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {item.loai_kham}
              </span>
            </div>
            <div>
              <b>Bác sĩ:</b> {item.bac_si}
            </div>
            <div>
              <b>Chẩn đoán:</b> {item.chan_doan}
            </div>
            <div>
              <b>Đơn thuốc:</b> {item.don_thuoc}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
export default ExamHistory;
