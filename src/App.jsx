// daon-frontend\src\App.jsx 상단부

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomeView from './components/HomeView';
import QuoteBoard from './pages/QuoteBoard';
import AdminPostEditor from './components/AdminPostEditor';
import AdminPostList from './components/AdminPostList';
import MainSlideAdmin from './pages/admin/MainSlideAdmin'; 

// 🔴 이 부분을 아래 2줄로 완전히 교체해 주세요! (react-native-axios 제거)
import axios from 'axios';
import { API_URL } from './config';
import 'ckeditor5/ckeditor5.css';



const KAKAO_MAP_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_KAKAO_MAP_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_KAKAO_MAP_KEY) ||
  "";

const DEBUG_ALLOWED_EMAIL = 'hello.g901@kakao.com';

function App() {
  const axiosInstance = axios.create({
    baseURL: API_URL,
  });
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewRole] = useState('일반 관리자');
  const [editingUser, setEditingUser] = useState(null); // 현재 수정 중인 유저 객체
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('일반 관리자');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [adminView, setAdminView] = useState('home'); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('전체');
  const [editingPost, setEditingPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addressDetail, setAddressDetail] = useState('');

  const [loggedInEmail, setLoggedInEmail] = useState(localStorage.getItem('loggedInEmail') || '');

  const [companyName, setCompanyName] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [bizNumber, setBizNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [faxNumber, setFaxNumber] = useState('');
  
  const [lat, setLat] = useState(37.5665); 
  const [lng, setLng] = useState(126.9780); 

  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);

  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [diagnosticReport, setDiagnosticReport] = useState({
    envKeyExist: '대기 중',
    scriptInjected: '대기 중',
    windowKakaoExist: '대기 중',
    sdkLoadComplete: '대기 중',
    geocoderLibraryExist: '대기 중',
    containerHeightValid: '대기 중'
  });

  const isSuperAdmin = loggedInEmail === DEBUG_ALLOWED_EMAIL;

  const logDebug = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Request 인터셉터: 보낼 때마다 로컬스토리지의 Access Token 자동 탑재
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response 인터셉터: 401 토큰 만료 에러 감지 시 Silent Refresh 작동
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          // 백엔드에 토큰 갱신 요청
          const res = await axiosOriginal.post(`${API_URL}/auth/refresh`, { refreshToken });
          const newAccessToken = res.data.access_token;
          
          localStorage.setItem('token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosOriginal(originalRequest); // 실패했던 원래 API 재시도
        } catch (refreshError) {
          // 리프레시 토큰조차 만료 시 강제 로그아웃
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          alert('보안 세션이 만료되었습니다. 다시 로그인해 주세요.');
          window.location.href = '/';
        }
      }
      return Promise.reject(error);
    }
  );

  const runDiagnostics = () => {
    logDebug('🔍 카카오맵 API 연동 자가진단을 시작합니다...', 'info');
    const report = {
      envKeyExist: KAKAO_MAP_KEY ? '통과' : '실패',
      scriptInjected: document.getElementById('kakao-map-script') ? '통과' : '실패',
      windowKakaoExist: window.kakao ? '통과' : '실패',
      sdkLoadComplete: (window.kakao && window.kakao.maps) ? '통과' : '실패',
      geocoderLibraryExist: (window.kakao && window.kakao.maps && window.kakao.maps.services) ? '통과' : '실패',
      containerHeightValid: '판별 안 됨'
    };

    if (KAKAO_MAP_KEY) {
      logDebug(`[1] API Key 확인됨 (앞자리: ${KAKAO_MAP_KEY.substring(0, 6)}***)`, 'success');
    } else {
      logDebug('[1] API Key 유실: .env의 변수명이 VITE_KAKAO_MAP_KEY 인지 확인해 주세요.', 'error');
    }

    const scriptEl = document.getElementById('kakao-map-script');
    if (scriptEl) {
      logDebug(`[2] <head>에 스크립트가 로드되어 있습니다. (src: ${scriptEl.src.substring(0, 40)}...)`, 'success');
    } else {
      logDebug('[2] <head>에 주입된 카카오 스크립트 태그가 존재하지 않습니다.', 'error');
    }

    if (window.kakao) {
      logDebug('[3] 글로벌 "window.kakao" 객체가 브라우저 메모리에 등록되어 있습니다.', 'success');
      if (window.kakao.maps) {
        logDebug('[4] 글로벌 "window.kakao.maps" 맵 제어 객체가 생성되어 준비를 마쳤습니다.', 'success');
      } else {
        logDebug('[4] "window.kakao.maps"가 준비되지 않았습니다. API 키 도메인 차단 여부를 검사해 주세요.', 'error');
      }
    } else {
      logDebug('[3] "window.kakao"가 메모리에 없습니다. 네트워크 탭에서 JS 다운로드 실패 여부를 확인해 주세요.', 'error');
    }

    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      logDebug('[5] "services" 라이브러리(Geocoder)가 정상 인젝션되었습니다.', 'success');
    } else {
      logDebug('[5] "services" 라이브러리가 존재하지 않습니다. 스크립트 파라미터에 libraries=services 가 추가되었는지 확인하세요.', 'error');
    }

    const mapContainer = document.getElementById('admin-map');
    if (mapContainer) {
      const rect = mapContainer.getBoundingClientRect();
      logDebug(`[6] 지도 컨테이너 차원 분석: 가로 ${rect.width}px / 세로 ${rect.height}px`, 'info');
      if (rect.height === 0 || rect.width === 0) {
        report.containerHeightValid = '실패';
        logDebug('[6] 컨테이너 높이 혹은 너비가 0px입니다. CSS 또는 상위 엘리먼트 flex 속성을 조절해 주세요.', 'error');
      } else {
        report.containerHeightValid = '통과';
        logDebug('[6] 지도 컨테이너 규격 검사 완료. 정상 드로잉 조건 충족.', 'success');
      }
    } else {
      report.containerHeightValid = '실패';
      logDebug('[6] 화면에 "admin-map" 이라는 ID를 가진 DOM 컨테이너를 찾지 못했습니다.', 'error');
    }

    setDiagnosticReport(report);
  };

  useEffect(() => {
    logDebug('🚀 애플리케이션 시작: 스크립트 수동 로딩 프로세스를 기동합니다.', 'info');
    
    if (window.kakao && window.kakao.maps) {
      logDebug('이미 로딩 완료된 기존 카카오 SDK 인스턴스가 존재합니다.', 'success');
      setIsMapScriptLoaded(true);
      return;
    }

    const scriptId = 'kakao-map-script';
    let script = document.getElementById(scriptId);

    if (script && window.kakao && window.kakao.maps) {
      logDebug('기존 스크립트 태그가 있고 SDK도 이미 준비된 상태입니다.', 'success');
      setIsMapScriptLoaded(true);
      return;
    }

    if (!script) {
      logDebug('새로운 카카오 스크립트 태그를 생성하여 <head>에 부착합니다.', 'info');
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=services&autoload=false`;
      document.head.appendChild(script);
    } else {
      logDebug('기존에 생성되어 있던 스크립트 엘리먼트를 재활용합니다.', 'info');
    }

    let loadTimeoutId = null;

    const handleScriptLoad = () => {
      logDebug('스크립트가 브라우저 헤더 파일로 안착 완료되었습니다. 카카오 맵 모듈을 불러옵니다.', 'info');

      loadTimeoutId = setTimeout(() => {
        logDebug(
          '⏱️ 8초 이상 "window.kakao.maps.load()" 콜백이 응답하지 않습니다. ' +
          '① 카카오 콘솔 도메인 등록이 아직 반영되지 않았거나, ' +
          '② 광고 차단/보안 확장 프로그램이 dapi.kakao.com 요청을 막고 있을 가능성이 높습니다. ' +
          '시크릿 모드에서 다시 테스트해 주세요.',
          'error'
        );
      }, 8000);

      window.kakao.maps.load(() => {
        clearTimeout(loadTimeoutId);
        logDebug('카카오 SDK 컴파일 및 가용 모듈 주입이 완전 종결되었습니다.', 'success');
        setIsMapScriptLoaded(true);
      });
    };

    const handleScriptError = () => {
      logDebug(
        '❌ 카카오 스크립트 파일(sdk.js) 자체를 다운로드하지 못했습니다. ' +
        'appkey 값이 비어있거나 잘못됐거나, 네트워크/방화벽/확장 프로그램이 dapi.kakao.com 요청을 차단하고 있을 수 있습니다.',
        'error'
      );
    };

    script.addEventListener('load', handleScriptLoad);
    script.addEventListener('error', handleScriptError);

    if (!document.getElementById('daum-postcode-script')) {
      const postcodeScript = document.createElement('script');
      postcodeScript.id = 'daum-postcode-script';
      postcodeScript.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      document.head.appendChild(postcodeScript);
    }

    return () => {
      if (script) {
        script.removeEventListener('load', handleScriptLoad);
        script.removeEventListener('error', handleScriptError);
      }
      if (loadTimeoutId) {
        clearTimeout(loadTimeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
    }
    fetchCompanyInfo(); 
    fetchPosts();
  }, [isLoggedIn, activeTab]);

  useEffect(() => {
    if (adminView === 'company' && address && isMapScriptLoaded) {
      const initializeAdminMap = () => {
        const container = document.getElementById('admin-map');
        if (!container) {
          logDebug('지도 캔버스 DOM 컨테이너를 찾을 수 없어 렌더링을 보류했습니다.', 'error');
          return;
        }

        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          logDebug(`"${address}" 주소를 변환하기 위해 카카오 Geocoder API를 호출합니다...`, 'info');
          const geocoder = new window.kakao.maps.services.Geocoder();
          
          geocoder.addressSearch(address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const latitudeVal = parseFloat(result[0].y);
              const longitudeVal = parseFloat(result[0].x);
              
              setLat(latitudeVal);
              setLng(longitudeVal);
              logDebug(`좌표 변환 성공! 위도: ${latitudeVal} / 경도: ${longitudeVal}`, 'success');

              const coords = new window.kakao.maps.LatLng(latitudeVal, longitudeVal);
              const mapOption = { 
                center: coords, 
                level: 3 
              };
              
              const map = new window.kakao.maps.Map(container, mapOption);
              const marker = new window.kakao.maps.Marker({ position: coords });
              marker.setMap(map);
              logDebug('지도 드로잉이 완료되었으며, 마커가 가좌동 중심 좌표에 무사히 생성되었습니다.', 'success');
            } else {
              logDebug(`카카오 주소 변환(Geocoder) 연산 도중 에러가 감지되었습니다. 에러 상태: ${status}`, 'error');
            }
          });
        } else {
          logDebug('지도 생성 조건 미충족: 카카오 변환 모듈이 활성화 상태가 아닙니다.', 'error');
        }
      };

      initializeAdminMap();
    }
  }, [adminView, address, isMapScriptLoaded]);

  const fetchUsers = async () => { try { const res = await axiosInstance.get(`${API_URL}/users`); setUsers(res.data); } catch (e) {} };
  const fetchPosts = async () => {
    const categoryParam = activeTab === '전체' ? '' : activeTab;
    const response = await axiosInstance.get(`${API_URL}/posts?category=${categoryParam}`);
    setPosts(response.data);
  };
  
  const fetchCompanyInfo = async () => {
    try {
      const res = await axiosInstance.get(`${API_URL}/company`);
      if (res.data) {
        setCompanyName(res.data.name || '');
        setCeoName(res.data.ceo || '');
        setBizNumber(res.data.bizNumber || '');
        setAddress(res.data.address || '');
        setAddressDetail(res.data.addressDetail || ''); 
        setPhone(res.data.phone || '');
        setCompanyEmail(res.data.email || '');
        setFaxNumber(res.data.fax || '');
        if (res.data.lat) setLat(parseFloat(res.data.lat));
        if (res.data.lng) setLng(parseFloat(res.data.lng));
        logDebug('DB로부터 회사 기본 위치 및 경위도 정보를 성공적으로 복구했습니다.', 'success');
      }
    } catch (e) {
      logDebug('서버 DB로부터 기등록된 데이터 로드를 하지 못했습니다. 빈 값으로 초기화합니다.', 'error');
    }
  };

  const handleAddressSearch = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function(data) {
          setAddress(data.address); 
          logDebug(`우편번호 도로명 정보 반환 완료: ${data.address}`, 'info');
        }
      }).open();
    } else {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleSaveCompanyInfo = async () => {
    try {
      await axiosInstance.post(`${API_URL}/company`, {
        name: companyName,
        ceo: ceoName,
        bizNumber: bizNumber,
        address: address,
        addressDetail: addressDetail, 
        phone: phone,
        email: companyEmail,
        fax: faxNumber,
        lat: lat, 
        lng: lng  
      });
      alert('회사 정보와 지도 좌표가 성공적으로 업데이트되었습니다.');
    } catch (e) {
      alert('회사 정보 저장에 실패했습니다. 백엔드 엔드포인트를 확인하세요.');
    }
  };

  // ─── 로그인 처리 함수 수정 ───
  const handleLogin = async () => {
  try {
    const res = await axiosInstance.post(`/auth/login`, { email, password });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('refreshToken', res.data.refresh_token); // 🔑 한 달 저장용 주입
    localStorage.setItem('loggedInEmail', email);
    setLoggedInEmail(email);
    setIsLoggedIn(true); 
    setAdminView('posts'); 
    setShowLoginModal(false);
    window.location.href = '/admin';
  } catch (e) { alert('로그인에 실패했습니다. 계정 정보를 확인하세요.'); }
};
  
  // ─── 로그아웃 처리 함수 수정 ───
  const handleLogout = () => { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('loggedInEmail');
    setLoggedInEmail('');
    setIsLoggedIn(false); 
    setAdminView('home'); 
    
    window.location.href = '/'; // 🔑 로그아웃 즉시 메인 홈으로 튕겨냅니다.
  };

  // ─── 유저 정보 수정 통신 함수 ───
  // ─── 유저 정보 수정 함수 고도화 ───
  const handleUpdateUser = async () => {
    if (!editEmail) { alert('이메일은 필수 입력 사항입니다.'); return; }
    try {
      await axiosInstance.patch(`/users/${editingUser.id}`, {
        email: editEmail,
        password: editPassword || undefined, 
        name: editName, // 🔑 백엔드 name 컬럼 전송
        phone: editPhone,
        role: editRole
      });
      alert('계정 정보가 성공적으로 수정되었습니다.');
      setEditingUser(null);
      setEditPassword('');
      fetchUsers(); 
    } catch (e) { alert('계정 수정 연산 도중 에러가 발생했습니다.'); }
  };
  
  // ─── 기존 handleCreateUser 함수 고도화 ───
  // ─── 유저 정보 생성 함수 고도화 ───
  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) { alert('이메일과 비밀번호를 모두 입력해 주세요.'); return; }
    try {
      await axiosInstance.post(`/users`, { 
        email: newEmail, 
        password: newPassword,
        name: newUserName, // 🔑 백엔드 name 컬럼 전송
        phone: newUserPhone,
        role: newUserRole
      });
      alert('새로운 관리자 계정이 생성되었습니다.');
      setNewEmail(''); setNewPassword(''); setNewUserName(''); setNewUserPhone(''); setNewRole('일반 관리자');
      fetchUsers();
    } catch (e) { alert('계정 생성 실패'); }
  };

  // ─── 내부에 선언된 Sidebar 컴포넌트 수정 ───
  const Sidebar = () => (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shadow-2xl z-[100]">
      <div className="p-8"><h2 className="text-xl font-black text-orange-500 uppercase tracking-tighter">Daon CNE</h2></div>
      <nav className="flex-1 px-4 space-y-2">
        {/* 🔑 버튼 클릭 시 메인 루트 주소('/')로 확실하게 이동시켜 줍니다. */}
        <button 
          onClick={() => {
            setAdminView('home');
            window.location.href = '/'; 
          }} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'home' ? 'bg-slate-700' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          🏠 홈페이지 보기
        </button>
        <div className="h-px bg-slate-800 my-4 mx-2" />
        <button onClick={() => setAdminView('posts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'posts' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>📝 콘텐츠 관리</button>
        <button onClick={() => setAdminView('slides')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'slides' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>🎬 메인 슬라이드 관리</button>
        <button onClick={() => setAdminView('company')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'company' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>🏢 회사 정보 관리</button>
        <button onClick={() => setAdminView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'users' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>👤 계정 관리</button>
      </nav>
      <div className="p-6 border-t border-slate-800"><button onClick={handleLogout} className="w-full py-3 text-red-400 font-bold hover:bg-red-500/10 rounded-xl transition">로그아웃</button></div>
    </aside>
  );

  const parsedCompanyInfo = {
    name: companyName,
    ceo: ceoName,
    bizNumber,
    address,
    addressDetail,
    phone,
    email: companyEmail,
    fax: faxNumber,
    lat,
    lng
  };

  return (
    <BrowserRouter>
      <div className={`min-h-screen font-sans relative ${adminView !== 'home' ? 'flex bg-slate-50' : 'bg-white'}`}>
        {isLoggedIn && adminView !== 'home' && <Sidebar />}

        <div className="flex-1 overflow-x-hidden">
          <Routes>
            
            {/* 🏠 Route Group: 공통 레이아웃 구조가 적용되는 유저 페이지 단락 */}
            <Route element={
              <Layout 
                companyInfo={parsedCompanyInfo}
                isMapScriptLoaded={isMapScriptLoaded}
                isLoggedIn={isLoggedIn}
                setAdminView={setAdminView}
                setShowLoginModal={setShowLoginModal}
              />
            }>
              {/* 메인 홈 화면 */}
              <Route 
                path="/" 
                element={
                  <HomeView 
                    posts={posts}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedPost={selectedPost}
                    setSelectedPost={setSelectedPost}
                  />
                } 
              />
              
              {/* 견적문의 전용 독립 페이지 */}
              <Route 
                path="/quotes" 
                element={<QuoteBoard isLoggedIn={isLoggedIn} />} 
              />
            </Route>

            {/* 🛠️ Route C: 기존 백엔드 어드민 제어 타워 독립 가동 */}
            <Route 
              path="/admin" 
              element={
                <main className="p-12 relative w-full">
                  {adminView === 'posts' && (
                    <div className="max-w-12xl mx-auto space-y-12 animate-fadeIn">
                      <header className="flex justify-between items-end">
                        <div><h1 className="text-3xl font-black text-slate-800 tracking-tighter">콘텐츠 관리</h1><p className="text-slate-400 mt-1 uppercase text-xs font-bold">Manage your projects & equipment</p></div>
                        <div className="bg-white p-1 rounded-2xl shadow-sm border flex gap-1">
                          {['현장사진', '공사실적', '보유장비'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-xs font-bold transition ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>{tab}</button>
                          ))}
                        </div>
                      </header>
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        <div className="xl:col-span-8"><AdminPostEditor editingPost={editingPost} onCancel={() => setEditingPost(null)} onSuccess={() => { setEditingPost(null); fetchPosts(); }} /></div>
                        <div className="xl:col-span-4 h-[900px] overflow-y-auto pr-2 custom-scrollbar">
                          <AdminPostList posts={posts} onEdit={(post) => { setEditingPost(post); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={async (id) => { if(confirm('삭제하시겠습니까?')) { await axiosInstance.delete(`${API_URL}/posts/${id}`); fetchPosts(); } }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {adminView === 'slides' && (
                    <div className="animate-fadeIn">
                      <MainSlideAdmin />
                    </div>
                  )}
                  
                  {adminView === 'users' && (
                    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
                      <div className="flex flex-col">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">계정 관리</h1>
                        <p className="text-slate-400 mt-1 uppercase text-xs font-bold">Manage system admin credentials and authorization levels</p>
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        
                        {/* 👈 좌측 패널: 등록 및 수정 인풋 폼 */}
                        <div className="xl:col-span-5 space-y-6">
                          {editingUser ? (
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-blue-100 space-y-6 animate-fadeIn">
                              <div className="flex justify-between items-center border-b pb-3">
                                <h3 className="font-black text-slate-800 text-base">🛠️ 계정 정보 수정</h3>
                                <button onClick={() => setEditingUser(null)} className="text-xs font-bold text-slate-400 hover:text-slate-900">수정 취소</button>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">아이디 (이메일)</label>
                                  <input type="text" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                                </div>
                                {/* 🔑 수정 모드 이름(별명) 필드 */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">이름 (별명)</label>
                                  <input type="text" placeholder="이름 또는 닉네임" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={editName} onChange={e => setEditName(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">새 비밀번호 <span className="text-blue-500 font-normal">(미입력 시 기존 유지)</span></label>
                                  <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">전화번호 연락처</label>
                                  <input type="text" placeholder="예: 010-1234-5678" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">권한 등급 설정</label>
                                  <select className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" value={editRole} onChange={e => setEditRole(e.target.value)}>
                                    <option value="일반 관리자">일반 관리자</option>
                                    <option value="최고 관리자">최고 관리자</option>
                                  </select>
                                </div>
                                <button onClick={handleUpdateUser} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-md mt-2">변경 사항 저장</button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl border space-y-6">
                              <h3 className="font-black text-slate-800 text-base border-b pb-3">👤 신규 계정 등록</h3>
                              <div className="space-y-4">
                                <input type="text" placeholder="이메일 주소 입력" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                                <input type="password" placeholder="비밀번호 설정" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                {/* 🔑 생성 모드 이름(별명) 필드 */}
                                <input type="text" placeholder="이름 (별명)" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                                <input type="text" placeholder="연락처 (선택)" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} />
                                <select className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" value={newUserRole} onChange={e => setNewRole(e.target.value)}>
                                  <option value="일반 관리자">일반 관리자</option>
                                  <option value="최고 관리자">최고 관리자</option>
                                </select>
                                <button onClick={handleCreateUser} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-orange-500 transition shadow-md mt-2">새 어드민 생성</button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 👉 우측 패널: 가용 관리자 디렉토리 리스트 */}
                        <div className="xl:col-span-7">
                          <div className="bg-white rounded-[2rem] shadow-xl border overflow-hidden">
                            <div className="p-5 bg-gray-50/80 border-b font-black text-[11px] uppercase text-gray-400 tracking-wider text-center">
                              Active System Admin Directory
                            </div>
                            <div className="divide-y h-[560px] overflow-y-auto custom-scrollbar">
                              {users.map(u => (
                                <div key={u.id} className="p-6 flex justify-between items-center hover:bg-slate-50/50 transition duration-150">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2.5">
                                      {/* 🔑 이름 데이터가 있으면 "이름 (이메일)" 구조로 시원하게 출력 */}
                                      <p className="font-extrabold text-slate-800 text-sm">
                                        {u.name ? `${u.name} [${u.email}]` : u.email}
                                      </p>
                                      <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full border ${
                                        u.role === '최고 관리자' ? 'bg-orange-50 text-orange-500 border-orange-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                                      }`}>
                                        {u.role || '일반 관리자'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">{u.phone || '등록된 연락처 없음'}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <button 
                                      onClick={() => {
                                        setEditingUser(u);
                                        setEditEmail(u.email);
                                        setEditName(u.name || ''); // 🔑 수정 버튼 클릭 시 기존 이름 바인딩
                                        setEditPhone(u.phone || '');
                                        setEditRole(u.role || '일반 관리자');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }} 
                                      className="text-blue-500 font-black text-xs hover:underline"
                                    >
                                      수정
                                    </button>
                                    <button 
                                      onClick={async () => { 
                                        if(confirm(`${u.email} 계정을 영구 삭제하시겠습니까?`)) { 
                                          await axiosInstance.delete(`/users/${u.id}`); 
                                          fetchUsers(); 
                                        } 
                                      }} 
                                      className="text-red-400 font-bold text-xs hover:text-red-600"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {adminView === 'company' && (
                    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
                      <div className="flex justify-between items-start">
                        <div>
                          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">회사 정보 관리</h1>
                          <p className="text-slate-400 mt-1 uppercase text-xs font-bold">Manage company settings and metadata</p>
                        </div>
                        {isSuperAdmin && (
                          <button 
                            type="button" 
                            onClick={() => { setShowDebugPanel(!showDebugPanel); runDiagnostics(); }}
                            className="bg-red-500 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-lg hover:bg-red-600 transition flex items-center gap-1.5"
                          >
                            🚨 카카오맵 실시간 자가진단기 {showDebugPanel ? '닫기' : '켜기'}
                          </button>
                        )}
                      </div>

                      <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">회사명</label>
                            <input type="text" placeholder="예: (주)다온씨엔이" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">대표자명</label>
                            <input type="text" placeholder="대표자 성함 입력" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition" value={ceoName} onChange={e => setCeoName(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">사업자 등록번호</label>
                            <input type="text" placeholder="000-00-00000" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition" value={bizNumber} onChange={e => setBizNumber(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">대표 전화번호</label>
                            <input type="text" placeholder="02-000-0000" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition" value={phone} onChange={e => setPhone(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">공식 이메일 주소</label>
                            <input type="email" placeholder="example@daoncne.com" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">팩스 번호</label>
                            <input type="text" placeholder="02-000-0000" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition" value={faxNumber} onChange={e => setFaxNumber(e.target.value)} />
                          </div>
                          
                          <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">회사 주소</label>
                            <div className="flex gap-3">
                              <input type="text" readOnly placeholder="주소 검색 버튼을 클릭하여 도로명 주소를 입력하세요" className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none transition text-slate-700 font-medium" value={address} />
                              <button type="button" onClick={handleAddressSearch} className="px-6 bg-slate-800 text-white rounded-2xl font-black text-sm shadow-md hover:bg-orange-500 transition duration-200">주소 검색</button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">상세주소</label>
                            <input 
                              type="text" 
                              placeholder="예: 3층 다온씨엔이 (동, 호수, 층 등)" 
                              className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition" 
                              value={addressDetail} 
                              onChange={e => setAddressDetail(e.target.value)} 
                            />
                          </div>

                          <div className="flex flex-col gap-2 md:col-span-2 pt-4">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">지도 실시간 프리뷰</label>
                            <div id="admin-map" className="w-full h-72 bg-slate-100 rounded-3xl border border-gray-200 overflow-hidden shadow-inner relative z-10">
                              {!address && <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-sm">주소를 입력하시면 이곳에 지도가 활성화됩니다.</div>}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                          <button 
                            onClick={handleSaveCompanyInfo}
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-orange-500 transition duration-300 transform active:scale-95"
                          >
                            정보 수정하기
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </main>
              } 
            />
          </Routes>
        </div>

        {/* 🚨 실시간 진단 대시보드 오버레이 레이어 */}
        {isSuperAdmin && showDebugPanel && adminView === 'company' && (
          <div className="w-96 bg-slate-950 text-slate-100 border-l border-slate-800 h-screen sticky top-0 shadow-2xl p-6 flex flex-col justify-between z-[150] animate-fadeIn">
            <div className="space-y-6 flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="font-black text-sm tracking-tight">Kakao SDK 진단 대시보ть</h3>
                </div>
                <button onClick={() => setShowDebugPanel(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-slate-400 tracking-wider">하드웨어 상태 체크리스트</h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span>1. .env API 키 존재 여부</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${diagnosticReport.envKeyExist === '통과' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{diagnosticReport.envKeyExist}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span>2. Script 태그 헤더 주입</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${diagnosticReport.scriptInjected === '통과' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{diagnosticReport.scriptInjected}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span>3. window.kakao 객체 존재</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${diagnosticReport.windowKakaoExist === '통과' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{diagnosticReport.windowKakaoExist}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span>4. window.kakao.maps 모듈</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${diagnosticReport.sdkLoadComplete === '통과' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{diagnosticReport.sdkLoadComplete}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span>5. 지오코더 라이브러리 검출</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${diagnosticReport.geocoderLibraryExist === '통과' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{diagnosticReport.geocoderLibraryExist}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span>6. 지도 DOM 규격 검증 (0px 여부)</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${diagnosticReport.containerHeightValid === '통과' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{diagnosticReport.containerHeightValid}</span>
                  </div>
                </div>
              </div>

              <div className="flex-grow flex flex-col min-h-0 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-400 tracking-wider">실시간 시스템 로그 단말기</h4>
                  <button onClick={() => setDebugLogs([])} className="text-[10px] text-slate-500 hover:text-white">전체 로그 비우기</button>
                </div>
                <div className="flex-grow bg-black rounded-2xl p-4 font-mono text-[11px] overflow-y-auto border border-slate-800 space-y-2 select-text">
                  {debugLogs.length === 0 && <span className="text-slate-600 block">// 대기 중인 인코딩 정보가 없습니다.</span>}
                  {debugLogs.map((log, index) => (
                    <div key={index} className="leading-normal border-b border-slate-900 pb-1.5 last:border-0">
                      <span className="text-slate-500 mr-1.5">[{log.timestamp}]</span>
                      <span className={
                        log.type === 'success' ? 'text-emerald-400' : 
                        log.type === 'error' ? 'text-rose-400 font-bold' : 
                        'text-slate-300'
                      }>{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button 
                type="button" 
                onClick={runDiagnostics}
                className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-700 transition"
              >
                🔄 진단표 새로고침
              </button>
            </div>
          </div>
        )}

        {showLoginModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] px-4 animate-fadeIn">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md relative">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-400 text-xl font-bold">✕</button>
              <h2 className="text-2xl font-black mb-6 text-slate-900 uppercase">Admin Login</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Email" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-orange-500 transition" onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-orange-500 transition" onChange={e => setPassword(e.target.value)} />
                <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-orange-500 transition transform active:scale-95">Sign In</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;