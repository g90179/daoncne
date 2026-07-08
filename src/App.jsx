// daon-frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
// 🔑 실서버 404를 원천 차단하는 HashRouter 규격을 유지합니다.
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomeView from './components/HomeView';
import QuoteBoard from './pages/QuoteBoard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ForgotPassword from './pages/admin/ForgotPassword'; 
import ResetPassword from './pages/admin/ResetPassword';
import { 
  PolicyView, 
  PolicyHistoryList, 
  PolicyHistoryDetail 
} from './pages/policy'; //정책 공시 뷰어 추가
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

  // 1. Axios 글로벌 인터셉터 기동
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

  // 2. 카카오맵 SDK 수동 로딩 프로세스
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
      
      // 🔑 [주소 전환 완료] 로그인 성공 시 새로운 은닉 주소인 admDashboard 로 진입시킵니다.
      window.location.href = '/#/admDashboard'; 
    } catch (e) { alert('로그인 정보가 틀렸습니다.'); }
  };
  
  const handleLogout = () => { 
    localStorage.clear();
    setIsLoggedIn(false); 
    window.location.href = '/'; 
  };

  return (
    <HashRouter>
      <AdminAuthManager 
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        handleLogin={handleLogin}
      />

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

          {/* 🔑 [엔드포인트 개방] 푸터 링크가 도달할 정식 공시 규정 라우트 매핑 */}
          <Route path="/policy" element={<PolicyView />} />
          <Route path="/policy/history" element={<PolicyHistoryList />} />
          <Route path="/policy/history/:id" element={<PolicyHistoryDetail />} />
          
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* 🛠️ 🔑 [주소 전환 완료] 관리자 대시보드 엔드포인트를 /amddashboard 로 변경 라우팅합니다. */}
        <Route 
          path="/admDashboard" 
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
              fetchGlobalCompanyInfo={fetchCompanyInfo}
            />
          } 
        />
      </Routes>
    </HashRouter>
  );
}

/**
 * 🔒 [신규 지원 컴포넌트] AdminAuthManager
 */
function AdminAuthManager({ showLoginModal, setShowLoginModal, email, setEmail, password, setPassword, handleLogin }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.triggerLogin) {
      setShowLoginModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, setShowLoginModal]);

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] px-4 animate-fadeIn">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md relative">
        <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold transition cursor-pointer">✕</button>
        <h2 className="text-xl font-bold mb-6 text-[oklch(0.38_0.07_259.56)] uppercase tracking-tight">Admin Desk Login</h2>
        
        <div className="space-y-4 text-left">
          <input 
            type="text" 
            placeholder="Email Address" 
            className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-4 text-sm text-[oklch(0.38_0.07_259.56)] outline-none focus:bg-white focus:border-blue-400 transition" 
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-4 text-sm text-[oklch(0.38_0.07_259.56)] outline-none focus:bg-white focus:border-blue-400 transition" 
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            onClick={handleLogin} 
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs shadow-lg shadow-slate-900/10 hover:bg-blue-400 hover:shadow-blue-400/20 transition-all active:scale-95 cursor-pointer"
          >
            Sign In
          </button>
        </div>

        <div className="mt-5 text-center border-t border-slate-100 pt-4">
          <button 
            onClick={() => {
              setShowLoginModal(false);
              navigate('/forgot-password'); 
            }}
            className="text-xs text-slate-400 hover:text-blue-400 font-bold transition cursor-pointer"
          >
            비밀번호를 잊으셨나요? (비밀번호 찾기)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;