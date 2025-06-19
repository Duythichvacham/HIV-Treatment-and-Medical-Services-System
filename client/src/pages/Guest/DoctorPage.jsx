import React from 'react';
import DoctorCard from '../../components/common/DoctorCard';
import { doctors } from '../../mockData/data';



const DoctorPage = () => {
  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-500 to-green-500 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Đội Ngũ Chuyên Gia</h1>
        <p className="text-lg mb-6">Gặp gỡ đội ngũ bác sĩ và chuyên gia hàng đầu về HIV/AIDS, cam kết mang đến dịch vụ chăm sóc tốt nhất cho bạn.</p>
        <button className="bg-white text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">{doctors.length} chuyên gia giàu kinh nghiệm</button>
      </section>

     

      {/* Doctors */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Bác Sĩ & Chuyên Gia</h2>
          <p className="text-gray-600">Đội ngũ chuyên gia giàu kinh nghiệm, tận tâm chăm sóc sức khỏe của bạn</p>
        </div>
        <div className="max-w-6xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4">
          {doctors.map(doc => (
            <DoctorCard
              key={doc.id}
              image={doc.image}
              name={doc.name}
              gender={doc.gender}
              specialty={doc.specialty}
              schedule={doc.schedule}
              price={doc.price}
              link={`/doctors/${doc.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DoctorPage;
