import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only do a hard redirect if the user WAS logged in and got kicked out.
      // If there was no token to begin with, skip the redirect — otherwise
      // unauthenticated API calls (e.g. useSubscription on login page) cause
      // an infinite full-page reload loop.
      if (hadToken) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

// ==================== AUTH SERVICES ====================

export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.success) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.success) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentAccount");
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put("/auth/updatedetails", userData);
    if (response.data.success) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }
    return response.data;
  },

  verifyPassword: async (password) => {
    const response = await api.post("/auth/verify-password", { password });
    return response.data;
  },

  updatePassword: async (passwords) => {
    const response = await api.put("/auth/updatepassword", passwords);
    if (response.data.success) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },
};

// ==================== ACCOUNT SERVICES ====================

export const accountService = {
  getAll: async () => {
    const response = await api.get("/accounts");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  create: async (accountData) => {
    const response = await api.post("/accounts", accountData);
    return response.data;
  },

  update: async (id, accountData) => {
    const response = await api.put(`/accounts/${id}`, accountData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },

  getCategories: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}/categories`);
    return response.data;
  },

  createCategory: async (accountId, categoryData) => {
    const response = await api.post(
      `/accounts/${accountId}/categories`,
      categoryData,
    );
    return response.data;
  },

  updateCategory: async (accountId, categoryId, categoryData) => {
    const response = await api.put(
      `/accounts/${accountId}/categories/${categoryId}`,
      categoryData,
    );
    return response.data;
  },

  getPeople: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}/people`);
    return response.data;
  },

  createPerson: async (accountId, personData) => {
    const response = await api.post(
      `/accounts/${accountId}/people`,
      personData,
    );
    return response.data;
  },

  findByUniqueId: async (uniqueId) => {
    const response = await api.get(`/accounts/by-unique-id/${uniqueId}`);
    return response.data;
  },

  linkToParent: async (accountId, parentUniqueId) => {
    const response = await api.post(`/accounts/${accountId}/link-parent`, {
      parentUniqueId,
    });
    return response.data;
  },

  transferOwnership: async (
    accountId,
    targetAccountUniqueId,
    toWhatsApp,
    toTelegram,
  ) => {
    const response = await api.post(
      `/accounts/${accountId}/transfer-ownership`,
      {
        targetAccountUniqueId,
        toWhatsApp,
        toTelegram,
      },
    );
    return response.data;
  },

  getDailyActivity: async (accountId, params = {}) => {
    const response = await api.get(`/accounts/${accountId}/daily-activity`, {
      params,
    });
    return response.data;
  },
};

// ==================== BANK ACCOUNT SERVICES ====================

export const bankAccountService = {
  getAll: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}/bank-accounts`);
    return response.data;
  },

  create: async (accountId, data) => {
    const response = await api.post(
      `/accounts/${accountId}/bank-accounts`,
      data,
    );
    return response.data;
  },

  update: async (accountId, bankId, data) => {
    const response = await api.put(
      `/accounts/${accountId}/bank-accounts/${bankId}`,
      data,
    );
    return response.data;
  },

  delete: async (accountId, bankId) => {
    const response = await api.delete(
      `/accounts/${accountId}/bank-accounts/${bankId}`,
    );
    return response.data;
  },

  adjustBalance: async (accountId, bankId, newBalance, reason) => {
    const response = await api.post(
      `/accounts/${accountId}/bank-accounts/${bankId}/adjust`,
      { newBalance, reason },
    );
    return response.data;
  },
};

// ==================== WEEK SERVICES ====================

export const weekService = {
  create: async (weekData) => {
    const response = await api.post("/weeks", weekData);
    return response.data;
  },

  getByAccount: async (accountId) => {
    const response = await api.get(`/weeks/account/${accountId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/weeks/${id}`);
    return response.data;
  },

  update: async (id, weekData) => {
    const response = await api.put(`/weeks/${id}`, weekData);
    return response.data;
  },

  lock: async (id) => {
    const response = await api.put(`/weeks/${id}/lock`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/weeks/${id}`);
    return response.data;
  },

  transferBankToCash: async (weekId, transferData) => {
    const response = await api.post(
      `/weeks/${weekId}/transfer-bank-to-cash`,
      transferData,
    );
    return response.data;
  },

  addCash: async (weekId, amount, note) => {
    const response = await api.post(`/weeks/${weekId}/add-cash`, {
      amount,
      note,
    });
    return response.data;
  },
};

// ==================== EXPENSE SERVICES ====================

export const expenseService = {
  create: async (expenseData) => {
    const response = await api.post("/expenses", expenseData);
    return response.data;
  },

  getByWeek: async (weekId) => {
    const response = await api.get(`/expenses/week/${weekId}`);
    return response.data;
  },

  getByAccount: async (accountId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/expenses/account/${accountId}?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  update: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

// ==================== MEMBER SERVICES ====================

export const memberService = {
  getAll: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}/members`);
    return response.data;
  },

  getMe: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}/members/me`);
    return response.data;
  },

  add: async (accountId, data) => {
    const response = await api.post(`/accounts/${accountId}/members`, data);
    return response.data;
  },

  update: async (accountId, memberId, data) => {
    const response = await api.put(
      `/accounts/${accountId}/members/${memberId}`,
      data,
    );
    return response.data;
  },

  remove: async (accountId, memberId) => {
    const response = await api.delete(
      `/accounts/${accountId}/members/${memberId}`,
    );
    return response.data;
  },

  transferOwnership: async (accountId, data) => {
    // data: { toEmail, toWhatsApp, toTelegram }
    const response = await api.post(
      `/accounts/${accountId}/members/transfer-ownership`,
      data,
    );
    return response.data;
  },

  requestOwnershipCorrection: async (accountId, data) => {
    const response = await api.post(
      `/accounts/${accountId}/ownership-correction`,
      data,
    );
    return response.data;
  },

  getTransferStatus: async (accountId) => {
    const response = await api.get(
      `/accounts/${accountId}/ownership-transfer-status`,
    );
    return response.data;
  },

  getInvitations: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}/invitations`);
    return response.data;
  },

  cancelInvitation: async (accountId, invId) => {
    const response = await api.delete(
      `/accounts/${accountId}/invitations/${invId}`,
    );
    return response.data;
  },
};

// ==================== INVITATION SERVICES (public) ====================

export const invitationService = {
  getDetails: async (token) => {
    const response = await api.get(`/invitations/${token}`);
    return response.data;
  },

  accept: async (token, data) => {
    const response = await api.post(`/invitations/${token}/accept`, data);
    return response.data;
  },

  getAccountInvitations: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}/invitations`);
    return response.data;
  },

  cancelInvitation: async (accountId, invId) => {
    const response = await api.delete(
      `/accounts/${accountId}/invitations/${invId}`,
    );
    return response.data;
  },

  resend: async (invitationId) => {
    const response = await api.post("/invitations/resend", { invitationId });
    return response.data;
  },
};

// ==================== ACTIVITY SERVICES ====================

export const activityService = {
  getLog: async (accountId, { page = 1, limit = 50, action } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (action) params.set("action", action);
    const response = await api.get(`/accounts/${accountId}/activity?${params}`);
    return response.data;
  },
};

// ==================== PHOTO SERVICES ====================

export const photoService = {
  upload: async (expenseId, file) => {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await api.post(`/photos/upload/${expenseId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getByExpense: async (expenseId) => {
    const response = await api.get(`/photos/expense/${expenseId}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/photos/${id}`);
    return response.data;
  },
};

export default api;
