import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://expensetracker-management-production.up.railway.app",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
