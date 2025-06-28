// Validation functions for exam forms

export const validateVitalSigns = (vitalSigns) => {
  const errors = {};

  // Heart rate validation (50-120 bpm normal range)
  if (vitalSigns.heart_rate) {
    const heartRate = parseFloat(vitalSigns.heart_rate);
    if (isNaN(heartRate) || heartRate < 30 || heartRate > 200) {
      errors.heart_rate = "Nhịp tim phải từ 30-200 bpm";
    }
  }

  // Blood pressure validation (format: systolic/diastolic)
  if (vitalSigns.blood_pressure) {
    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    if (!bpRegex.test(vitalSigns.blood_pressure)) {
      errors.blood_pressure = "Huyết áp phải có định dạng: 120/80";
    } else {
      const [systolic, diastolic] = vitalSigns.blood_pressure
        .split("/")
        .map(Number);
      if (
        systolic < 70 ||
        systolic > 250 ||
        diastolic < 40 ||
        diastolic > 150
      ) {
        errors.blood_pressure = "Huyết áp không hợp lệ";
      }
    }
  }

  // Temperature validation (35-42°C)
  if (vitalSigns.temperature) {
    const temp = parseFloat(vitalSigns.temperature);
    if (isNaN(temp) || temp < 35 || temp > 42) {
      errors.temperature = "Nhiệt độ phải từ 35-42°C";
    }
  }

  // Weight validation (10-200kg)
  if (vitalSigns.weight) {
    const weight = parseFloat(vitalSigns.weight);
    if (isNaN(weight) || weight < 10 || weight > 200) {
      errors.weight = "Cân nặng phải từ 10-200kg";
    }
  }

  // Height validation (50-250cm)
  if (vitalSigns.height) {
    const height = parseFloat(vitalSigns.height);
    if (isNaN(height) || height < 50 || height > 250) {
      errors.height = "Chiều cao phải từ 50-250cm";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateDiagnosis = (diagnosis) => {
  const errors = {};

  if (!diagnosis.primary || diagnosis.primary.trim().length === 0) {
    errors.primary = "Chẩn đoán chính là bắt buộc";
  }

  if (diagnosis.primary && diagnosis.primary.length > 255) {
    errors.primary = "Chẩn đoán chính không được quá 255 ký tự";
  }

  if (diagnosis.secondary && diagnosis.secondary.length > 500) {
    errors.secondary = "Chẩn đoán phụ không được quá 500 ký tự";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validatePrescription = (prescription) => {
  const errors = {};

  // Validate support drugs
  if (prescription.support_drugs && prescription.support_drugs.length > 0) {
    prescription.support_drugs.forEach((drug, index) => {
      if (!drug.drug_name || drug.drug_name.trim().length === 0) {
        errors[`support_drugs.${index}.drug_name`] = "Tên thuốc là bắt buộc";
      }

      if (!drug.dosage || drug.dosage.trim().length === 0) {
        errors[`support_drugs.${index}.dosage`] = "Liều lượng là bắt buộc";
      }

      if (!drug.frequency || drug.frequency.trim().length === 0) {
        errors[`support_drugs.${index}.frequency`] =
          "Tần suất dùng là bắt buộc";
      }

      if (
        drug.duration_days &&
        (isNaN(drug.duration_days) || drug.duration_days < 1)
      ) {
        errors[`support_drugs.${index}.duration_days`] =
          "Số ngày dùng phải > 0";
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateExamCompletion = (examData) => {
  const errors = {};

  // Required fields for completion
  if (
    !examData.diagnosis_primary ||
    examData.diagnosis_primary.trim().length === 0
  ) {
    errors.diagnosis_primary = "Chẩn đoán chính là bắt buộc để hoàn thành khám";
  }

  if (!examData.vital_signs) {
    errors.vital_signs = "Sinh hiệu là bắt buộc để hoàn thành khám";
  } else {
    // At least some vital signs must be filled
    const hasVitalSigns = Object.values(examData.vital_signs).some(
      (value) => value && value.toString().trim().length > 0
    );
    if (!hasVitalSigns) {
      errors.vital_signs = "Phải nhập ít nhất một sinh hiệu để hoàn thành khám";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSearchTerm = (searchTerm) => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return { isValid: true, errors: {} };
  }

  const errors = {};

  if (searchTerm.length < 2) {
    errors.search = "Từ khóa tìm kiếm phải có ít nhất 2 ký tự";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateDateRange = (startDate, endDate) => {
  const errors = {};

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      errors.dateRange = "Ngày bắt đầu phải trước ngày kết thúc";
    }

    // Check if date range is not too far in the future
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);

    if (end > maxFutureDate) {
      errors.dateRange = "Ngày kết thúc không được quá 1 năm từ hiện tại";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
