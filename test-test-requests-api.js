const axios = require("axios");

const baseURL = "http://localhost:5000/api/v1/doctors";

// Test data
const testData = {
  patientId: 1,
  appointmentId: 1,
};

// Auth token (có thể cần update)
const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiZG9jdG9yIiwiaWF0IjoxNzM1OTc1NzgxfQ.i8p3aHpzCrGbvq4bxZaD6xXM4TqiCqgvLSqzsBvMr9Q";

const apiClient = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  },
});

async function testTestRequestsAPI() {
  console.log("=== TESTING TEST REQUESTS API ===\n");

  try {
    // 1. Test getTestRequestsByPatient
    console.log("1. Testing getTestRequestsByPatient...");
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
                `      - Result: ${detail.result.result_value} ${
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
            } else {
              console.log(`      - Result: Not available yet`);
            }
          });
        }
      });
    } else {
      console.log("No test requests found for this patient");
    }

    console.log("\n" + "=".repeat(50));
  } catch (error) {
    console.error("❌ Error testing API:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Data:", error.response?.data);
  }
}

async function testAvailableTests() {
  console.log("\n=== TESTING AVAILABLE TESTS API ===\n");

  try {
    console.log("Testing getAvailableTests...");
    const response = await apiClient.get("/available-tests");
    console.log("✅ Status:", response.status);
    console.log("✅ Success:", response.data.success);
    console.log("✅ Tests count:", response.data.data?.length || 0);

    if (response.data.data && response.data.data.length > 0) {
      console.log("\n🧪 Available Tests:");
      response.data.data.forEach((test, index) => {
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
  } catch (error) {
    console.error("❌ Error testing Available Tests API:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Data:", error.response?.data);
  }
}

async function runAllTests() {
  console.log("🧪 Starting Test Requests API Tests...\n");

  await testAvailableTests();
  await testTestRequestsAPI();

  console.log("\n✨ Tests completed!");
}

runAllTests().catch(console.error);
