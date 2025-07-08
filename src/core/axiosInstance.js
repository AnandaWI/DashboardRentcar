// src/api/axiosInstance.js
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://api.rentcar-ta.my.id', // ← ganti sesuai kebutuhan
})

// Tambahkan interceptor agar Authorization otomatis
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // atau dari cookies / context
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default axiosInstance
