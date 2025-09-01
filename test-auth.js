const axios = require("axios");

const API_BASE_URL = process.env.API_URL || "http://localhost:8000/api";

// Test data
const testCredentials = {
  email: "admin@hugamara.com",
  password: "password123",
  outletId: "550e8400-e29b-41d4-a716-446655440001", // Server Room
};

async function testAuth() {
  console.log("🧪 Testing Hugamara Authentication API\n");

  try {
    // Test 1: Health check
    console.log("1. Testing health endpoint...");
    const healthResponse = await axios.get(
      `${API_BASE_URL.replace("/api", "")}/health`
    );
    console.log("✅ Health check passed:", healthResponse.data);
    console.log("");

    // Test 2: Get outlets (public endpoint)
    console.log("2. Testing outlets endpoint...");
    const outletsResponse = await axios.get(`${API_BASE_URL}/outlets/public`);
    console.log(
      "✅ Outlets retrieved:",
      outletsResponse.data.outlets?.length || 0,
      "outlets"
    );
    console.log("");

    // Test 3: Login
    console.log("3. Testing login...");
    const loginResponse = await axios.post(
      `${API_BASE_URL}/auth/login`,
      testCredentials
    );
    console.log("✅ Login successful");
    console.log(
      "User:",
      loginResponse.data.user.firstName,
      loginResponse.data.user.lastName
    );
    console.log("Role:", loginResponse.data.user.role);
    console.log("Outlet:", loginResponse.data.user.outlet?.name);
    console.log("Token received:", !!loginResponse.data.token);
    console.log("");

    const token = loginResponse.data.token;

    // Test 4: Get current user
    console.log("4. Testing get current user...");
    const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Current user retrieved");
    console.log(
      "User:",
      userResponse.data.user.firstName,
      userResponse.data.user.lastName
    );
    console.log(
      "Permissions:",
      userResponse.data.user.permissions?.length || 0
    );
    console.log("");

    // Test 5: Test protected endpoint
    console.log("5. Testing protected endpoint (dashboard)...");
    const dashboardResponse = await axios.get(
      `${API_BASE_URL}/dashboard/stats`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Dashboard access successful");
    console.log("");

    // Test 6: Logout
    console.log("6. Testing logout...");
    const logoutResponse = await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Logout successful");
    console.log("");

    console.log("🎉 All authentication tests passed!");
    console.log("\n📋 Test Summary:");
    console.log("- Health check: ✅");
    console.log("- Outlets retrieval: ✅");
    console.log("- Login: ✅");
    console.log("- Current user: ✅");
    console.log("- Protected endpoint: ✅");
    console.log("- Logout: ✅");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

// Run the test
testAuth();
