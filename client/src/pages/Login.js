import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Building2, Shield, Users, Clock } from "lucide-react";
import { login } from "../store/slices/authSlice";
import outletService from "../services/outletService";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    outletId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [outlets, setOutlets] = useState([]);
  const [loadingOutlets, setLoadingOutlets] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Fetch outlets from API
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await outletService.getAll();
        setOutlets(response.data.outlets || []);
      } catch (error) {
        console.error("Failed to fetch outlets:", error);
      } finally {
        setLoadingOutlets(false);
      }
    };

    fetchOutlets();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOutlet) {
      alert("Please select an outlet");
      return;
    }

    const loginData = {
      ...formData,
      outletId: selectedOutlet,
    };

    try {
      await dispatch(login(loginData)).unwrap();
      // Login successful - navigation will be handled by useEffect
    } catch (error) {
      console.error("Login failed:", error);
      // Error is already handled by the Redux slice
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Branding and Info */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            {/* Logo and Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-2xl shadow-2xl shadow-black/35 mb-6">
                <img
                  src="/hugamara-logo.png"
                  alt="Hugamara"
                  // White background
                  className="max-h-32 w-auto object-contain bg-white rounded-2xl"
                />
              </div>
              <h1 className="text-5xl font-bold text-[#046577]">HUGAMARA</h1>
              <p className="text-xl text-gray-600 font-medium">
                Hospitality Management System
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-8">
              <h3 className="text-lg font-semibold text-[#046577] mb-4">
                Enterprise Features
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-[#046577]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#046577]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Multi-Outlet Management
                    </p>
                    <p className="text-sm text-gray-600">
                      Centralized control for 6+ locations
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-[#046577]/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#046577]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Real-time Operations
                    </p>
                    <p className="text-sm text-gray-600">
                      Live updates and instant notifications
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-[#046577]/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#046577]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Enterprise Security
                    </p>
                    <p className="text-sm text-gray-600">
                      Role-based access and audit trails
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white border border-gray-200 shadow-2xl shadow-black/20 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#046577] mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to access your outlet dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {typeof error === "string"
                  ? error
                  : error?.message || "An error occurred"}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Outlet Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#046577]" />
                  <span>Select Outlet</span>
                </label>
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#046577] focus:border-[#046577] bg-white text-gray-900"
                  required
                  disabled={loadingOutlets}
                >
                  <option value="">
                    {loadingOutlets
                      ? "Loading outlets..."
                      : "Choose an outlet..."}
                  </option>
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name} ({outlet.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#046577] focus:border-[#046577] bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#046577] focus:border-[#046577] bg-white pr-12 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#046577] transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#046577] hover:bg-[#046577]/90 text-white font-medium py-3 px-4 rounded-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-black/25"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Having trouble? Contact your system administrator
                </p>
                <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span>Enterprise-grade security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
