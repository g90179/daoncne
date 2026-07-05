import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HomeView from './components/HomeView';
import AdminPostEditor from './components/AdminPostEditor';
import AdminPostList from './components/AdminPostList';
import { API_URL } from './config';
import 'ckeditor5/ckeditor5.css';

// ⚙️ [Vite / CRA 자동 대응] 환경 변수(.env)에서 카카오맵 키를 안전하게 로드합니다.
const KAKAO_MAP_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_KAKAO_MAP_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_KAKAO_MAP_KEY) ||
  ""; 

function App() {
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

  // 회사 정보 입력을 위한 독립 상태 변수들
  const [companyName, setCompanyName] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [bizNumber, setBizNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [faxNumber, setFaxNumber] = useState('');
  
  // 카카오맵 연동을 위한 위도 및 경도 좌표 상태 변수
  const [lat, setLat] = useState(37.5665); // 기본값: 서울시청 위도
  const [lng, setLng] = useState(126.9780); // 기본값: 서울시청 경도

  // 카카오맵 및 우편번호 스크립트 동적 로드 이펙트
  useEffect(() => {
    if (!KAKAO_MAP_KEY) {
      console.warn('카카오맵 API 키가 환경 변수에 정의되지 않았습니다. .env 파일을 확인해 주세요.');
    }

    if (!document.getElementById('kakao-map-script')) {
      const script = document.createElement('script');
      script.id = 'kakao-map-script';
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=services&autoload=false`;
      document.head.appendChild(script);
      script.onload = () => {
        window.kakao.maps.load(() => {
          console.log('Kakao Map SDK loaded successfully.');
        });
      };
    }

    if (!document.getElementById('daum-postcode-script')) {
      const script = document.createElement('script');
      script.id = 'daum-postcode-script';
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
      fetchCompanyInfo(); 
    }
    fetchPosts();
  }, [isLoggedIn, activeTab]);

  // 회사 정보 관리용 탭 활성화 시 또는 주소 변경 시 지도 프리뷰 처리
  useEffect(() => {
    if (adminView === 'company' && address) {
      const initializeAdminMap = () => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          
          // 주소를 기반으로 위도/경도 좌표 검색 실행
          geocoder.addressSearch(address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const latitudeVal = parseFloat(result[0].y);
              const longitudeVal = parseFloat(result[0].x);
              
              setLat(latitudeVal);
              setLng(longitudeVal);

              const coords = new window.kakao.maps.LatLng(latitudeVal, longitudeVal);
              const mapContainer = document.getElementById('admin-map');
              
              if (mapContainer) {
                const mapOption = { center: coords, level: 3 };
                const map = new window.kakao.maps.Map(mapContainer, mapOption);
                const marker = new window.kakao.maps.Marker({ position: coords });
                marker.setMap(map);
              }
            }
          });
        }
      };

      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        initializeAdminMap();
      } else {
        const timer = setTimeout(initializeAdminMap, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [adminView, address]);

  const fetchUsers = async () => { try { const res = await axios.get(`${API_URL}/users`); setUsers(res.data); } catch (e) {} };
  
  const fetchPosts = async () => {
    const categoryParam = activeTab === '전체' ? '' : activeTab;
    const response = await axios.get(`${API_URL}/posts?category=${categoryParam}`);
    setPosts(response.data);
  };
  
  // 백엔드에서 기존 저장된 회사 정보 및 좌표 가져오기
  const fetchCompanyInfo = async () => {
    try {
      const res = await axios.get(`${API_URL}/company`);
      if (res.data) {
        setCompanyName(res.data.name || '');
        setCeoName(res.data.ceo || '');
        setBizNumber(res.data.bizNumber || '');
        setAddress(res.data.address || '');
        setPhone(res.data.phone || '');
        setCompanyEmail(res.data.email || '');
        setFaxNumber(res.data.fax || '');
        // 백엔드 스키마에서 동기화된 좌표 바인딩
        if (res.data.lat) setLat(parseFloat(res.data.lat));
        if (res.data.lng) setLng(parseFloat(res.data.lng));
      }
    } catch (e) {
      console.log('기존 등록된 회사 정보가 없거나 연결되지 않았습니다.');
    }
  };

  // 다음 우편번호 팝업 호출 함수
  const handleAddressSearch = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function(data) {
          setAddress(data.address); // 주소창 반영 및 트리거 작동
        }
      }).open();
    } else {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  // 회사 정보 및 추출된 좌표 데이터베이스 통합 저장/업데이트 요청 함수
  const handleSaveCompanyInfo = async () => {
    try {
      await axios.post(`${API_URL}/company`, {
        name: companyName,
        ceo: ceoName,
        bizNumber: bizNumber,
        address: address,
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

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.access_token);
      setIsLoggedIn(true); setAdminView('posts'); setShowLoginModal(false);
    } catch (e) { alert('로그인 실패'); }
  };
  
  const handleLogout = () => { localStorage.removeItem('token'); setIsLoggedIn(false); setAdminView('home'); };
  
  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) { alert('이메일과 비밀번호를 모두 입력해 주세요.'); return; }
    try {
      await axios.post(`${API_URL}/users`, { email: newEmail, password: newPassword });
      alert('계정이 성공적으로 생성되었습니다.');
      setNewEmail(''); setNewPassword(''); fetchUsers();
    } catch (e) { alert('계정 생성에 실패했습니다.'); }
  };

  // 좌측 사이드바 내비게이션
  const Sidebar = () => (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shadow-2xl">
      <div className="p-8"><h2 className="text-xl font-black text-orange-500 uppercase tracking-tighter">Daon CNE</h2></div>
      <nav className="flex-1 px-4 space-y-2">
        <button onClick={() => setAdminView('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'home' ? 'bg-slate-700' : 'text-slate-400 hover:bg-slate-800'}`}>🏠 홈페이지 보기</button>
        <div className="h-px bg-slate-800 my-4 mx-2" />
        <button onClick={() => setAdminView('posts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'posts' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>📝 콘텐츠 관리</button>
        <button onClick={() => setAdminView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'users' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>👤 계정 관리</button>
        <button 
          onClick={() => setAdminView('company')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'company' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          🏢 회사 정보 관리
        </button>
      </nav>
      <div className="p-6 border-t border-slate-800"><button onClick={handleLogout} className="w-full py-3 text-red-400 font-bold hover:bg-red-500/10 rounded-xl transition">로그아웃</button></div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {isLoggedIn && adminView !== 'home' && <Sidebar />}

      <div className="flex-1 overflow-x-hidden">
        {adminView === 'home' ? (
          <HomeView 
            posts={posts}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isLoggedIn={isLoggedIn}
            setAdminView={setAdminView}
            setShowLoginModal={setShowLoginModal}
            selectedPost={selectedPost}
            setSelectedPost={setSelectedPost}
            companyInfo={{
              name: companyName,
              ceo: ceoName,
              bizNumber,
              address,
              phone,
              email: companyEmail,
              fax: faxNumber,
              lat,
              lng
            }}
          />
        ) : (
          <main className="p-12">
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
                    <AdminPostList posts={posts} onEdit={(post) => { setEditingPost(post); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={async (id) => { if(confirm('삭제하시겠습니까?')) { await axios.delete(`${API_URL}/posts/${id}`); fetchPosts(); } }} />
                  </div>
                </div>
              </div>
            )}
            
            {adminView === 'users' && (
              <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
                <h1 className="text-3xl font-black text-slate-800">계정 관리</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border"><h3 className="font-bold mb-6 text-slate-800">👤 신규 계정 등록</h3>
                    <div className="space-y-4">
                      <input type="text" placeholder="Email" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                      <input type="password" placeholder="Password" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      <button onClick={handleCreateUser} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black hover:bg-blue-800 transition shadow-lg">계정 생성</button>
                    </div>
                  </div>
                  <div className="bg-white rounded-[2.5rem] shadow-xl border overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b font-bold text-xs uppercase text-gray-400 tracking-widest text-center">Admin List</div>
                    <div className="divide-y h-[400px] overflow-y-auto">
                      {users.map(u => (
                        <div key={u.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition">
                          <p className="font-bold text-slate-700">{u.email}</p>
                          <button onClick={async () => { if(confirm('삭제?')) { await axios.delete(`${API_URL}/users/${u.id}`); fetchUsers(); } }} className="text-red-400 font-bold text-xs">삭제</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🏢 회사 정보 관리 통합 마크업 페이지 */}
            {adminView === 'company' && (
              <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tighter">회사 정보 관리</h1>
                  <p className="text-slate-400 mt-1 uppercase text-xs font-bold">Manage company settings and metadata</p>
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
        )}
      </div>

      {/* 로그인 모달 */}
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
  );
}

export default App;