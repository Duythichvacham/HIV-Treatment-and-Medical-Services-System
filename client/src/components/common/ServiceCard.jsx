import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ iconBg = 'bg-green-600', iconColor = 'text-white', icon, name, subtitle, duration, price, features = [], link, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl p-8 shadow border border-green-100 flex flex-col ${className}`}>
    <div>
      <div className="flex items-center mb-2">
        <div className={`${iconBg} ${iconColor} rounded-full w-10 h-10 flex items-center justify-center mr-3 font-bold text-xl`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg text-green-700">{name}</h3>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex items-center text-gray-500 text-sm mb-2">{duration}</div>
        <div className="text-right font-bold text-lg text-green-700 mb-2">{price}</div>
        {features && features.length > 0 && (
          <>
            <div className="font-semibold mb-1">Đặc điểm:</div>
            <ul className="text-green-700 text-sm list-disc list-inside mb-4">
              {features.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          </>
        )}
      </div>
      {link && (
        <Link to={link} className="block text-center bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 transition w-full mt-2">
          Xem chi tiết
        </Link>
      )}
    </div>
  </div>
);

export default ServiceCard;
