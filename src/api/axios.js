// daon-frontend/src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://g90179.gabia.io',
});

api.interceptors.request.use((config) => {
  // 💡 로컬 스토리지 키 이름이 'token'인지 'access_token'인지 정확히 확인하세요!
  const token = localStorage.getItem('token'); 
  
  if (token) {
    // 토큰이 있으면 헤더에 항상 'Bearer '를 붙여서 보냄
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;