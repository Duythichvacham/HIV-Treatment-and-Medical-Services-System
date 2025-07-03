import React, { useState, useEffect, useCallback } from "react";
import { Pill, Plus, X, AlertTriangle, AlertCircle } from "lucide-react";
import { arvRegimenApi } from "../../../services/arvRegimenApi";

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
  const [treatmentOption, setTreatmentOption] = useState("continue");
  const [selectedRegimen, setSelectedRegimen] = useState("");
  const [regimenMedications, setRegimenMedications] = useState([]);
  const [showAddDrug, setShowAddDrug] = useState(false);
  const [availableRegimens, setAvailableRegimens] = useState([]);

  // Fetch ARV regimens from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching ARV regimens...");
        const regimensResponse = await arvRegimenApi.getAll();
        console.log("ARV regimens response:", regimensResponse);

        if (regimensResponse.success && regimensResponse.data) {
          console.log("Setting available regimens:", regimensResponse.data);
          setAvailableRegimens(regimensResponse.data);
        } else {
          console.log("No success in response, using fallback");
          setAvailableRegimens(arvRegimens || []);
        }
      } catch (error) {
        console.error("Error fetching ARV regimens:", error);
        // Fallback to props data if available
        console.log("Using fallback regimens:", arvRegimens);
        setAvailableRegimens(arvRegimens || []);
      }
    };

    fetchData();
  }, [arvRegimens]);

  // Helper function to parse components into medications
  const getMedicationsFromComponents = useCallback((components) => {
    if (!components) return [];

    console.log("Parsing components:", components);

    // Split components by "+" and clean up
    const drugComponents = components.split("+").map((drug) => drug.trim());
    console.log("Drug components:", drugComponents);

    // Parse each drug component
    return drugComponents.map((drugComponent, index) => {
      console.log(`Processing drug component ${index + 1}:`, drugComponent);

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
        quantity: "30",
        frequency: "1 lần/ngày",
        duration_days: "30",
        usage_instructions: "",
        notes: "",
      };
      console.log(`Parsed drug ${index + 1}:`, result);
      return result;
    });
  }, []);

  // Helper function to get medications for a regimen
  const getMedicationsForRegimen = useCallback(
    (regimenId) => {
      console.log(
        "getMedicationsForRegimen called with regimenId:",
        regimenId,
        typeof regimenId
      );
      console.log("Available regimens:", availableRegimens);

      // Find the regimen info - convert regimenId to number for comparison
      const regimen = availableRegimens.find(
        (r) => r.arv_regimen_id === parseInt(regimenId)
      );

      console.log("Found regimen:", regimen);

      if (!regimen) {
        console.log("No regimen found for ID:", regimenId);
        return [];
      }

      console.log("Regimen components:", regimen.components);

      // Parse components into medications
      const medications = getMedicationsFromComponents(regimen.components);
      console.log("Parsed medications:", medications);
      return medications;
    },
    [availableRegimens, getMedicationsFromComponents]
  );

  // Initialize treatment option based on current prescription
  useEffect(() => {
    if (prescription.arv_regimen_id) {
      setTreatmentOption("change");
      setSelectedRegimen(prescription.arv_regimen_id);
    } else {
      setTreatmentOption("continue");
    }
  }, [prescription.arv_regimen_id]);

  // Update regimen medications when selected regimen changes
  useEffect(() => {
    console.log("useEffect for regimen medications:", {
      selectedRegimen,
      treatmentOption,
      availableRegimens: availableRegimens.length,
    });

    if (selectedRegimen && treatmentOption === "change") {
      console.log("Calling getMedicationsForRegimen with:", selectedRegimen);
      const medications = getMedicationsForRegimen(selectedRegimen);
      console.log("Setting regimenMedications to:", medications);
      setRegimenMedications(medications);
    } else {
      console.log("Clearing regimenMedications");
      setRegimenMedications([]);
    }
  }, [
    selectedRegimen,
    treatmentOption,
    getMedicationsForRegimen,
    availableRegimens,
  ]);

  const handleTreatmentOptionChange = (option) => {
    setTreatmentOption(option);
    if (option === "continue") {
      setSelectedRegimen("");
      onUpdatePrescription({
        arv_regimen_id: null,
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

  const handleUpdateMedication = (index, field, value) => {
    if (readOnly) return;

    const updatedMedications = [...regimenMedications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };
    setRegimenMedications(updatedMedications);

    // Sync with parent component
    onUpdatePrescription({
      arv_medications: updatedMedications,
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

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Kế hoạch điều trị</h3>

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
            value={treatmentOption}
            onChange={(e) => {
              handleTreatmentOptionChange(e.target.value);
            }}
            disabled={readOnly}
          >
            <option value="continue">Tiếp tục phác đồ</option>
            <option value="change">Thay đổi phác đồ</option>
          </select>
        </div>

        {treatmentOption === "continue" ? (
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-gray-700">
              {currentARVRegimen?.name
                ? `Tiếp tục phác đồ ${currentARVRegimen.name}`
                : "Tiếp tục phác đồ hiện tại"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Chọn phác đồ điều trị *
              </label>

              <select
                className={`w-full border rounded p-2 ${
                  errors.arv_regimen_id ? "border-red-500" : ""
                }`}
                name="selectedRegimen"
                value={selectedRegimen}
                onChange={(e) => {
                  handleRegimenChange(e.target.value);
                }}
                disabled={readOnly}
              >
                <option value="">-- Chọn phác đồ --</option>
                {availableRegimens.map((regimen) => (
                  <option
                    key={regimen.arv_regimen_id}
                    value={regimen.arv_regimen_id}
                  >
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
              </select>
              {errors.arv_regimen_id && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.arv_regimen_id}
                </div>
              )}
            </div>

            {selectedRegimen && getSelectedRegimenInfo() && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  Phác đồ {getSelectedRegimenInfo().name}
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  {getSelectedRegimenInfo().for_group}
                </p>

                <div className="border-t border-blue-200 pt-2">
                  <div className="grid grid-cols-4 gap-2 text-sm font-medium text-blue-900 mb-1">
                    <div>Tên thuốc</div>
                    <div>Số lượng</div>
                    <div>Tần suất</div>
                    <div>Thời gian (ngày)</div>
                  </div>
                  {regimenMedications && regimenMedications.length > 0 ? (
                    regimenMedications.map((medication, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-blue-100"
                      >
                        <div>
                          <div className="font-medium">
                            {medication.drug_name}
                          </div>
                          <div className="text-xs text-gray-600">
                            Liều lượng: {medication.dosage || "300mg"}
                          </div>
                        </div>
                        <div>
                          <input
                            type="number"
                            className="w-full border rounded p-1 text-sm"
                            value={medication.quantity || "30"}
                            onChange={(e) =>
                              handleUpdateMedication(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            min="1"
                            disabled={readOnly}
                          />
                        </div>
                        <div>
                          <select
                            className="w-full border rounded p-1 text-sm"
                            value={medication.frequency || "1 lần/ngày"}
                            onChange={(e) =>
                              handleUpdateMedication(
                                index,
                                "frequency",
                                e.target.value
                              )
                            }
                            disabled={readOnly}
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
                            value={medication.duration_days || "30"}
                            onChange={(e) =>
                              handleUpdateMedication(
                                index,
                                "duration_days",
                                e.target.value
                              )
                            }
                            min="1"
                            disabled={readOnly}
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
      </div>

      {/* Support Drugs Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-800">Thuốc hỗ trợ</h4>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowAddDrug(!showAddDrug)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm thuốc
            </button>
          )}
        </div>

        {/* Add Drug Form */}
        {showAddDrug && !readOnly && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              Thêm thuốc hỗ trợ mới
            </h5>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const drugData = {
                  drug_name: formData.get("drug_name"),
                  dosage: formData.get("dosage"),
                  frequency: formData.get("frequency"),
                  duration_days: parseInt(formData.get("duration_days")) || 30,
                  usage_instructions: formData.get("usage_instructions"),
                  notes: formData.get("notes"),
                };
                onAddSupportDrug(drugData);
                e.target.reset();
                setShowAddDrug(false);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tên thuốc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="drug_name"
                    placeholder="VD: Vitamin B complex"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Liều lượng
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    placeholder="VD: 500mg"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tần suất
                  </label>
                  <input
                    type="text"
                    name="frequency"
                    placeholder="VD: 1 lần/ngày"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Thời gian (ngày)
                  </label>
                  <input
                    type="number"
                    name="duration_days"
                    placeholder="30"
                    min="1"
                    defaultValue="30"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Hướng dẫn sử dụng
                  </label>
                  <input
                    type="text"
                    name="usage_instructions"
                    placeholder="VD: Uống sau bữa ăn"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  placeholder="Ghi chú thêm về thuốc..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDrug(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Thêm thuốc
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Support Drugs List */}
        {prescription.support_drugs &&
          prescription.support_drugs.length > 0 && (
            <div className="space-y-3">
              {prescription.support_drugs.map((drug, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h6 className="font-medium text-gray-900 mb-1">
                        {drug.drug_name}
                        {drug.dosage && (
                          <span className="text-sm text-gray-600 ml-1">
                            ({drug.dosage})
                          </span>
                        )}
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">Tần suất:</span>{" "}
                          {drug.frequency || "Chưa xác định"}
                        </div>
                        <div>
                          <span className="font-medium">Thời gian:</span>{" "}
                          {drug.duration_days} ngày
                        </div>
                        {drug.usage_instructions && (
                          <div>
                            <span className="font-medium">Hướng dẫn:</span>{" "}
                            {drug.usage_instructions}
                          </div>
                        )}
                        {drug.notes && (
                          <div>
                            <span className="font-medium">Ghi chú:</span>{" "}
                            {drug.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    {!readOnly && (
                      <button
                        onClick={() => onRemoveSupportDrug(index)}
                        className="text-red-600 hover:text-red-800 ml-3"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        {(!prescription.support_drugs ||
          prescription.support_drugs.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Chưa có thuốc hỗ trợ nào được thêm</p>
          </div>
        )}
      </div>

      {/* Additional sections - counseling, follow-up, notes */}
      <div className="space-y-4 mt-6">
        {/* Counseling Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lời khuyên và tư vấn
          </label>
          <textarea
            value={prescription.counseling_notes || ""}
            onChange={(e) =>
              onUpdatePrescription({ counseling_notes: e.target.value })
            }
            placeholder="Nhập lời khuyên, tư vấn cho bệnh nhân về chế độ dùng thuốc, chế độ ăn uống, sinh hoạt..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            readOnly={readOnly}
          />
        </div>

        {/* Follow-up Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kế hoạch tái khám
          </label>
          <textarea
            value={prescription.follow_up_plan || ""}
            onChange={(e) =>
              onUpdatePrescription({ follow_up_plan: e.target.value })
            }
            placeholder="Lịch tái khám, xét nghiệm cần thực hiện trong lần khám tiếp theo..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            readOnly={readOnly}
          />
        </div>

        {/* Doctor Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú của bác sĩ
          </label>
          <textarea
            value={prescription.doctor_notes || ""}
            onChange={(e) =>
              onUpdatePrescription({ doctor_notes: e.target.value })
            }
            placeholder="Ghi chú riêng của bác sĩ về tình trạng bệnh nhân..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default Prescription;
