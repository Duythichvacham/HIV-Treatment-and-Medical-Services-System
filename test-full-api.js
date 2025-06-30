const axios = require("axios");

const baseURL = "http://localhost:5000/api/v1";

async function loginAndGetToken() {
  console.log("🔑 Attempting login...\n");

  try {
    // Login với doctor01 và password gốc là "doctor1_password"
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      username: "doctor01",
      password: "doctor1_password",
    });

    console.log("✅ Login successful!");
    console.log("Token:", loginResponse.data.token);
    console.log("User info:", loginResponse.data.user);

    return loginResponse.data.token;
  } catch (error) {
    console.error("❌ Login failed:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Data:", error.response?.data);
    return null;
  }
}

async function testTestRequestsAPI(authToken) {
  console.log("\n=== TESTING TEST REQUESTS API ===\n");

  const apiClient = axios.create({
    baseURL: baseURL + "/doctors",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });

  // Test data từ SampleData.sql
  const testData = {
    patientId: 1, // Nguyễn Văn An
    appointmentId: 1,
  };

  try {
    // 1. Test getAvailableTests
    console.log("1. Testing getAvailableTests...");
    const testsResponse = await apiClient.get("/available-tests");
    console.log("✅ Status:", testsResponse.status);
    console.log("✅ Success:", testsResponse.data.success);
    console.log("✅ Tests count:", testsResponse.data.data?.length || 0);

    if (testsResponse.data.data && testsResponse.data.data.length > 0) {
      console.log("\n🧪 Available Tests:");
      testsResponse.data.data.forEach((test, index) => {
        console.log(`${index + 1}. ${test.name}`);
        console.log(`   - ID: ${test.service_id}`);
        console.log(`   - Price: ${test.price} VND`);
        console.log(`   - Type: ${test.service_type}`);
        console.log(
          `   - Description: ${test.description || "No description"}`
        );
      });
    }

    console.log("\n" + "=".repeat(50));

    // 2. Test getTestRequestsByPatient
    console.log("\n2. Testing getTestRequestsByPatient...");
    const response = await apiClient.get(
      `/test-requests/${testData.patientId}`
    );
    console.log("✅ Status:", response.status);
    console.log("✅ Success:", response.data.success);
    console.log("✅ Data count:", response.data.data?.length || 0);

    if (response.data.data && response.data.data.length > 0) {
      console.log("\n📋 Test Requests Found:");
      response.data.data.forEach((request, index) => {
        console.log(`\nRequest ${index + 1}:`);
        console.log(`  - ID: ${request.request_id}`);
        console.log(`  - Status: ${request.status}`);
        console.log(`  - Date: ${request.request_date}`);
        console.log(`  - Doctor: ${request.doctor_name}`);
        console.log(`  - Tests count: ${request.details?.length || 0}`);

        if (request.details && request.details.length > 0) {
          request.details.forEach((detail, detailIndex) => {
            console.log(`    Test ${detailIndex + 1}: ${detail.service_name}`);
            console.log(`      - Price: ${detail.price}`);
            console.log(`      - Notes: ${detail.notes || "No notes"}`);

            // Check if has result
            if (detail.result) {
              console.log(
                `      - 🧪 Result: ${detail.result.result_value} ${
                  detail.result.unit || ""
                }`
              );
              console.log(
                `      - Reference: ${detail.result.reference_range || "N/A"}`
              );
              console.log(
                `      - Interpretation: ${
                  detail.result.interpretation || "N/A"
                }`
              );
              console.log(
                `      - Result Date: ${detail.result.result_date || "N/A"}`
              );
              console.log(
                `      - Result Notes: ${detail.result.result_notes || "N/A"}`
              );
            } else {
              console.log(`      - 🔍 Result: Not available yet`);
            }
          });
        }
      });
    } else {
      console.log("No test requests found for this patient");
    }

    console.log("\n" + "=".repeat(50));

    // 3. Test create new test request (nếu muốn)
    console.log("\n3. Testing createTestRequest...");

    // Chọn service đầu tiên từ available tests để test
    if (testsResponse.data.data && testsResponse.data.data.length > 0) {
      const firstTestService = testsResponse.data.data[0];
      console.log(
        `Creating test request for service: ${firstTestService.name}`
      );

      try {
        const createResponse = await apiClient.post(
          "/independent-test-requests",
          {
            appointment_id: testData.appointmentId,
            service_id: firstTestService.service_id,
            notes: "Test từ API script",
          }
        );

        console.log("✅ Create test request successful!");
        console.log("Response:", createResponse.data);

        // Reload test requests để xem kết quả
        console.log("\n4. Reloading test requests after creation...");
        const reloadResponse = await apiClient.get(
          `/test-requests/${testData.patientId}`
        );
        console.log(
          `✅ New test requests count: ${reloadResponse.data.data?.length || 0}`
        );
      } catch (createError) {
        console.log("❌ Failed to create test request:");
        console.log("Status:", createError.response?.status);
        console.log(
          "Message:",
          createError.response?.data?.message || createError.message
        );
        console.log("Data:", createError.response?.data);
      }
    }
  } catch (error) {
    console.error("❌ Error testing API:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Data:", error.response?.data);
  }
}

async function runFullTest() {
  console.log("🧪 Starting Full Test Requests API Test...\n");

  // 1. Login và lấy token
  const token = await loginAndGetToken();

  if (!token) {
    console.log("❌ Cannot proceed without valid token");
    return;
  }

  // 2. Test APIs
  await testTestRequestsAPI(token);

  console.log("\n✨ All tests completed!");
}

runFullTest().catch(console.error);
