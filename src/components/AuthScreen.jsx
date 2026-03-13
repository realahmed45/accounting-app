import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, Mail, Lock, User, Phone, DollarSign, TrendingUp, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Neural Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '8s' }}
        ></div>
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] animate-spin-slow">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"></div>
        </div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-flex items-center justify-center p-1 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl mb-8 group overflow-hidden">
            <div className="relative p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] group-hover:scale-105 transition-transform duration-500">
               <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
               <span className="relative text-white text-4xl font-black italic tracking-tighter">
                W
              </span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-[-0.05em] px-4 uppercase italic">
            Neural<span className="text-indigo-500">Hub</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] px-4">
            {isLogin ? "Authorization Protocol" : "Network Integration"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-modal-content p-8 sm:p-12 animate-zoomIn mx-3 sm:mx-0 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          
          {/* Toggle Tabs */}
          <div className="flex p-1.5 bg-[#020617]/50 rounded-[1.5rem] border border-white/5 mb-10">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-4 rounded-xl font-black transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${
                isLogin
                  ? "bg-white/10 text-white shadow-xl"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Access
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
                setShowPlanSelection(false);
              }}
              className={`flex-1 py-4 rounded-xl font-black transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${
                !isLogin
                  ? "bg-white/10 text-white shadow-xl"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Integrate
            </button>
          </div>

          {error && (
            <div className="mb-10 p-6 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="input-group-premium">
                <label className="input-label-premium">Node Identifier (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="input-premium pl-16 py-5"
                    placeholder="user@nexus.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group-premium">
                <label className="input-label-premium">Security Pattern (Password)</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="input-premium pl-16 py-5"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-6 rounded-[2rem] font-black text-[12px] tracking-[0.4em] uppercase mt-4 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {loading ? "VERIFYING..." : "ACTIVATE LINK"}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="input-group-premium">
                  <label className="input-label-premium">Designation</label>
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
                    className="input-premium py-4"
                    placeholder="First"
                  />
                </div>

                <div className="input-group-premium">
                  <label className="input-label-premium">Alias</label>
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
                    className="input-premium py-4"
                    placeholder="Last"
                  />
                </div>
              </div>

              <div className="input-group-premium">
                <label className="input-label-premium">Network Handle (Email)</label>
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
                  className="input-premium py-4"
                  placeholder="user@nexus.com"
                />
              </div>

              <div className="input-group-premium">
                <label className="input-label-premium">Sync Key (Password)</label>
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
                  className="input-premium py-4"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-6 rounded-[2rem] font-black text-[12px] tracking-[0.4em] uppercase mt-4 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
                {loading ? "INITIATING..." : "CONFIGURE NODE →"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 space-y-4 px-4">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-white/5"></div>
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">
              Centralized Neural Asset Control
            </p>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <div className="flex justify-center gap-8">
            {[
              { icon: DollarSign, label: "Fiscal" },
              { icon: TrendingUp, label: "Analytics" },
              { icon: Phone, label: "Support" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest group cursor-default">
                <item.icon className="w-3 h-3 group-hover:text-indigo-400 transition-colors" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-screen Plan Selection Component */}
      {showPlanSelection && (
        <div className="fixed inset-0 z-[100] animate-fadeIn">
          <PlanSelectionScreen
            userEmail={registerData.email}
            onSelectPlan={handlePlanSelected}
            onSkip={() => handlePlanSelected("free")}
          />
        </div>
      )}
    </div>
  );
};

export default AuthScreen;
