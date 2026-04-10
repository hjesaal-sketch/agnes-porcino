// src/config/api.ts
const API_BASE = 
  process.env.NODE_ENV === 'production' 
    ? "https://agnes-porcino.onrender.com/api"
    : "http://localhost:8000/api";

export default API_BASE;

