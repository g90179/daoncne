// daon-frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPostAdmin from './AdminPostAdmin';
import MainSlideAdmin from './MainSlideAdmin';
import AdminUserAdmin from './AdminUserAdmin';
import AdminCompanyAdmin from './AdminCompanyAdmin';
import AdminPolicyAdmin from './AdminPolicyAdmin'; // 정책 관리 컴포넌트

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
  fetchGlobalCompanyInfo
}) => {
  const navigate = useNavigate();
  const [adminView, setAdminView] = useState('posts'); 
  const isSuperAdmin = loggedInEmail === DEBUG_ALLOWED_EMAIL;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn]);

  // 🔑 Welcome 자리를 대체할 내비게이션용 동적 텍스트 매핑 딕셔너리
  const viewTitles = {
    posts: '콘텐츠 관리',
    slides: '메인 슬라이드 관리',
    users: '계정 관리',
    company: '회사 정보 관리',
    policies: '정책 관리'
  };

  return (
    <div className="flex bg-[#eef2f7] min-h-screen w-full relative font-sans antialiased text-slate-800 tracking-tight">
      
      {/* 왼쪽 사이드바 컬럼 */}
      <aside className="w-24 md:w-64 bg-white/70 backdrop-blur-md flex flex-col h-screen sticky top-0 border-r border-slate-200/50 p-6 justify-between z-[100] transition-all">
        <div className="space-y-8">
          <div className="px-3 py-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-sm font-black tracking-widest text-slate-900 uppercase hidden md:inline-block">
              daon<span className="text-orange-500">.cne</span>
            </span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'posts', label: '콘텐츠 관리', icon: '📝' },
              { id: 'slides', label: '메인 슬라이드', icon: '🎬' },
              { id: 'users', label: '계정 관리', icon: '👤' },
              { id: 'company', label: '회사 정보 관리', icon: '🏢' },
              { id: 'policies', label: '정책 관리', icon: '📋' },
            ].map((menu) => {
              const isActive = adminView === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setAdminView(menu.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-lg shadow-slate-900/10 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="text-base">{menu.icon}</span>
                  <span className="hidden md:inline-block font-semibold tracking-wide">{menu.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-100">
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-4 px-4 py-3 text-xs font-bold text-slate-400 hover:text-slate-700 transition cursor-pointer text-left">
            <span>🏠</span><span className="hidden md:inline-block">홈페이지</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-50 rounded-2xl transition cursor-pointer text-left">
            <span>🔓</span><span className="hidden md:inline-block">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 우측 메인 오퍼레이션 보드 */}
      <main className="flex-1 p-6 md:p-12 relative overflow-x-hidden flex flex-col space-y-6">
        
        {/* 🔑 [구조 변경] Welcome 자리에 실시간 내비게이션 인덱서 연동 */}
        <div className="flex justify-between items-center px-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono flex items-center gap-1.5">
              <span>Floor Main</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-black">{viewTitles[adminView]}</span>
            </div>
            {/* 🔑 이 자리에 콘텐츠 관리 등 대형 타이틀 전면 주입 */}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
              {viewTitles[adminView]}
            </h1>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-white/40 border border-white/60 px-4 py-2 rounded-2xl shadow-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* 하단 투명 글래스 패널 컨테이너 */}
        <div className="flex-1">
          {adminView === 'posts' && (
            <AdminPostAdmin 
              posts={posts} 
              fetchPosts={fetchPosts} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          )}
          {adminView === 'slides' && <MainSlideAdmin />}
          {adminView === 'users' && <AdminUserAdmin />}
          {adminView === 'company' && (
            <AdminCompanyAdmin 
              isSuperAdmin={isSuperAdmin} 
              isMapScriptLoaded={isMapScriptLoaded} 
              fetchGlobalCompanyInfo={fetchGlobalCompanyInfo} 
            />
          )}
          {adminView === 'policies' && <AdminPolicyAdmin />}
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;