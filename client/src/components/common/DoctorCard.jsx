import React from 'react';
import { Link } from 'react-router-dom';

const DoctorCard = ({ image, name, link }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow border border-green-100 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-lg duration-300 min-h-[270px]">
      <img
        src={image}
        alt={name}
        className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-green-200 shadow"
      />
      <div className="font-bold text-xl text-green-800 mb-4 text-center leading-tight">{name}</div>
      {link && (
        <Link
          to={link}
          className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition text-base font-semibold mt-auto"
        >
          Xem chi tiết
        </Link>
      )}
    </div>
  );
};

export default DoctorCard;
