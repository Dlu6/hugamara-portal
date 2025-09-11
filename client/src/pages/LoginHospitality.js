import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Building2,
  Shield,
  Users,
  Clock,
  Check,
  Phone,
  ExternalLink,
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
  const [failedLogoIds, setFailedLogoIds] = useState({});
  const [callCenterUrl, setCallCenterUrl] = useState(
    process.env.REACT_APP_CALL_CENTER_URL || "http://localhost:3002"
  ); // Default call center URL

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
        const regularOutlets = response.data.outlets || [];

        // Add call center as a special outlet
        const callCenterOutlet = {
          id: "callcenter",
          name: "Mayday ",
          code: "Call Center",
          type: "Call Center",
          logoUrl: "/logos/mayday.svg",
          isCallCenter: true,
        };

        setOutlets([callCenterOutlet, ...regularOutlets]);
      } catch (error) {
        console.error("Failed to fetch outlets:", error);
        // Even if API fails, show call center option
        const callCenterOutlet = {
          id: "callcenter",
          name: "Call Center",
          code: "CC",
          type: "Call Center",
          logoUrl: "/logos/mayday.svg",
          isCallCenter: true,
        };
        setOutlets([callCenterOutlet]);
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

    // Check if call center is selected
    if (selectedOutlet === "callcenter") {
      // Open call center in new tab - no email required
      window.open(callCenterUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // For regular outlets, validate email and password
    if (!formData.email || !formData.password) {
      alert("Please enter both email and password");
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

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const isSelectedOutlet = (id) => selectedOutlet === id;

  // Optional logos for known outlets under public/logos
  // Supported filenames (PNG/SVG): la-cueva, luna, the-patio-bella, maze, server-room, the-villa
  const outletLogosByCode = {
    LC: "/logos/lacuevogo.svg",
    LU: "/logos/luna.svg",
    MA: "/logos/maze.svg",
    PB: "/logos/patio.svg",
    CS: "/logos/server-room.svg",
    TV: "/logos/villa.svg",
  };
  const outletLogosBySlug = {
    "la-cueva": "/logos/lacuevogo.svg",
    luna: "/logos/luna.svg",
    maze: "/logos/maze.svg",
    "the-maze-bistro": "/logos/mazembuya.svg",
    patio: "/logos/patio.svg",
    "the-patio-bella": "/logos/patio.svg",
    "patio-bella": "/logos/patio.svg",
    "server-room": "/logos/server-room.svg",
    "the-villa": "/logos/villa.svg",
    "the-villa-ug": "/logos/villa.svg",
    villa: "/logos/villa.svg",
  };

  const slugify = (str = "") =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const getLogoForOutlet = (outlet) => {
    if (outlet.logoUrl) return outlet.logoUrl;
    const code = (outlet.code || "").toUpperCase();
    const slug = slugify(outlet.name || "");

    // Debug logging
    // console.log(`Outlet: ${outlet.name}, Code: ${code}, Slug: ${slug}`);
    // console.log(`Code match: ${outletLogosByCode[code]}, Slug match: ${outletLogosBySlug[slug]}`);

    return outletLogosByCode[code] || outletLogosBySlug[slug] || null;
  };

  const markLogoFailed = (id) =>
    setFailedLogoIds((prev) => ({ ...prev, [id]: true }));

  return (
    <>
      <style>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }

        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: rgb(209 213 219);
          border-radius: 0.5rem;
        }

        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
      `}</style>
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

              {selectedOutlet === "callcenter" && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-sm">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4" />
                    <span className="font-medium">Call Center Access</span>
                  </div>
                  <p className="mt-1">
                    No login required. Click "Open Mayday Call Center" to access
                    the call center dashboard directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Outlet Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-[#046577]" />
                    <span>Select Outlet</span>
                  </label>

                  {/* Parallax scrollable outlets list */}
                  <div className="relative h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-inner">
                    {/* Parallax background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#046577]/5 via-transparent to-[#046577]/5"></div>

                    {/* Scrollable container */}
                    <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                      <div className="space-y-2 p-4">
                        {outlets.map((outlet, index) => (
                          <button
                            key={outlet.id}
                            type="button"
                            onClick={() => setSelectedOutlet(outlet.id)}
                            className={`group relative w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                              isSelectedOutlet(outlet.id)
                                ? outlet.isCallCenter
                                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 scale-[1.02]"
                                  : "bg-[#046577] text-white shadow-lg shadow-[#046577]/25 scale-[1.02]"
                                : "bg-white/80 hover:bg-white text-gray-900 shadow-sm hover:shadow-md"
                            }`}
                            style={{
                              animationDelay: `${index * 100}ms`,
                              animation: `slideInFromLeft 0.6s ease-out forwards`,
                              opacity: 0,
                            }}
                            title={`${outlet.name} (${
                              outlet.code || outlet.type || "Outlet"
                            })${
                              outlet.isCallCenter ? " - Opens in new tab" : ""
                            }`}
                          >
                            {/* Logo container */}
                            <div
                              className={`relative w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg transition-all duration-300 ${
                                isSelectedOutlet(outlet.id)
                                  ? outlet.isCallCenter
                                    ? "bg-white/20 ring-2 ring-white/30"
                                    : "bg-white/20 ring-2 ring-white/30"
                                  : outlet.isCallCenter
                                  ? "bg-gradient-to-br from-orange-500 to-amber-600 ring-1 ring-orange-300"
                                  : "bg-gradient-to-br from-[#0f1f22] to-[#1a2a2d] ring-1 ring-gray-200"
                              }`}
                              style={{
                                filter:
                                  "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                              }}
                            >
                              {outlet.isCallCenter &&
                              (!getLogoForOutlet(outlet) ||
                                failedLogoIds[outlet.id]) ? (
                                <Phone className="w-8 h-8 text-white" />
                              ) : getLogoForOutlet(outlet) &&
                                !failedLogoIds[outlet.id] ? (
                                <img
                                  src={getLogoForOutlet(outlet)}
                                  alt={`${outlet.name} logo`}
                                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
                                  onError={() => markLogoFailed(outlet.id)}
                                />
                              ) : (
                                <span
                                  className={`text-2xl font-bold transition-colors duration-300 ${
                                    isSelectedOutlet(outlet.id)
                                      ? "text-white"
                                      : "text-white"
                                  }`}
                                >
                                  {getInitials(outlet.name)}
                                </span>
                              )}

                              {/* Animated ring */}
                              <div
                                className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                                  isSelectedOutlet(outlet.id)
                                    ? "ring-2 ring-white/40 animate-pulse"
                                    : "ring-1 ring-gray-300/50 group-hover:ring-2 group-hover:ring-[#046577]/30"
                                }`}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 px-2">
                              <div
                                className={`text-xl font-black transition-colors duration-300 leading-tight ${
                                  isSelectedOutlet(outlet.id)
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {outlet.name}
                              </div>
                              <div
                                className={`text-sm font-semibold transition-colors duration-300 mt-1 ${
                                  isSelectedOutlet(outlet.id)
                                    ? "text-white/90"
                                    : "text-gray-600"
                                }`}
                              >
                                {outlet.code || outlet.type || "OUTLET"}
                              </div>
                            </div>

                            {/* Selection indicator */}
                            {isSelectedOutlet(outlet.id) && (
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                                  {outlet.isCallCenter ? (
                                    <ExternalLink className="w-5 h-5 text-white" />
                                  ) : (
                                    <Check className="w-5 h-5 text-white" />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Hover effect overlay */}
                            <div
                              className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                                isSelectedOutlet(outlet.id)
                                  ? outlet.isCallCenter
                                    ? "bg-gradient-to-r from-purple-500/10 to-transparent opacity-100"
                                    : "bg-gradient-to-r from-[#046577]/10 to-transparent opacity-100"
                                  : outlet.isCallCenter
                                  ? "bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100"
                                  : "bg-gradient-to-r from-[#046577]/5 to-transparent opacity-0 group-hover:opacity-100"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scroll indicators */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <div className="w-1 h-8 bg-gray-300 rounded-full overflow-hidden">
                        <div className="w-full h-1/3 bg-[#046577] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Accessible fallback select (screen-reader only) */}
                  <div className="sr-only">
                    <label htmlFor="outlet-select-hidden">Outlet</label>
                    <select
                      id="outlet-select-hidden"
                      value={selectedOutlet}
                      onChange={(e) => setSelectedOutlet(e.target.value)}
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
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                    {selectedOutlet === "callcenter" && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Optional for Call Center)
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#046577] focus:border-[#046577] bg-white text-gray-900 placeholder-gray-500"
                    placeholder={
                      selectedOutlet === "callcenter"
                        ? "Enter your email (optional)"
                        : "Enter your email"
                    }
                    required={selectedOutlet !== "callcenter"}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                    {selectedOutlet === "callcenter" && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Optional for Call Center)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#046577] focus:border-[#046577] bg-white pr-12 text-gray-900 placeholder-gray-500"
                      placeholder={
                        selectedOutlet === "callcenter"
                          ? "Enter your password (optional)"
                          : "Enter your password"
                      }
                      required={selectedOutlet !== "callcenter"}
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
                  className={`w-full font-medium py-3 px-4 rounded-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-black/25 ${
                    selectedOutlet === "callcenter"
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                      : "bg-[#046577] hover:bg-[#046577]/90 text-white"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : selectedOutlet === "callcenter" ? (
                    <div className="flex items-center justify-center space-x-2">
                      <ExternalLink className="w-5 h-5" />
                      <span>Open Mayday Call Center</span>
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
    </>
  );
};

export default Login;
