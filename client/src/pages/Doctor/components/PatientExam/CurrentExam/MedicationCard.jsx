import React, { useState, useEffect } from "react";
import { arvRegimenApi } from "../../../services/arvRegimenApi";

const MedicationCard = ({
  medication,
  index,
  readOnly = false,
  onUpdateMedication,
}) => {
  const handleFieldChange = (field, value) => {
    if (onUpdateMedication) {
      onUpdateMedication(index, field, value);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 py-2 border-b border-gray-200">
      {/* Cột 1: Tên thuốc - chỉ hiển thị, không edit */}
      <div className="text-sm">
        <div className="font-medium text-gray-800">{medication.drug_name}</div>
        <div className="text-xs text-gray-500">Liều lượng</div>
        <div className="text-xs text-gray-600">
          {medication.dosage || "300mg"}
        </div>
      </div>

      {/* Cột 2: Số lượng */}
      <div>
        <input
          type="number"
          value={medication.duration_days || "30"}
          onChange={(e) =>
            handleFieldChange("duration_days", parseInt(e.target.value) || "")
          }
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="30"
          readOnly={readOnly}
        />
      </div>

      {/* Cột 3: Tần suất */}
      <div>
        <select
          value={medication.frequency || "1 lần/ngày"}
          onChange={(e) => handleFieldChange("frequency", e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={readOnly}
        >
          <option value="1 lần/ngày">1 lần/ngày</option>
          <option value="2 lần/ngày">2 lần/ngày</option>
          <option value="3 lần/ngày">3 lần/ngày</option>
        </select>
      </div>

      {/* Cột 4: Thời gian */}
      <div>
        <select
          value={
            medication.duration_days
              ? `${medication.duration_days} ngày`
              : "30 ngày"
          }
          onChange={(e) => {
            const days = parseInt(e.target.value.replace(" ngày", ""));
            handleFieldChange("duration_days", days);
          }}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={readOnly}
        >
          <option value="30 ngày">30 ngày</option>
          <option value="60 ngày">60 ngày</option>
          <option value="90 ngày">90 ngày</option>
        </select>
      </div>
    </div>
  );
};

const ARVRegimenSelector = ({ onUpdateMedications }) => {
  const [regimens, setRegimens] = useState([]);
  const [selectedRegimen, setSelectedRegimen] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegimens = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching ARV regimens...");

        const response = await arvRegimenApi.getAll();
        console.log("ARV regimens response:", response);

        if (response && response.success && response.data) {
          console.log("Setting regimens:", response.data);
          console.log("Regimens count:", response.data.length);
          setRegimens(response.data);
        } else {
          console.error("Invalid response format:", response);
          setError("Không thể tải danh sách phác đồ");
        }
      } catch (error) {
        console.error("Error fetching ARV regimens:", error);
        setError("Lỗi khi tải danh sách phác đồ: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRegimens();
  }, []);

  const handleRegimenChange = (event) => {
    const regimenId = event.target.value;

    if (!regimenId) {
      setSelectedRegimen(null);
      setMedications([]);
      onUpdateMedications([]);
      return;
    }

    const regimen = regimens.find(
      (r) => r.arv_regimen_id === Number(regimenId)
    );

    if (!regimen) {
      console.error("Regimen not found for ID:", regimenId);
      return;
    }

    setSelectedRegimen(regimen);

    // Parse components into individual medications
    const parsedMedications = regimen.components
      .split(" + ")
      .map((medication) => ({
        drug_name: medication.trim(),
        dosage: "",
        frequency: "",
        duration_days: "",
        usage_instructions: "",
        notes: "", // This is for doctor's notes, not from the regimen data
      }));

    setMedications(parsedMedications);
    onUpdateMedications(parsedMedications);
  };

  return (
    <div>
      <h3>Chọn phác đồ điều trị</h3>

      {/* Debug info */}
      <div className="mb-2 text-xs text-gray-500">
        Loading: {loading.toString()}, Regimens count: {regimens.length}, Error:{" "}
        {error || "none"}
      </div>

      <select onChange={handleRegimenChange} disabled={loading}>
        <option value="">{loading ? "Đang tải..." : "Chọn phác đồ"}</option>
        {regimens && regimens.length > 0
          ? regimens.map((regimen) => {
              console.log("Rendering regimen:", regimen);
              return (
                <option
                  key={regimen.arv_regimen_id}
                  value={regimen.arv_regimen_id}
                >
                  {`${regimen.name} - ${regimen.for_group}`}
                </option>
              );
            })
          : !loading && <option disabled>Không có phác đồ nào</option>}
      </select>

      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}

      {selectedRegimen && medications.length > 0 && (
        <div className="mt-4">
          <h4>Thuốc trong phác đồ: {selectedRegimen.name}</h4>
          <p className="text-sm text-gray-600 mb-3">
            Thành phần: {selectedRegimen.components}
          </p>
          {medications.map((medication, index) => (
            <MedicationCard
              key={index}
              medication={medication}
              index={index}
              onUpdateMedication={(idx, field, value) => {
                const updatedMedications = [...medications];
                updatedMedications[idx][field] = value;
                setMedications(updatedMedications);
                onUpdateMedications(updatedMedications);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ARVRegimenSelector;
