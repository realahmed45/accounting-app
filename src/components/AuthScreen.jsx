import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, Mail, Lock, User, Phone } from "lucide-react";
import PlanSelectionScreen from "./PlanSelectionScreen";

const AuthScreen = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    familyName: "",
    phoneNumber: "",
    selectedPlan: "free",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(loginData);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Show full-screen plan selection
    setShowPlanSelection(true);
  };

  const handlePlanSelected = async (selectedPlan) => {
    setLoading(true);
    const result = await register({ ...registerData, selectedPlan });
    if (!result.success) {
      setError(result.message);
      setShowPlanSelection(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-2xl animate-scaleIn">
            <span className="text-white text-4xl font-black">$</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
            Weekly Accounting
          </h1>
          <p className="text-slate-300 text-lg font-medium">
            {isLogin ? "👋 Welcome back!" : "🚀 Start your journey"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-slideUp">
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-6 p-1.5 bg-slate-100 rounded-2xl">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-3.5 rounded-xl font-bold transition-all ${
                isLogin
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <LogIn className="inline w-5 h-5 mr-2" />
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
                setShowPlanSelection(false); // Reset plan selection when switching to register
              }}
              className={`flex-1 py-3.5 rounded-xl font-bold transition-all ${
                !isLogin
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <UserPlus className="inline w-5 h-5 mr-2" />
              Register
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl text-sm font-semibold animate-slideDown">
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="your@email.com"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-1">
                  💡 Use the email you registered with
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-1">
                  🔒 Your password is encrypted and secure
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Logging in...
                  </span>
                ) : (
                  "🚀 Login to Dashboard"
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={registerData.firstName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                      placeholder="John"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Family Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={registerData.familyName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          familyName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="your@email.com"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-1">
                  📧 We'll never share your email
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-600" />
                  Phone Number{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={registerData.phoneNumber}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-1">
                  🔑 Minimum 6 characters - make it strong!
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border-2 border-red-500 text-red-400 px-4 py-3 rounded-xl text-center font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Processing..." : "Continue to Plan Selection →"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-300 text-sm mt-8 font-medium">
          Manage multiple accounts • Track expenses • Upload bill photos
        </p>
      </div>

      {/* Full-screen Plan Selection Component */}
      {showPlanSelection && (
        <PlanSelectionScreen
          userEmail={registerData.email}
          onSelectPlan={handlePlanSelected}
          onSkip={() => handlePlanSelected("free")}
        />
      )}
    </div>
  );
};

export default AuthScreen;
