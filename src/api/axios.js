// daon-frontend/src/api/axios.js
import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
});

// 요청 인터셉터: 모든 요청에 토큰 자동 주입
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 예외 처리 로직 강화
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. 401 에러가 발생한 요청의 URL이 공개 경로인지 확인 (예외 처리)
    const publicRoutes = ['/quotes/init', '/auth/login', '/auth/refresh'];
    const isPublicRoute = publicRoutes.some(route => originalRequest.url.includes(route));

    // 공개 경로에서 발생한 401은 인터셉터에서 차단하지 않고 그대로 반환 (컴포넌트의 catch로 전달)
    if (error.response?.status === 401 && isPublicRoute) {
      return Promise.reject(error);
    }

    // 2. 일반적인 인증 만료 로직 (토큰 갱신 시도)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = res.data.access_token;
        localStorage.setItem('token', newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // 기존 요청 재시도
      } catch (err) {
        localStorage.clear();
        alert('인증이 만료되었습니다. 다시 로그인해 주세요.');
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;