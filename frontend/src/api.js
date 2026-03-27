import axios from "axios";

// Get the current host dynamically
const getBaseURL = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // If accessing from mobile device, use the current hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:8080/api`;
  }
  
  // For mobile access via IP or ngrok
  return `${protocol}//${hostname}:8080/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;