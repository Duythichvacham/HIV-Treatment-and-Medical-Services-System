import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DoctorCard = ({ image, name, link, patientId, appointmentId }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    axios
      .get(`/api/v1/doctor/current-exam/${patientId}${appointmentId ? `?appointmentId=${appointmentId}` : ''}`)
      .then((res) => {
        setDetail(res.data.data?.[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        setError('Không lấy được thông tin chi tiết');
        setLoading(false);
      });
  }, [patientId, appointmentId]);

  return (
    <div className="bg-white rounded-xl p-6 shadow border border-green-100 flex flex-col items-center">
      <img
        src={image}
        alt={name}
        className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-white shadow"
      />
      <div className="font-bold text-lg text-green-700 mb-4">{name}</div>
      {loading ? (
        <div className="text-gray-500 text-sm mb-2">Đang tải chi tiết...</div>
      ) : error ? (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      ) : detail ? (
        <div className="w-full text-left text-sm mb-2">
          <div><strong>ARV:</strong> {detail.phac_do || 'Chưa có'}</div>
          <div><strong>Tuân thủ:</strong> {detail.tuan_thu || 'Chưa có'}</div>
          <div><strong>Viral Load:</strong> {detail.viral_load || 'Chưa có'}</div>
          <div><strong>CD4:</strong> {detail.cd4 || 'Chưa có'}</div>
        </div>
      ) : null}
      {link && (
        <Link
          to={link}
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition text-sm"
        >
          Xem chi tiết
        </Link>
      )}
    </div>
  );
};

export default DoctorCard;
