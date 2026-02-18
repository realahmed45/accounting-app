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
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
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
