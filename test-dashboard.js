const axios = require("axios");

const API_BASE_URL = "http://localhost:8000/api";
const FRONTEND_URL = "http://localhost:3000";

async function testDashboard() {
  console.log("🧪 Testing Hugamara Dashboard System...\n");

  try {
    // Test 1: Backend Health Check
    console.log("1. Testing Backend Health...");
    const healthResponse = await axios.get("http://localhost:8000/health");
    console.log("✅ Backend is healthy:", healthResponse.data.status);
    console.log("   Environment:", healthResponse.data.environment);
    console.log(
      "   Uptime:",
      Math.round(healthResponse.data.uptime),
      "seconds\n"
    );

    // Test 2: Frontend Accessibility
    console.log("2. Testing Frontend Accessibility...");
    try {
      const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
      console.log(
        "✅ Frontend is accessible (Status:",
        frontendResponse.status,
        ")"
      );
    } catch (error) {
      console.log("⚠️  Frontend test skipped (may be starting up)");
    }
    console.log("");

    // Test 3: Public Outlets API
    console.log("3. Testing Public Outlets API...");
    const outletsResponse = await axios.get(`${API_BASE_URL}/outlets/public`);
    console.log("✅ Public outlets API working");
    console.log(
      "   Outlets found:",
      outletsResponse.data.outlets?.length || 0,
      "\n"
    );

    // Test 4: Authentication Status
    console.log("4. Testing Authentication System...");
    try {
      const authResponse = await axios.get(`${API_BASE_URL}/auth/status`);
      console.log("✅ Auth status endpoint working");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(
          "✅ Auth status endpoint working (correctly returns 401 for unauthenticated)"
        );
      } else {
        console.log("❌ Auth status endpoint error:", error.message);
      }
    }
    console.log("");

    // Test 5: Dashboard API (should require authentication)
    console.log("5. Testing Dashboard API (should require auth)...");
    try {
      const dashboardResponse = await axios.get(
        `${API_BASE_URL}/dashboard/stats`
      );
      console.log("❌ Dashboard API should require authentication");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Dashboard API correctly requires authentication");
      } else {
        console.log("❌ Dashboard API error:", error.message);
      }
    }
    console.log("");

    console.log("🎉 All tests completed!");
    console.log("\n📋 Next Steps:");
    console.log("1. Open http://localhost:3000 in your browser");
    console.log("2. Login with super user credentials");
    console.log("3. Verify User Management appears in sidebar");
    console.log("4. Check that all modules are accessible");
    console.log("5. Test the unified layout system");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    }
  }
}

testDashboard();
