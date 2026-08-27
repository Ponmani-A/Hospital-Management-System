import axios from "axios";

const api = axios.create({
  baseURL: "https://hospital-management-system-2-jmxz.onrender.com",
});

export default api;
