import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

const ExamForm = ({ patient, onSaveTemp, onFinish }) => {
  const [form, setForm] = useState({
    diagnosis: "",
    diagnosisSecondary: "",
    vitalSigns: {
      bloodPressure: "",
      temperature: "",
      heartRate: "",
      respiratoryRate: "",
    },
    measurements: {
      weight: "",
      height: "",
      bmi: "",
    },
    treatmentOption: "continue", // "continue" hoặc "change"
    treatmentPlan: "Tiếp tục TDF/3TC/EFV",
    selectedRegimen: "",
    clinical_signs: "",
    note: "",
    testRequests: {
      cd4: false,
      viralLoad: false,
      screening: false,
    },
    medications: [],
    prescriptionDetails: [], // Mảng lưu thông tin chi tiết thuốc
  });

  const [errors, setErrors] = useState({});
  const [regimens, setRegimens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  // Hàm load lại dữ liệu khám tạm đã lưu
  const loadSavedExamData = (examData) => {
    console.log("🔄 Loading saved exam data:", examData);

    try {
      // Kiểm tra dữ liệu đầu vào
      if (!examData) {
        console.error("❌ Invalid exam data provided:", examData);
        return;
      }

      // Parse vital signs từ chuỗi (vì đã lưu dưới dạng chuỗi)
      const vitalSigns = {
        bloodPressure: "",
        temperature: "",
        heartRate: "",
        respiratoryRate: "",
      };
      if (examData.vitals) {
        console.log("📊 Parsing vitals string:", examData.vitals);
        const vitalsString = examData.vitals;

        try {
          // Extract huyết áp
          const bpMatch = vitalsString.match(/Huyết áp: ([^,]+)/);
          if (bpMatch) {
            vitalSigns.bloodPressure = bpMatch[1].replace("N/A", "").trim();
            console.log(
              "✅ Extracted blood pressure:",
              vitalSigns.bloodPressure
            );
          }

          // Extract nhiệt độ
          const tempMatch = vitalsString.match(/Nhiệt độ: ([^°]+)/);
          if (tempMatch) {
            vitalSigns.temperature = tempMatch[1].replace("N/A", "").trim();
            console.log("✅ Extracted temperature:", vitalSigns.temperature);
          }

          // Extract nhịp tim
          const hrMatch = vitalsString.match(/Nhịp tim: ([^/]+)/);
          if (hrMatch) {
            vitalSigns.heartRate = hrMatch[1].replace("N/A", "").trim();
            console.log("✅ Extracted heart rate:", vitalSigns.heartRate);
          }

          // Extract nhịp thở
          const rrMatch = vitalsString.match(/Nhịp thở: ([^/]+)/);
          if (rrMatch) {
            vitalSigns.respiratoryRate = rrMatch[1].replace("N/A", "").trim();
            console.log(
              "✅ Extracted respiratory rate:",
              vitalSigns.respiratoryRate
            );
          }
        } catch (error) {
          console.error("❌ Error parsing vitals:", error);
        }
      } else {
        console.log("⚠️ No vitals data found in exam data");
      }

      // Xác định treatmentOption dựa vào arv_regimen_id
      let treatmentOption = "continue";
      let selectedRegimen = "";

      if (examData.arv_regimen_id) {
        treatmentOption = "change";
        selectedRegimen = examData.arv_regimen_name || "";
      } // Cập nhật form state với dữ liệu đã lưu
      const updatedFormData = {
        diagnosis: examData.diagnosis_primary || "",
        diagnosisSecondary: examData.diagnosis_secondary || "",
        vitalSigns: vitalSigns,
        measurements: {
          weight: examData.weight || "",
          height: examData.height || "",
          bmi: examData.bmi || "",
        },
        treatmentOption: treatmentOption,
        treatmentPlan: examData.follow_up_plan || "Tiếp tục TDF/3TC/EFV",
        selectedRegimen: selectedRegimen,
        clinical_signs: examData.clinical_signs || "",
        note: examData.doctor_notes || "",
        testRequests: {
          cd4: false,
          viralLoad: false,
          screening: false,
        },
        medications: [],
        prescriptionDetails: examData.prescription_details || [],
      };

      console.log("✅ Form data updated with saved values:", updatedFormData);
      setForm(updatedFormData);

      // Nếu đã chọn thay đổi phác đồ và có phác đồ được chọn, load thuốc
      if (treatmentOption === "change" && examData.arv_regimen_id) {
        fetchMedicationsForRegimen(
          examData.arv_regimen_id,
          examData.prescription_details
        );
      }
    } catch (error) {
      console.error("Error loading saved exam data:", error);
    }
  };

  // Hàm lấy danh sách thuốc theo phác đồ và map với prescription_details
  const fetchMedicationsForRegimen = async (
    regimenId,
    prescriptionDetails = []
  ) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/doctor/arv-medications/${regimenId}`
      );

      if (response.data.success && response.data.data) {
        let medications = response.data.data;

        // Map các thông tin từ prescription_details vào medications nếu có
        if (prescriptionDetails && prescriptionDetails.length > 0) {
          medications = medications.map((med) => {
            const savedDetail = prescriptionDetails.find(
              (pd) => pd.drug_name === med.drug_name
            );

            if (savedDetail) {
              return {
                ...med,
                quantity: savedDetail.quantity || med.default_quantity,
                frequency: savedDetail.frequency || med.default_frequency,
                duration_days:
                  savedDetail.duration_days || med.default_duration,
                notes: savedDetail.notes || "",
              };
            }
            return med;
          });
        }

        setForm((prev) => ({
          ...prev,
          medications: medications,
        }));
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  }; // Fetch ARV regimens when component mounts
  useEffect(() => {
    const fetchARVRegimens = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/doctor/arv-regimens"
        );
        if (response.data.success && response.data.data) {
          setRegimens(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching ARV regimens:", error);
      }
    };

    fetchARVRegimens();

    // Nếu có dữ liệu khám tạm từ lần trước, load lại vào form
    console.log("🔍 ExamForm - patient prop received:", patient);
    if (patient && patient.exam_data) {
      console.log(
        "✅ ExamForm - Found exam_data, loading saved data:",
        patient.exam_data
      );
      loadSavedExamData(patient.exam_data);
    } else {
      console.log("⚠️ ExamForm - No exam_data found in patient prop");
    }

    // Reset form khi không có dữ liệu khám tạm
    // Để tránh bị lỗi hooks exhaustive deps
  }, [patient]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Validation functions for required fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name.startsWith("testRequests.")) {
      const testType = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        testRequests: {
          ...prev.testRequests,
          [testType]: checked,
        },
      }));
    } else if (name.includes(".")) {
      const [section, field] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    } // Tính BMI tự động nếu có cả chiều cao và cân nặng
    if (name === "measurements.weight" || name === "measurements.height") {
      const height =
        name === "measurements.height"
          ? parseFloat(value)
          : parseFloat(form.measurements.height);
      const weight =
        name === "measurements.weight"
          ? parseFloat(value)
          : parseFloat(form.measurements.weight);

      if (height && weight && height > 0) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setForm((prev) => ({
          ...prev,
          measurements: {
            ...prev.measurements,
            bmi: bmi,
          },
        }));
      }
    }

    // Clear error when field is filled
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };
  const handleFinish = async () => {
    // Validate required fields
    const newErrors = {};
    let isValid = true;
    // Tìm và hiển thị lỗi

    if (!form.diagnosis.trim()) {
      newErrors.diagnosis = "Vui lòng nhập chẩn đoán chính";
      isValid = false;
    }

    if (form.treatmentOption === "change" && !form.selectedRegimen) {
      newErrors.selectedRegimen = "Vui lòng chọn phác đồ điều trị mới";
      isValid = false;
    }

    if (!form.vitalSigns.bloodPressure) {
      newErrors.bloodPressure = "Vui lòng nhập huyết áp";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      // Tìm phần tử đầu tiên có lỗi và cuộn đến đó
      const firstErrorField = Object.keys(newErrors)[0];
      const errorField = document.querySelector(
        `[name=${firstErrorField}], [name="vitalSigns.${firstErrorField}"]`
      );
      if (errorField) {
        errorField.focus();
        errorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);
    setSaveMessage("");

    try {
      // Kiểm tra appointment_id
      const appointmentId = patient?.appointment_id;
      if (!appointmentId) {
        throw new Error("Không tìm thấy appointment_id của bệnh nhân");
      } // Gọi API lưu dữ liệu khám bệnh
      const token = localStorage.getItem("token"); // Prepare final treatment plan based on selection
      let finalTreatmentPlan = form.treatmentPlan;
      if (form.treatmentOption === "change" && form.selectedRegimen) {
        finalTreatmentPlan = `Thay đổi phác đồ: ${form.selectedRegimen}`;
      } // Chuyển đổi đối tượng vitalSigns thành chuỗi để tránh lỗi validation
      const vitalString = `Huyết áp: ${
        form.vitalSigns.bloodPressure || "N/A"
      }, Nhiệt độ: ${form.vitalSigns.temperature || "N/A"}°C, Nhịp tim: ${
        form.vitalSigns.heartRate || "N/A"
      }/phút, Nhịp thở: ${form.vitalSigns.respiratoryRate || "N/A"}/phút`;

      // Lấy arv_regimen_id nếu đã chọn phác đồ
      let arvRegimenId = null;
      if (form.treatmentOption === "change" && form.selectedRegimen) {
        const selectedRegimenObj = regimens.find(
          (r) => r.name === form.selectedRegimen
        );
        if (selectedRegimenObj) {
          arvRegimenId = selectedRegimenObj.arv_regimen_id;
        }
      }

      const requestData = {
        appointment_id: appointmentId,
        diagnosis: form.diagnosis,
        diagnosis_secondary: form.diagnosisSecondary,
        treatment_plan: finalTreatmentPlan,
        note: form.note,
        vitals: vitalString,
        weight: form.measurements.weight,
        height: form.measurements.height,
        bmi: form.measurements.bmi,
        clinical_signs: form.clinical_signs,
        testRequests: form.testRequests,
        arv_regimen_id: arvRegimenId,
        prescription_details:
          form.treatmentOption === "change" ? form.prescriptionDetails : [],
      };

      const response = await fetch(
        "http://localhost:5000/api/v1/doctor/save-exam-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Lỗi khi lưu dữ liệu khám bệnh");
      }

      setSaveMessage("Hoàn thành khám bệnh thành công!");

      // Sau khi lưu thành công, gọi onFinish để cập nhật status
      const examData = {
        ...patient,
        ...form,
        completed_at: new Date().toISOString(),
      };

      onFinish?.(examData);
    } catch (error) {
      console.error("Error saving exam data:", error);
      setSaveMessage("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSaveTemp = async () => {
    // Không cần validation nghiêm ngặt khi lưu tạm
    setLoading(true);
    setSaveMessage("");

    try {
      // Kiểm tra appointment_id
      const appointmentId = patient?.appointment_id;
      if (!appointmentId) {
        throw new Error("Không tìm thấy appointment_id của bệnh nhân");
      }

      console.log("Saving temporary exam data for appointment:", appointmentId);

      // Gọi API lưu tạm dữ liệu khám bệnh
      const token = localStorage.getItem("token");

      // Chuyển đổi đối tượng vitalSigns thành chuỗi để tránh lỗi validation
      const vitalString = `Huyết áp: ${
        form.vitalSigns.bloodPressure || "N/A"
      }, Nhiệt độ: ${form.vitalSigns.temperature || "N/A"}°C, Nhịp tim: ${
        form.vitalSigns.heartRate || "N/A"
      }/phút, Nhịp thở: ${form.vitalSigns.respiratoryRate || "N/A"}/phút`;

      // Lấy arv_regimen_id nếu đã chọn phác đồ
      let arvRegimenId = null;
      if (form.treatmentOption === "change" && form.selectedRegimen) {
        const selectedRegimenObj = regimens.find(
          (r) => r.name === form.selectedRegimen
        );
        if (selectedRegimenObj) {
          arvRegimenId = selectedRegimenObj.arv_regimen_id;
        }
      }

      const requestData = {
        appointment_id: appointmentId,
        diagnosis: form.diagnosis || "Đang khám...",
        diagnosis_secondary: form.diagnosisSecondary,
        treatment_plan: form.treatmentPlan,
        note: form.note,
        reExamDate: form.reExamDate,
        vitals: vitalString,
        weight: form.measurements.weight,
        height: form.measurements.height,
        bmi: form.measurements.bmi,
        clinical_signs: form.clinical_signs,
        testRequests: form.testRequests,
        arv_regimen_id: arvRegimenId,
        prescription_details:
          form.treatmentOption === "change" ? form.prescriptionDetails : [],
      };

      console.log("Sending temp exam data:", requestData);
      const response = await fetch(
        "http://localhost:5000/api/v1/doctor/save-exam-data-temp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();
      console.log("Save temp result:", result);

      if (!response.ok) {
        throw new Error(result.message || "Lỗi khi lưu tạm dữ liệu khám bệnh");
      }

      console.log("Temporary exam data saved successfully");

      // Gọi callback nếu có
      const examData = {
        ...patient,
        ...form,
        saved_at: new Date().toISOString(),
      };

      onSaveTemp?.(examData);
    } catch (error) {
      console.error("Error saving temporary exam data:", error);
      setSaveMessage("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleMedicationChange = (index, field, value) => {
    setForm((prev) => {
      const updatedMedications = [...prev.medications];
      updatedMedications[index] = {
        ...updatedMedications[index],
        [field]: value,
      };

      // Cập nhật prescriptionDetails từ medications
      const updatedPrescriptionDetails = updatedMedications.map((med) => ({
        drug_name: med.drug_name,
        dosage: med.dosage,
        quantity: med.quantity || med.default_quantity,
        frequency: med.frequency || med.default_frequency,
        duration_days: med.duration_days || med.default_duration,
        usage_instructions: "Uống thuốc đúng giờ, đủ liều",
        notes: med.notes || "",
      }));

      return {
        ...prev,
        medications: updatedMedications,
        prescriptionDetails: updatedPrescriptionDetails,
      };
    });
  };
  return (
    <div>
      {/* Chỉ số sinh tồn */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Chỉ số sinh tồn</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Huyết áp (mmHg)
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
              name="vitalSigns.bloodPressure"
              value={form.vitalSigns.bloodPressure}
              onChange={handleChange}
              placeholder="120/80"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Nhiệt độ (°C)
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
              name="vitalSigns.temperature"
              value={form.vitalSigns.temperature}
              onChange={handleChange}
              placeholder="36.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Nhịp tim (lần/phút)
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
              name="vitalSigns.heartRate"
              value={form.vitalSigns.heartRate}
              onChange={handleChange}
              placeholder="72"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Chiều cao (cm)
            </label>
            <input
              type="number"
              className="w-full border rounded p-2"
              name="measurements.height"
              value={form.measurements.height}
              onChange={handleChange}
              placeholder="170"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Cân nặng (kg)
            </label>
            <input
              type="number"
              className="w-full border rounded p-2"
              name="measurements.weight"
              value={form.measurements.weight}
              onChange={handleChange}
              placeholder="65"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">BMI</label>
            <input
              type="text"
              className="w-full border rounded p-2 bg-gray-50"
              name="measurements.bmi"
              value={form.measurements.bmi}
              readOnly
              placeholder="Tự động tính"
            />
          </div>
        </div>
      </div>
      {/* Chỉ định xét nghiệm */}
      <div className="bg-blue-50 rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Chỉ định xét nghiệm</h3>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="testRequests.screening"
                checked={form.testRequests.screening}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>HIV sàng lọc</span>
              <span className="text-xs text-gray-500">
                (Xét nghiệm sàng lọc HIV)
              </span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="testRequests.viralLoad"
                checked={form.testRequests.viralLoad}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>Tải lượng virus HIV</span>
              <span className="text-xs text-gray-500">
                (Xét nghiệm tải lượng virus trong máu)
              </span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="testRequests.cd4"
                checked={form.testRequests.cd4}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>Tế bào CD4</span>
              <span className="text-xs text-gray-500">
                (Đánh giá tình trạng hệ miễn dịch)
              </span>
            </label>
          </div>
        </div>
      </div>
      {/* Chẩn đoán và kế hoạch điều trị */}{" "}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">
          Chẩn đoán và kế hoạch điều trị
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Chẩn đoán chính *
          </label>
          <textarea
            className="w-full border rounded p-2"
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            placeholder="Chẩn đoán chi tiết..."
            rows={2}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Chẩn đoán phụ (nếu có)
          </label>
          <textarea
            className="w-full border rounded p-2"
            name="diagnosisSecondary"
            value={form.diagnosisSecondary}
            onChange={handleChange}
            placeholder="Nhập chẩn đoán phụ nếu có..."
            rows={2}
          />
        </div>{" "}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Kế hoạch điều trị
          </label>
          <div className="mb-3">
            <select
              className={`w-full border rounded p-2 ${
                errors.treatmentOption ? "border-red-500" : ""
              }`}
              name="treatmentOption"
              value={form.treatmentOption}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  treatmentOption: e.target.value,
                }));
              }}
            >
              <option value="continue">Tiếp tục phác đồ</option>
              <option value="change">Thay đổi phác đồ</option>
            </select>
          </div>

          {form.treatmentOption === "continue" ? (
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-700">
                {patient?.phac_do
                  ? `Tiếp tục phác đồ ${patient.phac_do}`
                  : "Tiếp tục phác đồ hiện tại"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Chọn phác đồ điều trị *
                </label>{" "}
                <select
                  className={`w-full border rounded p-2 ${
                    errors.selectedRegimen ? "border-red-500" : ""
                  }`}
                  name="selectedRegimen"
                  value={form.selectedRegimen}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      selectedRegimen: e.target.value,
                    }));

                    // Fetch medications for the selected regimen
                    if (e.target.value) {
                      const fetchMedications = async () => {
                        try {
                          // Find regimen_id based on the selected regimen name
                          const selectedRegimenObj = regimens.find(
                            (r) => r.name === e.target.value
                          );

                          if (selectedRegimenObj) {
                            const response = await axios.get(
                              `http://localhost:5000/api/v1/doctor/arv-medications/${selectedRegimenObj.arv_regimen_id}`
                            );
                            if (response.data.success && response.data.data) {
                              setForm((prev) => ({
                                ...prev,
                                medications: response.data.data,
                              }));
                            }
                          }
                        } catch (error) {
                          console.error("Error fetching medications:", error);
                        }
                      };

                      fetchMedications();
                    }
                  }}
                >
                  <option value="">-- Chọn phác đồ --</option>
                  {regimens.map((regimen) => (
                    <option key={regimen.arv_regimen_id} value={regimen.name}>
                      {regimen.name} (
                      {regimen.components &&
                      regimen.components.split("+").length > 1
                        ? regimen.components
                            .split("+")
                            .map((c) => c.split(" ")[0].trim())
                            .join("/")
                        : regimen.components}
                      )
                    </option>
                  ))}
                  {regimens.length === 0 && (
                    <>
                      <option value="TDF/3TC/RPV">
                        TDF/3TC/RPV (Tenofovir/Emtricitabine/Rilpivirine)
                      </option>
                      <option value="ABC/3TC/DTG">
                        ABC/3TC/DTG (Abacavir/Lamivudine/Dolutegravir)
                      </option>
                      <option value="TDF/3TC/DTG">
                        TDF/3TC/DTG (Tenofovir/Lamivudine/Dolutegravir)
                      </option>
                      <option value="AZT/3TC/LPV/r">
                        AZT/3TC/LPV/r
                        (Zidovudine/Lamivudine/Lopinavir/ritonavir)
                      </option>
                    </>
                  )}
                </select>
                {errors.selectedRegimen && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.selectedRegimen}
                  </div>
                )}
              </div>

              {form.selectedRegimen && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Phác đồ {form.selectedRegimen}
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    {form.selectedRegimen === "TDF/3TC/RPV" &&
                      "Phác đồ thay thế 1 cho người có tải lượng virus thấp"}
                    {form.selectedRegimen === "ABC/3TC/DTG" &&
                      "Phác đồ ưu tiên cho người không dung nạp TDF"}
                    {form.selectedRegimen === "TDF/3TC/DTG" &&
                      "Phác đồ ưu tiên cho người mới bắt đầu điều trị"}
                    {form.selectedRegimen === "AZT/3TC/LPV/r" &&
                      "Phác đồ điều trị cho trẻ em và người kháng thuốc"}
                  </p>{" "}
                  <div className="border-t border-blue-200 pt-2">
                    {" "}
                    <div className="grid grid-cols-4 gap-2 text-sm font-medium text-blue-900 mb-1">
                      <div>Tên thuốc</div>
                      <div>Số lượng</div>
                      <div>Tần suất</div>
                      <div>Thời gian (ngày)</div>
                    </div>
                    {form.medications && form.medications.length > 0 ? (
                      form.medications.map((medication, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-blue-100"
                        >
                          <div>
                            {medication.drug_name} {medication.dosage}
                          </div>
                          <div>
                            <input
                              type="number"
                              className="w-full border rounded p-1 text-sm"
                              value={
                                medication.quantity ||
                                medication.default_quantity
                              }
                              onChange={(e) =>
                                handleMedicationChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              min="1"
                            />
                          </div>
                          <div>
                            <select
                              className="w-full border rounded p-1 text-sm"
                              value={
                                medication.frequency ||
                                medication.default_frequency
                              }
                              onChange={(e) =>
                                handleMedicationChange(
                                  index,
                                  "frequency",
                                  e.target.value
                                )
                              }
                            >
                              <option value="1 lần/ngày">1 lần/ngày</option>
                              <option value="2 lần/ngày">2 lần/ngày</option>
                              <option value="3 lần/ngày">3 lần/ngày</option>
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              className="w-full border rounded p-1 text-sm"
                              value={
                                medication.duration_days ||
                                medication.default_duration
                              }
                              onChange={(e) =>
                                handleMedicationChange(
                                  index,
                                  "duration_days",
                                  e.target.value
                                )
                              }
                              min="1"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Không có thông tin thuốc cho phác đồ này
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>{" "}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Triệu chứng lâm sàng
          </label>
          <textarea
            className="w-full border rounded p-2"
            name="clinical_signs"
            value={form.clinical_signs}
            onChange={handleChange}
            placeholder="Ghi nhận các triệu chứng lâm sàng của bệnh nhân..."
            rows={3}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Ghi chú điều trị
          </label>
          <textarea
            className="w-full border rounded p-2"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Ghi chú thêm về điều trị, chế độ ăn uống, tập thể dục..."
            rows={3}
          />
        </div>
      </div>
      {/* Save Message */}
      {saveMessage && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            saveMessage.includes("Lỗi")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {saveMessage}
        </div>
      )}
      <div className="flex gap-4 justify-end mt-8">
        <button
          className="bg-white border border-gray-300 px-6 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-gray-100 disabled:opacity-50"
          onClick={handleSaveTemp}
          disabled={loading}
        >
          <FileText className="w-5 h-5" />
          {loading ? "Đang lưu..." : "Lưu tạm"}
        </button>
        <button
          className="bg-gray-900 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-gray-800 disabled:opacity-50"
          onClick={handleFinish}
          disabled={loading}
        >
          <CheckCircle className="w-5 h-5" />
          {loading ? "Đang xử lý..." : "Hoàn thành khám"}
        </button>
      </div>
    </div>
  );
};

export default ExamForm;
