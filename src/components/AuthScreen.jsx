import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, Mail, Lock, User, Phone } from "lucide-react";

const AuthScreen = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setLoading(true);

    const result = await register(registerData);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-2xl mb-6 shadow-lg">
            <span className="text-white text-3xl font-bold">$</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            Weekly Accounting
          </h1>
          <p className="text-slate-600 mt-3 text-lg">
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                isLogin
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LogIn className="inline w-4 h-4 mr-2" />
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                !isLogin
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="inline w-4 h-4 mr-2" />
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Family Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={registerData.phoneNumber}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Minimum 6 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8 font-medium">
          Manage multiple accounts • Track expenses • Upload bill photos
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
