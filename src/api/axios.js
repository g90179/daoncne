// daon-frontend/src/api/axios.js (또는 메인 설정 파일)
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://g90179.gabia.io',
});

// 모든 요청을 보낼 때마다 로컬 스토리지에서 토큰을 꺼내 헤더에 넣음
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;