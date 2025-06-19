import React from 'react';
import { Link } from 'react-router-dom';

const DoctorCard = ({
  image,
  name,
  gender,
  specialty = 'HIV/AIDS',
  schedule,
  price,
  link
}) => (
  <div className="bg-white rounded-xl p-6 shadow border border-green-100 flex flex-col items-center">
    <img
      src={image}
      alt={name}
      className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-white shadow"
    />
    <div className="font-bold text-lg text-green-700 mb-1">{name}</div>
    <div className="text-sm text-gray-600 mb-1">Giới tính: {gender}</div>
    <div className="text-sm text-gray-600 mb-4">Chuyên khoa: {specialty}</div>
    <div className="text-sm text-gray-600 mb-1">Lịch khám: {schedule}</div>
    <div className="text-sm font-semibold text-green-700 mb-4">Giá khám: {price}</div>
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

export default DoctorCard;
