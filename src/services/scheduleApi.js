import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const shiftTypeService = {
  getAll: async (accountId) => {
    const res = await axios.get(`${API_URL}/accounts/${accountId}/schedule/shift-types`, getAuthHeader());
    return res.data;
  },
  create: async (accountId, data) => {
    const res = await axios.post(`${API_URL}/accounts/${accountId}/schedule/shift-types`, data, getAuthHeader());
    return res.data;
  },
  update: async (accountId, typeId, data) => {
    const res = await axios.put(`${API_URL}/accounts/${accountId}/schedule/shift-types/${typeId}`, data, getAuthHeader());
    return res.data;
  },
  remove: async (accountId, typeId) => {
    const res = await axios.delete(`${API_URL}/accounts/${accountId}/schedule/shift-types/${typeId}`, getAuthHeader());
    return res.data;
  },
};

export const shiftService = {
  getRange: async (accountId, params) => {
    const res = await axios.get(`${API_URL}/accounts/${accountId}/schedule/shifts`, {
      ...getAuthHeader(),
      params,
    });
    return res.data;
  },
  getMine: async (accountId) => {
    const res = await axios.get(`${API_URL}/accounts/${accountId}/schedule/shifts/my`, getAuthHeader());
    return res.data;
  },
  create: async (accountId, data) => {
    const res = await axios.post(`${API_URL}/accounts/${accountId}/schedule/shifts`, data, getAuthHeader());
    return res.data;
  },
  update: async (accountId, shiftId, data) => {
    const res = await axios.put(`${API_URL}/accounts/${accountId}/schedule/shifts/${shiftId}`, data, getAuthHeader());
    return res.data;
  },
  cancel: async (accountId, shiftId) => {
    const res = await axios.delete(`${API_URL}/accounts/${accountId}/schedule/shifts/${shiftId}`, getAuthHeader());
    return res.data;
  },
  assign: async (accountId, shiftId, memberId) => {
    const res = await axios.post(`${API_URL}/accounts/${accountId}/schedule/shifts/${shiftId}/assign`, { memberId }, getAuthHeader());
    return res.data;
  },
  checkIn: async (accountId, shiftId, data) => {
    const res = await axios.post(`${API_URL}/accounts/${accountId}/schedule/shifts/${shiftId}/checkin`, data, getAuthHeader());
    return res.data;
  },
  getCheckIn: async (accountId, shiftId) => {
    const res = await axios.get(`${API_URL}/accounts/${accountId}/schedule/shifts/${shiftId}/checkin`, getAuthHeader());
    return res.data;
  },
  checkOut: async (accountId, shiftId, data) => {
    const res = await axios.post(`${API_URL}/accounts/${accountId}/schedule/shifts/${shiftId}/checkout`, data, getAuthHeader());
    return res.data;
  },
  getCheckOut: async (accountId, shiftId) => {
    const res = await axios.get(`${API_URL}/accounts/${accountId}/schedule/shifts/${shiftId}/checkout`, getAuthHeader());
    return res.data;
  },
};

export const overtimeService = {
  getAll: async (accountId, params) => {
    const res = await axios.get(`${API_URL}/accounts/${accountId}/schedule/extra-hours`, {
      ...getAuthHeader(),
      params,
    });
    return res.data;
  },
  submit: async (accountId, data) => {
    const res = await axios.post(`${API_URL}/accounts/${accountId}/schedule/extra-hours`, data, getAuthHeader());
    return res.data;
  },
  review: async (accountId, ehId, data) => {
    const res = await axios.put(`${API_URL}/accounts/${accountId}/schedule/extra-hours/${ehId}/review`, data, getAuthHeader());
    return res.data;
  },
};

export const timeOffService = {
  getMine: async (accountId) => {
    const res = await axios.get(`${API_URL}/accounts/${accountId}/schedule/time-off/me`, getAuthHeader());
    return res.data;
  },
  getAll: async (accountId) => {
    const res = await axios.get(`${API_URL}/accounts/${accountId}/schedule/time-off`, getAuthHeader());
    return res.data;
  },
  setAllowance: async (accountId, memberId, data) => {
    const res = await axios.put(`${API_URL}/accounts/${accountId}/schedule/time-off/${memberId}/allowance`, data, getAuthHeader());
    return res.data;
  },
  setRatio: async (accountId, ratio) => {
    const res = await axios.put(`${API_URL}/accounts/${accountId}/schedule/time-off/settings`, { ratio }, getAuthHeader());
    return res.data;
  },
};

export const workLogService = {
  getAll: async (accountId, params) => {
    const res = await axios.get(`${API_URL}/accounts/${accountId}/schedule/work-logs`, {
      ...getAuthHeader(),
      params,
    });
    return res.data;
  },
  create: async (accountId, data) => {
    const res = await axios.post(`${API_URL}/accounts/${accountId}/schedule/work-logs`, data, getAuthHeader());
    return res.data;
  },
  remove: async (accountId, logId) => {
    const res = await axios.delete(`${API_URL}/accounts/${accountId}/schedule/work-logs/${logId}`, getAuthHeader());
    return res.data;
  },
};

export const reportService = {
  getMonthlySummary: async (accountId, year, month) => {
    const res = await axios.get(`${API_URL}/accounts/${accountId}/schedule/reports/monthly`, {
      ...getAuthHeader(),
      params: { month: `${year}-${month}` },
    });
    return res.data;
  },
};
