import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, Mail, Lock, User, Phone, DollarSign, TrendingUp } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '8s' }}
        ></div>
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '4s' }}
        ></div>
        
        {/* Floating Icons for Aesthetic Flare */}
        <div className="absolute top-[15%] right-[15%] opacity-20 animate-float" style={{ animationDuration: '6s' }}>
          <DollarSign className="w-12 h-12 text-indigo-400" />
        </div>
        <div className="absolute bottom-[20%] left-[10%] opacity-10 animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}>
          <TrendingUp className="w-16 h-16 text-emerald-400" />
        </div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl animate-scaleIn">
            <span className="text-white text-3xl sm:text-4xl font-black">
              $
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 tracking-tight px-4">
            Weekly Accounting
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-medium px-4">
            {isLogin ? "👋 Welcome back!" : "🚀 Start your journey"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-6 sm:p-10 animate-scaleIn mx-3 sm:mx-0 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-50"></div>
          
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-8 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-3.5 rounded-xl font-black transition-all text-sm tracking-tight flex items-center justify-center gap-2 ${
                isLogin
                  ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LogIn className="w-4 h-4" />
              LOGIN
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
                setShowPlanSelection(false);
              }}
              className={`flex-1 py-3.5 rounded-xl font-black transition-all text-sm tracking-tight flex items-center justify-center gap-2 ${
                !isLogin
                  ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              CREATE ACCOUNT
            </button>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-widest animate-slideDown flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 flex-shrink-0">!</span>
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="input-group-premium">
                <label className="input-label-premium flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="input-premium"
                  placeholder="name@company.com"
                  autoComplete="email"
                />
              </div>

              <div className="input-group-premium">
                <label className="input-label-premium flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="input-premium"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-sm font-black tracking-widest uppercase mt-4 hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(99,102,241,0.3)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    AUTHENTICATING...
                  </span>
                ) : (
                  "SIGN IN TO HUB"
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group-premium">
                  <label className="input-label-premium">
                    First Name
                  </label>
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
                    className="input-premium"
                    placeholder="John"
                    autoComplete="given-name"
                  />
                </div>

                <div className="input-group-premium">
                  <label className="input-label-premium">
                    Family Name
                  </label>
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
                    className="input-premium"
                    placeholder="Doe"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="input-group-premium">
                <label className="input-label-premium flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </label>
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
                  className="input-premium"
                  placeholder="name@company.com"
                  autoComplete="email"
                />
              </div>

              <div className="input-group-premium">
                <label className="input-label-premium flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  Phone Number 
                  <span className="text-[10px] text-slate-500 font-normal lowercase ml-auto">
                    (Optional)
                  </span>
                </label>
                <input
                  type="tel"
                  value={registerData.phoneNumber}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="input-premium"
                  placeholder="+1 (555) 000-0000"
                  autoComplete="tel"
                />
              </div>

              <div className="input-group-premium">
                <label className="input-label-premium flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  Password
                </label>
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
                  className="input-premium"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-sm font-black tracking-widest uppercase mt-4 hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(99,102,241,0.3)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    PREPARING...
                  </span>
                ) : (
                  "SELECT PLAN & REGISTER →"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-300 text-xs sm:text-sm mt-6 sm:mt-8 font-medium px-4">
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
