// daon-frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosOriginal from 'axios';
import AdminPostEditor from '../../components/AdminPostEditor';
import AdminPostList from '../../components/AdminPostList';
import MainSlideAdmin from './MainSlideAdmin';
import { API_URL } from '../../config';

// 🔑 [신규 추가] 대한민국 전화번호 하이픈 자동 포맷터 (02 서울 특수 규격 예외처리 포함)
const formatPhone = (num) => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, ''); // 숫자만 남기기
  if (cleaned.startsWith('02')) {
    return cleaned.replace(/^(\d{2})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  }
  return cleaned.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
};

// 🔑 [신규 추가] 사업자등록번호 포맷터 (3자리-2자리-5자리 국룰 매핑)
const formatBizNumber = (num) => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, '');
  return cleaned.replace(/^(\d{3})(\d{2})(\d{5})$/, '$1-$2-$3');
};

const DEBUG_ALLOWED_EMAIL = 'hello.g901@kakao.com';

const AdminDashboard = ({ 
  isLoggedIn, 
  handleLogout, 
  loggedInEmail, 
  isMapScriptLoaded, 
  posts, 
  fetchPosts, 
  activeTab, 
  setActiveTab,
  fetchGlobalCompanyInfo // 회사정보 저장 후 푸터 동기화용
}) => {
  const navigate = useNavigate();
  const [adminView, setAdminView] = useState('posts'); // 대시보드 내부 뷰 상태

  // 👤 유저(어드민 계정) 관리 상태값
  const [users, setUsers] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewRole] = useState('일반 관리자');

  const [editingUser, setEditingUser] = useState(null); 
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');       
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('일반 관리자');

  // 🏢 회사 정보 관리 상태값
  const [companyName, setCompanyName] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [bizNumber, setBizNumber] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState(''); 
  const [phone, setPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [faxNumber, setFaxNumber] = useState('');
  const [lat, setLat] = useState(37.5665); 
  const [lng, setLng] = useState(126.9780); 

  // 📝 콘텐츠 관리 상태값
  const [editingPost, setEditingPost] = useState(null);

  // 🚨 실시간 자가진단 시스템 상태값
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

  // Axios 인스턴스 (인터셉터가 적용된 기본 인스턴스 사용)
  const axiosInstance = axiosOriginal.create({ baseURL: API_URL });
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // 진단 로그 기록기
  const logDebug = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // 자가 진단 트리거
  const runDiagnostics = () => {
    logDebug('🔍 카카오맵 API 연동 자가진단을 시작합니다...', 'info');
    const apiKey = (import.meta.env?.VITE_KAKAO_MAP_KEY) || "";
    const report = {
      envKeyExist: apiKey ? '통과' : '실패',
      scriptInjected: document.getElementById('kakao-map-script') ? '통과' : '실패',
      windowKakaoExist: window.kakao ? '통과' : '실패',
      sdkLoadComplete: (window.kakao && window.kakao.maps) ? '통과' : '실패',
      geocoderLibraryExist: (window.kakao && window.kakao.maps && window.kakao.maps.services) ? '통과' : '실패',
      containerHeightValid: '판별 안 됨'
    };
    setDiagnosticReport(report);
    logDebug('자가진단 분석표가 대시보드에 성공적으로 바인딩되었습니다.', 'success');
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    fetchUsers();
    fetchLocalCompanyInfo();
  }, [isLoggedIn]);

  // 콘텐츠 탭 바뀔 때 백엔드 통신 리페치
  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  // 회사 정보 탭 진입 시 카카오맵 프리뷰 렌더링 엔진 가동
  useEffect(() => {
    if (adminView === 'company' && address && isMapScriptLoaded) {
      const initializeAdminMap = () => {
        const container = document.getElementById('admin-map');
        if (!container || !window.kakao?.maps?.services) return;

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const latitudeVal = parseFloat(result[0].y);
            const longitudeVal = parseFloat(result[0].x);
            setLat(latitudeVal);
            setLng(longitudeVal);

            const coords = new window.kakao.maps.LatLng(latitudeVal, longitudeVal);
            const map = new window.kakao.maps.Map(container, { center: coords, level: 3 });
            const marker = new window.kakao.maps.Marker({ position: coords });
            marker.setMap(map);
          }
        });
      };
      initializeAdminMap();
    }
  }, [adminView, address, isMapScriptLoaded]);

  // 백엔드 통신 함수들
  const fetchUsers = async () => {
    try { const res = await axiosInstance.get('/users'); setUsers(res.data); } catch (e) {}
  };

  const fetchLocalCompanyInfo = async () => {
    try {
      const res = await axiosInstance.get('/company');
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
      }
    } catch (e) {}
  };

  const handleAddressSearch = () => {
    if (window.daum?.Postcode) {
      new window.daum.Postcode({
        oncomplete: function(data) { setAddress(data.address); }
      }).open();
    } else {
      alert('주소 검색 서비스를 불러오는 중입니다.');
    }
  };

  const handleSaveCompanyInfo = async () => {
    try {
      await axiosInstance.post('/company', {
        name: companyName, ceo: ceoName, bizNumber, address, addressDetail, phone, email: companyEmail, fax: faxNumber, lat, lng
      });
      alert('회사 정보가 수정되었습니다.');
      if (fetchGlobalCompanyInfo) fetchGlobalCompanyInfo(); // 푸터 정보 즉시 갱신
    } catch (e) { alert('회사 정보 저장 실패'); }
  };

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) { alert('이메일과 비밀번호를 입력해 주세요.'); return; }
    try {
      await axiosInstance.post('/users', { email: newEmail, password: newPassword, name: newUserName, phone: newUserPhone, role: newUserRole });
      alert('새로운 관리자 계정이 생성되었습니다.');
      setNewEmail(''); setNewPassword(''); setNewUserName(''); setNewUserPhone(''); setNewRole('일반 관리자');
      fetchUsers();
    } catch (e) { alert('계정 생성 실패'); }
  };

  const handleUpdateUser = async () => {
    if (!editEmail) { alert('이메일은 필수입니다.'); return; }
    try {
      await axiosInstance.patch(`/users/${editingUser.id}`, {
        email: editEmail, password: editPassword || undefined, name: editName, phone: editPhone, role: editRole
      });
      alert('계정 정보가 성공적으로 수정되었습니다.');
      setEditingUser(null); setEditPassword('');
      fetchUsers();
    } catch (e) { alert('계정 수정 중 오류가 발생했습니다.'); }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen w-full relative">
      {/* sidebar 기둥 구조 프레임 */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shadow-2xl z-[100]">
        <div className="p-8"><h2 className="text-xl font-black text-orange-500 uppercase tracking-tighter">Daon CNE</h2></div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition">🏠 홈페이지 보기</button>
          <div className="h-px bg-slate-800 my-4 mx-2" />
          <button onClick={() => setAdminView('posts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'posts' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>📝 콘텐츠 관리</button>
          <button onClick={() => setAdminView('slides')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'slides' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>🎬 메인 슬라이드 관리</button>
          <button onClick={() => setAdminView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'users' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>👤 계정 관리</button>
          <button onClick={() => setAdminView('company')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${adminView === 'company' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>🏢 회사 정보 관리</button>
        </nav>
        <div className="p-6 border-t border-slate-800"><button onClick={handleLogout} className="w-full py-3 text-red-400 font-bold hover:bg-red-500/10 rounded-xl transition">로그아웃</button></div>
      </aside>

      {/* 우측 유연한 메인 조작 데스크 */}
      <main className="flex-1 p-12 relative overflow-x-hidden">
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
                <AdminPostList posts={posts} onEdit={(post) => { setEditingPost(post); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={async (id) => { if(confirm('삭제하시겠습니까?')) { await axiosInstance.delete(`/posts/${id}`); fetchPosts(); } }} />
              </div>
            </div>
          </div>
        )}

        {adminView === 'slides' && <div className="animate-fadeIn"><MainSlideAdmin /></div>}

        {/* 👤 계정 관리 뷰 */}
        {adminView === 'users' && (
          <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
            <h1 className="text-3xl font-black text-slate-800">계정 관리</h1>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              <div className="xl:col-span-5">
                {editingUser ? (
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-blue-100 space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b pb-2"><h3 className="font-black text-slate-800 text-sm">🛠️ 계정 정보 수정</h3><button onClick={() => setEditingUser(null)} className="text-xs text-slate-400 font-bold">취소</button></div>
                    <input type="text" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                    <input type="text" placeholder="이름 (별명)" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={editName} onChange={e => setEditName(e.target.value)} />
                    <input type="password" placeholder="새 비밀번호 (기존 유지 시 공백)" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
                    
                    {/* 🔑 [인풋 마스킹] 수정 모드 전화번호 입력창 */}
                    <input 
                      type="text" 
                      placeholder="연락처"
                      className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none font-mono" 
                      value={formatPhone(editPhone)} 
                      onChange={e => setEditPhone(e.target.value.replace(/\D/g, ''))} 
                    />
                    
                    <select className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={editRole} onChange={e => setEditRole(e.target.value)}>
                      <option value="일반 관리자">일반 관리자</option><option value="최고 관리자">최고 관리자</option>
                    </select>
                    <button onClick={handleUpdateUser} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold">변경 저장</button>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border space-y-4">
                    <h3 className="font-black text-slate-800 text-sm border-b pb-2">👤 신규 계정 등록</h3>
                    <input type="text" placeholder="이메일 주소" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                    <input type="password" placeholder="비밀번호" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <input type="text" placeholder="이름 (별명)" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                    
                    {/* 🔑 [인풋 마스킹] 생성 모드 전화번호 입력창 */}
                    <input 
                      type="text" 
                      placeholder="연락처"
                      className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none font-mono" 
                      value={formatPhone(newUserPhone)} 
                      onChange={e => setNewUserPhone(e.target.value.replace(/\D/g, ''))} 
                    />
                    
                    <select className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={newUserRole} onChange={e => setNewRole(e.target.value)}>
                      <option value="일반 관리자">일반 관리자</option><option value="최고 관리자">최고 관리자</option>
                    </select>
                    <button onClick={handleCreateUser} className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold">생성하기</button>
                  </div>
                )}
              </div>
              <div className="xl:col-span-7">
                <div className="bg-white rounded-[2rem] shadow-xl border overflow-hidden">
                  <div className="divide-y h-[560px] overflow-y-auto custom-scrollbar">
                    {users.map(u => (
                      <div key={u.id} className="p-6 flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{u.name ? `${u.name} [${u.email}]` : u.email}</p>
                          {/* 🔑 [출력 포맷팅] 리스트에 뿌려줄 때 formatPhone 적용 */}
                          <p className="text-xs text-slate-400 mt-0.5">{formatPhone(u.phone) || '연락처 없음'} — <span className="text-orange-500 font-bold">{u.role}</span></p>
                        </div>
                        <div className="flex gap-4 text-xs font-bold">
                          <button onClick={() => { setEditingUser(u); setEditEmail(u.email); setEditName(u.name || ''); setEditPhone(u.phone || ''); setEditRole(u.role || '일반 관리자'); }} className="text-blue-500">수정</button>
                          <button onClick={async () => { if(confirm('삭제하시겠습니까?')) { await axiosInstance.delete(`/users/${u.id}`); fetchUsers(); } }} className="text-red-400">삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🏢 회사 정보 관리 뷰 */}
        {adminView === 'company' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div><h1 className="text-3xl font-black text-slate-800 tracking-tighter">회사 정보 관리</h1></div>
              {isSuperAdmin && <button onClick={() => { setShowDebugPanel(!showDebugPanel); runDiagnostics(); }} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">🚨 카카오맵 자가진단기 {showDebugPanel ? '닫기' : '켜기'}</button>}
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="회사명" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                <input type="text" placeholder="대표자명" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={ceoName} onChange={e => setCeoName(e.target.value)} />
                
                {/* 🔑 [인풋 마스킹] 회사 사업자등록번호 입력창 */}
                <input 
                  type="text" 
                  placeholder="사업자 번호" 
                  className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none font-mono" 
                  value={formatBizNumber(bizNumber)} 
                  onChange={e => setBizNumber(e.target.value.replace(/\D/g, ''))} 
                />
                
                {/* 🔑 [인풋 마스킹] 회사 대표전화 입력창 */}
                <input 
                  type="text" 
                  placeholder="대표 전화" 
                  className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none font-mono" 
                  value={formatPhone(phone)} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                />
                
                <input type="text" placeholder="이메일" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} />
                <input type="text" placeholder="팩스 번호" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={faxNumber} onChange={e => setFaxNumber(e.target.value)} />
                <div className="md:col-span-2 flex gap-3">
                  <input type="text" readOnly placeholder="도로명 주소" className="flex-1 px-5 py-3 bg-gray-50 border rounded-2xl" value={address} />
                  <button onClick={handleAddressSearch} className="px-5 bg-slate-800 text-white rounded-2xl text-xs font-bold">주소 검색</button>
                </div>
                <input type="text" placeholder="상세 주소" className="md:col-span-2 w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={addressDetail} onChange={e => setAddressDetail(e.target.value)} />
                <div className="md:col-span-2 pt-2">
                  <div id="admin-map" className="w-full h-64 bg-slate-100 rounded-2xl border shadow-inner relative z-10" />
                </div>
              </div>
              <div className="flex justify-end border-t pt-4"><button onClick={handleSaveCompanyInfo} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md">정보 수정하기</button></div>
            </div>
          </div>
        )}
      </main>

      {/* 🚨 실시간 진단 사이드 오버레이 패널 */}
      {isSuperAdmin && showDebugPanel && adminView === 'company' && (
        <div className="w-80 bg-slate-950 text-slate-100 h-screen sticky top-0 p-6 flex flex-col justify-between z-[150]">
          <div className="space-y-4">
            <h3 className="font-black text-xs text-emerald-400">// 하드웨어 체크표</h3>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between"><span>API Key 검출:</span><span>{diagnosticReport.envKeyExist}</span></div>
              <div className="flex justify-between"><span>Script 주입:</span><span>{diagnosticReport.scriptInjected}</span></div>
              <div className="flex justify-between"><span>window.kakao:</span><span>{diagnosticReport.windowKakaoExist}</span></div>
            </div>
          </div>
          <button onClick={() => setShowDebugPanel(false)} className="w-full bg-slate-800 py-2.5 text-xs rounded-xl font-bold">대시보드 종료</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;