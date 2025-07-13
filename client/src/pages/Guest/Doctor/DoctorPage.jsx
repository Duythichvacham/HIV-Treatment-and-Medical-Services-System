import React, { useEffect, useState } from "react";
import DoctorCard from "../../../components/common/DoctorCard";
import { getDoctors } from "../../../services/api";
import { motion } from "framer-motion";

const DoctorPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors();
        setDoctors(data);
      } catch (err) {
        setError("Không thể tải danh sách bác sĩ.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  function normalize(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  const filteredDoctors = doctors.filter((doc) =>
    normalize(doc.name || "").includes(normalize(search))
  );

  if (loading)
    return <div className="p-6 text-center">Đang tải danh sách...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="pb-16">
      {/* Hero */}
      {/* ĐÃ XÓA PHẦN HERO */}
      {/* Doctors */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Bác Sĩ & Chuyên Gia</h2>
          <p className="text-gray-600">
            Đội ngũ chuyên gia giàu kinh nghiệm, tận tâm chăm sóc sức khỏe của
            bạn
          </p>
        </div>
        <div className="max-w-2xl mx-auto mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bác sĩ..."
            className="w-full px-5 py-3 rounded-full border border-green-200 focus:border-green-500 outline-none shadow-sm text-lg text-gray-700 mb-2"
          />
        </div>
        <div className="max-w-6xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4">
          {filteredDoctors.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              Không tìm thấy bác sĩ phù hợp.
            </div>
          ) : (
            filteredDoctors.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
              >
                <DoctorCard
                  image={doc.avatar}
                  name={doc.name}
                  // API returns no gender, schedule or price by default
                  link={`/doctors/${doc.id}`}
                />
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default DoctorPage;
