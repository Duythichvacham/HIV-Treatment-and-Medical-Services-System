// Test script để kiểm tra API getCurrent có load được dữ liệu đã lưu tạm
const API_BASE_URL = "http://localhost:5000";

async function login() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "doctor01",
        password: "hash_doctor1_password",
      }),
    });

    const result = await response.json();
    if (result.token) {
      console.log("✅ Login successful!");
      return result.token;
    } else {
      throw new Error("No token received");
    }
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error;
  }
}

async function testGetCurrentExam(token, patientId, appointmentId) {
  try {
    console.log(
      `\n🔍 Testing getCurrent API for patient ${patientId}, appointment ${appointmentId}...`
    );

    const response = await fetch(
      `${API_BASE_URL}/api/v1/doctors/current/${patientId}/${appointmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    console.log("📊 Status:", response.status);
    console.log("📋 Response:", JSON.stringify(result, null, 2));

    if (result.success && result.data?.exam_data) {
      console.log("\n🔍 Exam Data Details:");
      const examData = result.data.exam_data;

      console.log("📊 Vitals:", examData.vitals);
      console.log("📏 Weight:", examData.weight);
      console.log("📏 Height:", examData.height);
      console.log("📏 BMI:", examData.bmi);
      console.log("🏥 Clinical Signs:", examData.clinical_signs);
      console.log("🔬 Primary Diagnosis:", examData.diagnosis_primary);
      console.log("💊 ARV Regimen ID:", examData.arv_regimen_id);
      console.log("📝 Doctor Notes:", examData.doctor_notes);

      return result.data;
    } else {
      console.log("ℹ️ No exam data found");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting current exam:", error);
    return null;
  }
}

async function testSaveTempExam(token, appointmentId) {
  try {
    console.log(
      `\n💾 Testing saveTemp API for appointment ${appointmentId}...`
    );

    const testExamData = {
      vital_signs: {
        bloodPressure: "120/80",
        heartRate: "72",
        temperature: "36.5",
        weight: "65",
        height: "170",
        bmi: "22.5",
      },
      clinical_signs: "Test clinical signs - Bệnh nhân ổn định",
      diagnosis_primary: "Test diagnosis - HIV ổn định",
      diagnosis_secondary: "Test secondary diagnosis",
      prescription: {
        arv_regimen_id: 1,
        support_drugs: [],
        counseling_notes: "Test counseling notes",
        follow_up_plan: "Test follow up plan",
        doctor_notes: "Test doctor notes",
      },
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/doctors/save-temp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        appointment_id: appointmentId,
        exam_data: testExamData,
      }),
    });

    const result = await response.json();
    console.log("📊 Status:", response.status);
    console.log("📋 Response:", JSON.stringify(result, null, 2));

    return result.success;
  } catch (error) {
    console.error("❌ Error saving temp exam:", error);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Starting Exam API Tests...\n");

  try {
    // 1. Login
    const token = await login();

    // 2. Test với patient_id = 1, appointment_id = 1
    const patientId = 1;
    const appointmentId = 1;

    // 3. Kiểm tra exam data hiện tại trước khi save
    console.log("\n=== BEFORE SAVE ===");
    await testGetCurrentExam(token, patientId, appointmentId);

    // 4. Save temp exam data
    console.log("\n=== SAVING TEMP DATA ===");
    const saveSuccess = await testSaveTempExam(token, appointmentId);

    if (saveSuccess) {
      console.log("✅ Save temp successful!");

      // 5. Kiểm tra exam data sau khi save
      console.log("\n=== AFTER SAVE ===");
      await testGetCurrentExam(token, patientId, appointmentId);
    } else {
      console.log("❌ Save temp failed!");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }

  console.log("\n✨ Tests completed!");
}

// Run tests
runTests().catch(console.error);
