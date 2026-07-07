// daon-frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomeView from './components/HomeView';
import QuoteBoard from './pages/QuoteBoard';
import AdminDashboard from './pages/admin/AdminDashboard'; // 🔑 새로 분리한 파일 임포트
import axiosOriginal from 'axios';
import { API_URL } from './config';
import 'ckeditor5/ckeditor5.css';

const KAKAO_MAP_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_KAKAO_MAP_KEY) || ""; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInEmail, setLoggedInEmail] = useState(localStorage.getItem('loggedInEmail') || '');

  // 공통 공유용 데이터 상태
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('전체');
  const [companyInfo, setCompanyInfo] = useState({});
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);

  // 1. Axios 글로벌 인터셉터 기동 (JWT 2단계 단기/장기 토큰 재발급 자동화 엔진)
  const axiosInstance = axiosOriginal.create({ baseURL: API_URL });
  
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const res = await axiosOriginal.post(`${API_URL}/auth/refresh`, { refreshToken });
          const newAccessToken = res.data.access_token;
          localStorage.setItem('token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosOriginal(originalRequest);
        } catch (err) {
          localStorage.clear();
          alert('인증 정보가 만료되었습니다. 다시 로그인해 주세요.');
          window.location.href = '/';
        }
      }
      return Promise.reject(error);
    }
  );

  // 2. 카카오맵 SDK 수동 로딩 프로세스 (Footer 및 Admin 공유용)
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setIsMapScriptLoaded(true);
      return;
    }
    const scriptId = 'kakao-map-script';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=services&autoload=false`;
      document.head.appendChild(script);
    }

    script.addEventListener('load', () => {
      window.kakao.maps.load(() => setIsMapScriptLoaded(true));
    });

    if (!document.getElementById('daum-postcode-script')) {
      const postcodeScript = document.createElement('script');
      postcodeScript.id = 'daum-postcode-script';
      postcodeScript.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      document.head.appendChild(postcodeScript);
    }
  }, []);

  // 3. 전역 마운트 이펙트 페치 리스트
  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  // 🔑 [핵심 신규 추가] 메인 홈페이지 세팅용 글로벌 트리거 장착!
  // 초기 마운트 시점 및 사용자가 메인화면/관리자 화면에서 탭을 바꿀 때마다 posts 데이터를 항상 최신화합니다.
  useEffect(() => {
    fetchPosts();
  }, [activeTab]); 

  const fetchPosts = async () => {
    try {
      const categoryParam = activeTab === '전체' ? '' : activeTab;
      const response = await axiosInstance.get(`/posts?category=${categoryParam}`);
      setPosts(response.data);
    } catch (e) {}
  };

  const fetchCompanyInfo = async () => {
    try {
      const res = await axiosInstance.get('/company');
      if (res.data) setCompanyInfo(res.data);
    } catch (e) {}
  };

  // 4. 인증 제어기
  const handleLogin = async () => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('refreshToken', res.data.refresh_token);
      localStorage.setItem('loggedInEmail', email);
      setLoggedInEmail(email);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      window.location.href = '/admin';
    } catch (e) { alert('로그인 정보가 틀렸습니다.'); }
  };
  
  const handleLogout = () => { 
    localStorage.clear();
    setIsLoggedIn(false); 
    window.location.href = '/'; 
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 🏠 홈페이지 레이아웃 경로 그룹 */}
        <Route element={
          <Layout 
            companyInfo={companyInfo}
            isMapScriptLoaded={isMapScriptLoaded}
            isLoggedIn={isLoggedIn}
            setShowLoginModal={setShowLoginModal}
          />
        }>
          <Route path="/" element={
            <HomeView 
              posts={posts} activeTab={activeTab} setActiveTab={setActiveTab}
            />
          } />
          <Route path="/quotes" element={<QuoteBoard isLoggedIn={isLoggedIn} />} />
        </Route>

        {/* 🛠️ 관리자 전용 독립 페이지 라우트 (독립 컴포넌트로 완벽 분리) */}
        <Route 
          path="/admin" 
          element={
            <AdminDashboard 
              isLoggedIn={isLoggedIn}
              handleLogout={handleLogout}
              loggedInEmail={loggedInEmail}
              isMapScriptLoaded={isMapScriptLoaded}
              posts={posts}
              fetchPosts={fetchPosts}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              fetchGlobalCompanyInfo={fetchCompanyInfo} // 대시보드 저장 시 전역 푸터도 동시 갱신
            />
          } 
        />
      </Routes>

      {/* 🔐 로그인 모달창 팝업 레이어 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] px-4">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-400 font-bold">✕</button>
            <h2 className="text-2xl font-black mb-6 text-slate-900 uppercase">Admin Login</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Email" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none border" onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none border" onChange={e => setPassword(e.target.value)} />
              <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-orange-500 transition">Sign In</button>
            </div>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;