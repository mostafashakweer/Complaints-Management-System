import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1", // ✨ الباك بتاعك شغال هنا
  withCredentials: false,
});

export default api;
