import React, { useState, useEffect, useCallback } from "react";
import { Plus, AlertTriangle, AlertCircle } from "lucide-react";
import { arvRegimenApi } from "../../../services/arvRegimenApi";
import MedicationInputForm from "./MedicationInputForm";
import DrugDisplayCard from "./DrugDisplayCard";

const Prescription = ({
  prescription,
  arvRegimens,
  currentARVRegimen,
  onUpdatePrescription,
  onAddSupportDrug,
  onUpdateSupportDrug,
  onRemoveSupportDrug,
  errors = {},
  readOnly = false,
}) => {
  console.log("[PrescriptionNew] Component rendered with props:");
  console.log("- currentARVRegimen:", currentARVRegimen);
  console.log("- prescription:", prescription);

  const [treatmentOption, setTreatmentOption] = useState("continue");
  const [selectedRegimen, setSelectedRegimen] = useState("");
  const [regimenMedications, setRegimenMedications] = useState([]);
  const [currentArvMedications, setCurrentArvMedications] = useState([]);
  const [availableRegimens, setAvailableRegimens] = useState([]);

  // Medication Input Form state
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [medicationFormType, setMedicationFormType] = useState("support"); // "main" or "support"

  // Fetch ARV regimens from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const regimensResponse = await arvRegimenApi.getAll();

        if (regimensResponse.success && regimensResponse.data) {
          setAvailableRegimens(regimensResponse.data);
        } else {
          setAvailableRegimens(arvRegimens || []);
        }
      } catch (error) {
        console.error("Error fetching ARV regimens:", error);
        // Fallback to props data if available
        setAvailableRegimens(arvRegimens || []);
      }
    };

    fetchData();
  }, [arvRegimens]);

  // Helper function to parse components into medications
  const getMedicationsFromComponents = useCallback((components) => {
    if (!components) return [];

    // Split components by "+" and clean up
    const drugComponents = components.split("+").map((drug) => drug.trim());

    // Parse each drug component
    return drugComponents.map((drugComponent) => {
      // Extract drug name and dosage
      let drugName = drugComponent;
      let dosage = "300mg"; // default

      // Try to extract dosage pattern (e.g., "300mg", "600mg", "25mg")
      const parts = drugComponent.split(" ");
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].includes("mg")) {
          dosage = parts[i];
          // Các part trước đó là tên thuốc
          drugName = parts.slice(0, i).join(" ");
          break;
        }
      }

      // Nếu không tìm thấy mg, lấy tất cả làm tên thuốc
      if (!drugName) {
        drugName = drugComponent;
        dosage = "300mg"; // default
      }

      // Thêm viết tắt cho tên thuốc để giống mẫu
      const shortNames = {
        Tenofovir: "Tenofovir (TDF)",
        Lamivudine: "Lamivudine (3TC)",
        Efavirenz: "Efavirenz (EFV)",
        Rilpivirine: "Rilpivirine (RPV)",
        Abacavir: "Abacavir (ABC)",
        Dolutegravir: "Dolutegravir (DTG)",
      };

      const displayName = shortNames[drugName] || drugName;

      const result = {
        drug_name: displayName,
        dosage: dosage,
        frequency: "1 lần/ngày",
        duration_days: "30",
        usage_instructions: "Uống theo chỉ định của bác sĩ",
        notes: "",
        configured: false, // Track if this drug has been configured
      };
      return result;
    });
  }, []);

  // Helper function to get medications for a regimen
  const getMedicationsForRegimen = useCallback(
    (regimenId) => {
      // Find the regimen info - convert regimenId to number for comparison
      const regimen = availableRegimens.find(
        (r) => r.arv_regimen_id === parseInt(regimenId)
      );

      if (!regimen) {
        return [];
      }

      // Parse components into medications
      const medications = getMedicationsFromComponents(regimen.components);
      return medications;
    },
    [availableRegimens, getMedicationsFromComponents]
  );

  // Initialize current ARV medications when currentARVRegimen is available
  useEffect(() => {
    if (currentARVRegimen && treatmentOption === "continue") {
      const medications = getMedicationsFromComponents(
        currentARVRegimen.components
      );
      setCurrentArvMedications(medications);
    } else {
      setCurrentArvMedications([]);
    }
  }, [currentARVRegimen, treatmentOption, getMedicationsFromComponents]);

  // Initialize treatment option based on current prescription
  useEffect(() => {
    if (prescription.arv_regimen_id) {
      setTreatmentOption("change");
      setSelectedRegimen(prescription.arv_regimen_id);
    } else {
      setTreatmentOption("continue");
    }
  }, [prescription.arv_regimen_id]);

  // Auto-set ARV regimen ID when continuing with current regimen
  useEffect(() => {
    if (
      treatmentOption === "continue" &&
      currentARVRegimen?.arv_regimen_id &&
      !prescription.arv_regimen_id
    ) {
      console.log(
        "[PrescriptionNew] Auto-setting ARV regimen ID for continue option:",
        currentARVRegimen.arv_regimen_id
      );
      onUpdatePrescription({
        arv_regimen_id: currentARVRegimen.arv_regimen_id,
        regimen_type: "continue",
      });
    }
  }, [
    treatmentOption,
    currentARVRegimen,
    prescription.arv_regimen_id,
    onUpdatePrescription,
  ]);

  // Auto-update current ARV medications in prescription when continuing
  useEffect(() => {
    if (treatmentOption === "continue" && currentArvMedications.length > 0) {
      console.log(
        "[PrescriptionNew] Auto-updating current ARV medications in prescription:",
        currentArvMedications
      );
      onUpdatePrescription({
        current_arv_medications: currentArvMedications,
      });
    }
  }, [treatmentOption, currentArvMedications, onUpdatePrescription]);

  // Auto-update regimen medications in prescription when changing
  useEffect(() => {
    if (treatmentOption === "change" && regimenMedications.length > 0) {
      console.log(
        "[PrescriptionNew] Auto-updating regimen medications in prescription:",
        regimenMedications
      );
      onUpdatePrescription({
        arv_medications: regimenMedications,
      });
    }
  }, [treatmentOption, regimenMedications, onUpdatePrescription]);

  // Update regimen medications when selected regimen changes
  useEffect(() => {
    if (selectedRegimen && treatmentOption === "change") {
      const medications = getMedicationsForRegimen(selectedRegimen);
      setRegimenMedications(medications);
    } else {
      setRegimenMedications([]);
    }
  }, [
    selectedRegimen,
    treatmentOption,
    getMedicationsForRegimen,
    availableRegimens,
  ]);

  const handleTreatmentOptionChange = (option) => {
    console.log("[PrescriptionNew] handleTreatmentOptionChange:", option);
    console.log("[PrescriptionNew] currentARVRegimen:", currentARVRegimen);

    setTreatmentOption(option);
    if (option === "continue") {
      setSelectedRegimen("");
      // When continuing, use the current ARV regimen ID if available
      const currentRegimenId = currentARVRegimen?.arv_regimen_id || null;
      console.log(
        "[PrescriptionNew] Setting currentRegimenId:",
        currentRegimenId
      );

      onUpdatePrescription({
        arv_regimen_id: currentRegimenId,
        regimen_type: "continue",
      });
    } else {
      onUpdatePrescription({
        regimen_type: "change",
      });
    }
  };

  const handleRegimenChange = (regimenId) => {
    setSelectedRegimen(regimenId);
    onUpdatePrescription({
      arv_regimen_id: regimenId,
      regimen_type: "change",
    });
  };

  const getSelectedRegimenInfo = () => {
    if (treatmentOption === "change" && selectedRegimen) {
      return availableRegimens.find(
        (r) => r.arv_regimen_id === parseInt(selectedRegimen)
      );
    }
    return null;
  };

  // Handlers for MedicationInputForm
  const handleOpenMainDrugForm = (medication, index) => {
    setEditingMedication({ ...medication, index, type: "main" });
    setMedicationFormType("main");
    setShowMedicationForm(true);
  };

  const handleOpenCurrentArvDrugForm = (medication, index) => {
    setEditingMedication({ ...medication, index, type: "current_arv" });
    setMedicationFormType("main");
    setShowMedicationForm(true);
  };

  const handleOpenSupportDrugForm = (medication = null, index = null) => {
    setEditingMedication(
      medication ? { ...medication, index, type: "support" } : null
    );
    setMedicationFormType("support");
    setShowMedicationForm(true);
  };

  const handleSaveMedication = (medicationData) => {
    if (medicationFormType === "main" && editingMedication) {
      if (editingMedication.type === "current_arv") {
        // Update current ARV drug
        const updatedMedications = [...currentArvMedications];
        updatedMedications[editingMedication.index] = {
          ...updatedMedications[editingMedication.index],
          ...medicationData,
          configured: true,
        };
        setCurrentArvMedications(updatedMedications);
        onUpdatePrescription({
          current_arv_medications: updatedMedications,
        });
      } else {
        // Update main drug from new regimen
        const updatedMedications = [...regimenMedications];
        updatedMedications[editingMedication.index] = {
          ...updatedMedications[editingMedication.index],
          ...medicationData,
          configured: true,
        };
        setRegimenMedications(updatedMedications);
        onUpdatePrescription({
          arv_medications: updatedMedications,
        });
      }
    } else if (medicationFormType === "support") {
      if (editingMedication && editingMedication.index !== null) {
        // Update support drug
        onUpdateSupportDrug(editingMedication.index, medicationData);
      } else {
        // Add new support drug
        onAddSupportDrug(medicationData);
      }
    }

    setShowMedicationForm(false);
    setEditingMedication(null);
  };

  const handleCloseMedicationForm = () => {
    setShowMedicationForm(false);
    setEditingMedication(null);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Kế hoạch điều trị</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lựa chọn điều trị
        </label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="treatment-option"
              value="continue"
              checked={treatmentOption === "continue"}
              onChange={(e) => handleTreatmentOptionChange(e.target.value)}
              disabled={readOnly}
              className="mr-2"
            />
            <span className="text-sm">Tiếp tục phác đồ hiện tại</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="treatment-option"
              value="change"
              checked={treatmentOption === "change"}
              onChange={(e) => handleTreatmentOptionChange(e.target.value)}
              disabled={readOnly}
              className="mr-2"
            />
            <span className="text-sm">Thay đổi phác đồ điều trị</span>
          </label>
        </div>
      </div>

      {/* Current ARV Regimen Info */}
      {treatmentOption === "continue" && currentARVRegimen && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-md font-semibold text-blue-800 mb-2">
            📋 Phác đồ hiện tại: {currentARVRegimen.name}
          </h4>
          <p className="text-sm text-blue-700 mb-4">
            {currentARVRegimen.components}
          </p>

          {/* Current ARV Drugs */}
          <h5 className="text-sm font-semibold text-blue-900 mb-3">
            Thuốc chính trong phác đồ:
          </h5>
          <div className="border-t border-blue-200 pt-2">
            <div className="space-y-3">
              {currentArvMedications && currentArvMedications.length > 0 ? (
                currentArvMedications.map((medication, index) => (
                  <DrugDisplayCard
                    key={index}
                    drug={medication}
                    index={index}
                    onEdit={handleOpenCurrentArvDrugForm}
                    type="main"
                    configured={medication.configured}
                    readOnly={readOnly}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  Đang tải thông tin thuốc...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ARV Regimen Selection */}
      {treatmentOption === "change" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn phác đồ ARV mới <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedRegimen}
            onChange={(e) => handleRegimenChange(e.target.value)}
            disabled={readOnly}
            className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.arv_regimen_id ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Chọn phác đồ ARV...</option>
            {availableRegimens.map((regimen) => (
              <option
                key={regimen.arv_regimen_id}
                value={regimen.arv_regimen_id}
              >
                {regimen.name} ({regimen.for_group})
              </option>
            ))}
          </select>
          {errors.arv_regimen_id && (
            <p className="text-red-500 text-xs mt-1">{errors.arv_regimen_id}</p>
          )}

          {/* Selected Regimen Details */}
          {selectedRegimen && getSelectedRegimenInfo() && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-md font-semibold text-blue-800 mb-2">
                📋 Phác đồ {getSelectedRegimenInfo().name}
              </h4>
              <p className="text-sm text-blue-700 mb-4">
                {getSelectedRegimenInfo().for_group}
              </p>

              <h5 className="text-sm font-semibold text-blue-900 mb-3">
                Thuốc chính trong phác đồ:
              </h5>

              <div className="border-t border-blue-200 pt-2">
                <div className="space-y-3">
                  {regimenMedications && regimenMedications.length > 0 ? (
                    regimenMedications.map((medication, index) => (
                      <DrugDisplayCard
                        key={index}
                        drug={medication}
                        index={index}
                        onEdit={handleOpenMainDrugForm}
                        type="main"
                        configured={medication.configured}
                        readOnly={readOnly}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Chưa có thuốc nào trong phác đồ
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Support Drugs Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-800">Thuốc hỗ trợ</h4>
          {!readOnly && (
            <button
              type="button"
              onClick={() => handleOpenSupportDrugForm()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm thuốc hỗ trợ
            </button>
          )}
        </div>

        {/* Support Drugs List */}
        <div className="space-y-3">
          {prescription.support_drugs &&
          prescription.support_drugs.length > 0 ? (
            prescription.support_drugs.map((drug, index) => (
              <DrugDisplayCard
                key={index}
                drug={drug}
                index={index}
                onEdit={handleOpenSupportDrugForm}
                onRemove={onRemoveSupportDrug}
                type="support"
                configured={true}
                readOnly={readOnly}
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              Chưa có thuốc hỗ trợ nào
            </p>
          )}
        </div>
      </div>

      {/* Prescription Notes */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lời khuyên và tư vấn <span className="text-red-500">*</span>
          </label>
          <textarea
            value={prescription.counseling_notes || ""}
            onChange={(e) =>
              onUpdatePrescription({ counseling_notes: e.target.value })
            }
            disabled={readOnly}
            placeholder="Nhập lời khuyên và tư vấn cho bệnh nhân..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.counseling_notes ? "border-red-500" : "border-gray-300"
            }`}
            rows="3"
          />
          {errors.counseling_notes && (
            <p className="text-red-500 text-xs mt-1">
              {errors.counseling_notes}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kế hoạch tái khám <span className="text-red-500">*</span>
          </label>
          <textarea
            value={prescription.follow_up_plan || ""}
            onChange={(e) =>
              onUpdatePrescription({ follow_up_plan: e.target.value })
            }
            disabled={readOnly}
            placeholder="Nhập kế hoạch tái khám..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.follow_up_plan ? "border-red-500" : "border-gray-300"
            }`}
            rows="3"
          />
          {errors.follow_up_plan && (
            <p className="text-red-500 text-xs mt-1">{errors.follow_up_plan}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú của bác sĩ <span className="text-red-500">*</span>
          </label>
          <textarea
            value={prescription.doctor_notes || ""}
            onChange={(e) =>
              onUpdatePrescription({ doctor_notes: e.target.value })
            }
            disabled={readOnly}
            placeholder="Ghi chú riêng của bác sĩ về tình trạng bệnh nhân..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.doctor_notes ? "border-red-500" : "border-gray-300"
            }`}
            rows="3"
          />
          {errors.doctor_notes && (
            <p className="text-red-500 text-xs mt-1">{errors.doctor_notes}</p>
          )}
        </div>
      </div>

      {/* Medication Input Form Modal */}
      <MedicationInputForm
        isOpen={showMedicationForm}
        onClose={handleCloseMedicationForm}
        onSave={handleSaveMedication}
        medication={editingMedication}
        isMainDrug={medicationFormType === "main"}
        title={
          medicationFormType === "main"
            ? "Cấu hình thuốc chính"
            : "Thông tin thuốc hỗ trợ"
        }
      />
    </div>
  );
};

export default Prescription;
