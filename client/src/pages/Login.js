import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  Shield,
  Users,
  Clock,
} from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-primary-bg via-primary-bg/95 to-accent-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-primary/3 rounded-full blur-3xl"></div>
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-accent-primary/30" />
          </div>
        ))}
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Branding and Info */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            {/* Logo and Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl shadow-2xl shadow-accent-primary/25 mb-6 transform hover:scale-105 transition-transform duration-300">
                <Building2 className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-text-primary via-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Hugamara
              </h1>
              <p className="text-xl text-text-secondary font-medium">
                Hospitality Management System
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Enterprise Features
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Multi-Outlet Management
                    </p>
                    <p className="text-sm text-text-secondary">
                      Centralized control for 6+ locations
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="w-10 h-10 bg-accent-secondary/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-accent-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Real-time Operations
                    </p>
                    <p className="text-sm text-text-secondary">
                      Live updates and instant notifications
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Enterprise Security
                    </p>
                    <p className="text-sm text-text-secondary">
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
          <div className="card backdrop-blur-sm bg-white/5 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Welcome Back
              </h2>
              <p className="text-text-secondary">
                Sign in to access your outlet dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm backdrop-blur-sm">
                {typeof error === "string"
                  ? error
                  : error?.message || "An error occurred"}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Outlet Selection */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-accent-primary" />
                  <span>Select Outlet</span>
                </label>
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  className="form-input bg-white/5 border-white/20 focus:border-accent-primary focus:ring-accent-primary/20"
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
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input bg-white/5 border-white/20 focus:border-accent-primary focus:ring-accent-primary/20"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input bg-white/5 border-white/20 focus:border-accent-primary focus:ring-accent-primary/20 pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-accent-primary transition-colors duration-200"
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
                className="w-full btn-primary bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/90 hover:to-accent-secondary/90 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-accent-primary/25"
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
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-center space-y-3">
                <p className="text-sm text-text-secondary">
                  Having trouble? Contact your system administrator
                </p>
                <div className="flex items-center justify-center space-x-1 text-xs text-text-secondary/60">
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
