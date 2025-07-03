const axios = require("axios");

const baseURL = "http://127.0.0.1:5000/api/v1";

// Test data
const loginData = {
  username: "doctor01",
  password: "hash_doctor1_password",
};

const testData = {
  patientId: 1,
  appointmentId: 1,
};

async function loginAndGetToken() {
  try {
    console.log("🔐 Attempting to login...");
    console.log("Username:", loginData.username);
    console.log("Password:", loginData.password);

    const response = await axios.post(`${baseURL}/auth/login`, loginData);

    console.log("✅ Login successful!");
    console.log("Status:", response.status);
    console.log("Token received:", response.data.token ? "Yes" : "No");

    return response.data.token;
  } catch (error) {
    console.error("❌ Login failed:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Data:", error.response?.data);
    return null;
  }
}

async function testTestRequestsAPI(token) {
  console.log("\n=== TESTING TEST REQUESTS API ===\n");

  const apiClient = axios.create({
    baseURL: `${baseURL}/doctors`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  try {
    // 1. Test getAvailableTests
    console.log("1. Testing getAvailableTests...");
    const availableTestsResponse = await apiClient.get("/available-tests");
    console.log("✅ Available Tests Status:", availableTestsResponse.status);
    console.log(
      "✅ Available Tests Success:",
      availableTestsResponse.data.success
    );
    console.log(
      "✅ Available Tests Count:",
      availableTestsResponse.data.data?.length || 0
    );

    if (
      availableTestsResponse.data.data &&
      availableTestsResponse.data.data.length > 0
    ) {
      console.log("\n🧪 Available Tests:");
      availableTestsResponse.data.data.forEach((test, index) => {
        console.log(`${index + 1}. ${test.name}`);
        console.log(`   - ID: ${test.service_id}`);
        console.log(`   - Price: ${test.price} VND`);
        console.log(`   - Type: ${test.service_type}`);
        console.log(
          `   - Description: ${test.description || "No description"}`
        );
      });
    }

    // 2. Test getTestRequestsByPatient
    console.log("\n2. Testing getTestRequestsByPatient...");
    const testRequestsResponse = await apiClient.get(
      `/test-requests/${testData.patientId}`
    );
    console.log("✅ Test Requests Status:", testRequestsResponse.status);
    console.log("✅ Test Requests Success:", testRequestsResponse.data.success);
    console.log(
      "✅ Test Requests Count:",
      testRequestsResponse.data.data?.length || 0
    );

    if (
      testRequestsResponse.data.data &&
      testRequestsResponse.data.data.length > 0
    ) {
      console.log("\n📋 Test Requests Found:");
      testRequestsResponse.data.data.forEach((request, index) => {
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
              console.log(`      - ✅ HAS RESULT:`);
              console.log(
                `        Result: ${detail.result.result_value} ${
                  detail.result.unit || ""
                }`
              );
              console.log(
                `        Reference: ${detail.result.reference_range || "N/A"}`
              );
              console.log(
                `        Interpretation: ${
                  detail.result.interpretation || "N/A"
                }`
              );
              console.log(
                `        Result Date: ${detail.result.result_date || "N/A"}`
              );
              console.log(
                `        Result Notes: ${detail.result.result_notes || "N/A"}`
              );
            } else {
              console.log(`      - ❌ NO RESULT YET`);
            }
          });
        }
      });
    } else {
      console.log("No test requests found for this patient");
    }

    // 3. Test creating a new test request if we have available tests
    if (
      availableTestsResponse.data.data &&
      availableTestsResponse.data.data.length > 0
    ) {
      console.log("\n3. Testing createTestRequest...");
      const firstTest = availableTestsResponse.data.data[0];

      try {
        const createResponse = await apiClient.post(
          "/independent-test-requests",
          {
            appointment_id: testData.appointmentId,
            service_id: firstTest.service_id,
            notes: "Test request from API test script",
          }
        );

        console.log("✅ Create Test Request Status:", createResponse.status);
        console.log(
          "✅ Create Test Request Success:",
          createResponse.data.success
        );
        console.log(
          "✅ Created Request ID:",
          createResponse.data.data?.request_id || "N/A"
        );

        // Reload test requests to see the new one
        console.log("\n4. Reloading test requests to verify...");
        const reloadResponse = await apiClient.get(
          `/test-requests/${testData.patientId}`
        );
        console.log("✅ Reload Status:", reloadResponse.status);
        console.log(
          "✅ New Test Requests Count:",
          reloadResponse.data.data?.length || 0
        );
      } catch (createError) {
        console.error("❌ Error creating test request:");
        console.error("Status:", createError.response?.status);
        console.error(
          "Message:",
          createError.response?.data?.message || createError.message
        );
        console.error("Data:", createError.response?.data);
      }
    }

    console.log("\n" + "=".repeat(50));
  } catch (error) {
    console.error("❌ Error testing API:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Data:", error.response?.data);
  }
}

async function runAllTests() {
  console.log("🧪 Starting Test Requests API Tests...\n");

  // Step 1: Login and get token
  const token = await loginAndGetToken();

  if (!token) {
    console.log("❌ Cannot proceed without valid token");
    return;
  }

  // Step 2: Test APIs with the token
  await testTestRequestsAPI(token);

  console.log("\n✨ Tests completed!");
}

runAllTests().catch(console.error);
