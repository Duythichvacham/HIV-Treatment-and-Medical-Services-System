// Test vitals parsing logic

const sampleVitals = [
  "Huyết áp: 120/80, Mạch: 72/phút, Nhiệt độ: 36.5°C",
  "Huyết áp: 130/85, Mạch: 78/phút, Nhiệt độ: 36.8°C",
  "Huyết áp: 140/90, Mạch: 80/phút, Nhiệt độ: 37.0°C",
  "Nhiệt độ: 37°C",
];

function parseVitals(vitalsStr) {
  let vitals = {};

  if (!vitalsStr) return vitals;

  try {
    // Try JSON parse first
    if (vitalsStr.startsWith("{")) {
      return JSON.parse(vitalsStr);
    }

    // Parse formatted string
    const bpMatch = vitalsStr.match(/Huyết áp:\s*([0-9/]+)/);
    const hrMatch = vitalsStr.match(/Mạch:\s*([0-9]+)/);
    const tempMatch = vitalsStr.match(/Nhiệt độ:\s*([0-9.]+)/);

    vitals = {
      bloodPressure: bpMatch ? bpMatch[1] : "",
      heartRate: hrMatch ? hrMatch[1] : "",
      temperature: tempMatch ? tempMatch[1] : "",
    };

    return vitals;
  } catch (e) {
    console.error("Error parsing vitals:", e);
    return {};
  }
}

console.log("🧪 Testing vitals parsing...\n");

sampleVitals.forEach((sample, index) => {
  console.log(`Test ${index + 1}:`);
  console.log(`Input: "${sample}"`);
  const parsed = parseVitals(sample);
  console.log(`Output:`, parsed);
  console.log(`Blood Pressure: ${parsed.bloodPressure || "N/A"}`);
  console.log(`Heart Rate: ${parsed.heartRate || "N/A"}`);
  console.log(`Temperature: ${parsed.temperature || "N/A"}`);
  console.log("---");
});
