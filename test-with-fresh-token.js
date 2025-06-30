const axios = require("axios");

const baseURL = "http://localhost:5000";

async function getAuthToken() {
  try {
    console.log("🔑 Getting auth token...");

    // Login để lấy token
    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: "doctor@hospital.com",
      password: "doctor123",
    });

    if (loginResponse.data.success && loginResponse.data.token) {
      console.log("✅ Login successful!");
      console.log("Token:", loginResponse.data.token);
      return loginResponse.data.token;
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    console.error("❌ Error getting auth token:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    return null;
  }
}

async function testWithFreshToken() {
  const token = await getAuthToken();

  if (!token) {
    console.log("Cannot proceed without valid token");
    return;
  }

  console.log("\n=== TESTING WITH FRESH TOKEN ===\n");

  const apiClient = axios.create({
    baseURL: `${baseURL}/api/v1/doctors`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  try {
    // Test available tests
    console.log("1. Testing getAvailableTests...");
    const testsResponse = await apiClient.get("/available-tests");
    console.log("✅ Available tests status:", testsResponse.status);
    console.log("✅ Tests count:", testsResponse.data.data?.length || 0);

    if (testsResponse.data.data && testsResponse.data.data.length > 0) {
      console.log("\n🧪 Available Tests:");
      testsResponse.data.data.forEach((test, index) => {
        console.log(
          `${index + 1}. ${test.name} (ID: ${test.service_id}) - ${
            test.price
          } VND`
        );
      });
    }

    // Test patient test requests
    console.log("\n2. Testing getTestRequestsByPatient...");
    const patientId = 1;
    const requestsResponse = await apiClient.get(`/test-requests/${patientId}`);
    console.log("✅ Test requests status:", requestsResponse.status);
    console.log("✅ Requests count:", requestsResponse.data.data?.length || 0);

    if (requestsResponse.data.data && requestsResponse.data.data.length > 0) {
      console.log("\n📋 Test Requests:");
      requestsResponse.data.data.forEach((request, index) => {
        console.log(`\nRequest ${index + 1}:`);
        console.log(`  - ID: ${request.request_id}`);
        console.log(`  - Status: ${request.status}`);
        console.log(
          `  - Date: ${new Date(request.request_date).toLocaleDateString(
            "vi-VN"
          )}`
        );
        console.log(`  - Doctor: ${request.doctor_name}`);

        if (request.details && request.details.length > 0) {
          request.details.forEach((detail, detailIndex) => {
            console.log(`    Test ${detailIndex + 1}: ${detail.service_name}`);

            if (detail.result) {
              console.log(
                `      ✅ Result: ${detail.result.result_value} ${
                  detail.result.unit || ""
                }`
              );
              if (detail.result.reference_range) {
                console.log(
                  `      📊 Reference: ${detail.result.reference_range}`
                );
              }
              if (detail.result.interpretation) {
                console.log(
                  `      💬 Interpretation: ${detail.result.interpretation}`
                );
              }
            } else {
              console.log(`      ⏳ Result: Pending`);
            }
          });
        }
      });
    } else {
      console.log("No test requests found for patient ID:", patientId);
    }
  } catch (error) {
    console.error("❌ Error in API test:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
  }
}

testWithFreshToken().catch(console.error);
