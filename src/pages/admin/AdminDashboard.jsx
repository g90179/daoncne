// daon-frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPostAdmin from './AdminPostAdmin';
import MainSlideAdmin from './MainSlideAdmin';
import AdminUserAdmin from './AdminUserAdmin';
import AdminCompanyAdmin from './AdminCompanyAdmin';
import AdminPolicyAdmin from './AdminPolicyAdmin'; 
import MobileUploadModal from '../../components/MobileUploadModal';
import api from '../../api/axios'; // 🔑 통합된 API 인스턴스 사용

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const isSuperAdmin = loggedInEmail === DEBUG_ALLOWED_EMAIL;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const viewTitles = {
    posts: '콘텐츠 관리',
    slides: '메인 슬라이드 관리',
    users: '계정 관리',
    company: '회사 정보 관리',
    policies: '정책 관리'
  };

  // 🚀 모바일 전용 초고속 사진/글 업로드 API 호출 함수 (백엔드 스펙 매칭 완료)
  const handleMobileUpload = async ({ file, content }) => {
    try {
      const formData = new FormData();

      // 1. 텍스트 데이터 셋팅
      const title = content.length > 15 ? content.substring(0, 15) + '...' : content || '모바일 포트폴리오';
      formData.append('title', title);
      formData.append('content', content || ''); 
      formData.append('category', activeTab || 'portfolio');

      // 2. 파일 데이터 셋팅 
      // 🚨 백엔드 FilesInterceptor('files') 스펙에 맞추어 키 이름을 반드시 'files'로 지정해야 합니다.
      if (file) {
        formData.append('files', file, file.name || 'mobile-media.jpg');
      }

      // 3. 백엔드 /posts 로 한 번에 전송 (multipart/form-data)
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('포트폴리오가 성공적으로 업로드되었습니다! 🎉');
      if (fetchPosts) fetchPosts(); 
    } catch (error) {
      console.error('포트폴리오 모바일 업로드 실패:', error);
      alert('업로드 중 문제가 발생했습니다. 권한이나 세션을 확인해 주세요.');
    }
  };

  return (
    <div className="flex bg-[#eef2f7] min-h-screen w-full relative font-sans antialiased text-slate-800 tracking-tight">
      
      {/* 사이드바 */}
      <aside className="w-24 md:w-64 bg-white/70 backdrop-blur-md flex flex-col h-screen sticky top-0 border-r border-slate-200/50 p-6 justify-between z-[100] transition-all">
        <div className="space-y-8">
          <div className="px-3 py-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-sm font-black tracking-widest text-slate-900 uppercase hidden md:inline-block">
              daon<span className="text-orange-500">.cne</span>
            </span>
          </div>

          <nav className="space-y-2">
            <button onClick={() => window.location.href = '/'} 
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer text-left text-slate-400 hover:text-slate-700 hover:bg-slate-100/50">
              <span className="text-base">🏠</span>
              <span className="hidden md:inline-block font-semibold tracking-wide">홈페이지</span>
            </button>
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
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-50 rounded-2xl transition cursor-pointer text-left">
            <span>🔓</span><span className="hidden md:inline-block">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 보드 */}
      <main className="flex-1 p-6 md:p-12 relative overflow-x-hidden flex flex-col space-y-6">
        <div className="flex justify-between items-center px-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono flex items-center gap-1.5">
              <span>Floor Main</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-black">{viewTitles[adminView]}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
              {viewTitles[adminView]}
            </h1>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-white/40 border border-white/60 px-4 py-2 rounded-2xl shadow-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

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

      {adminView === 'posts' && (
        <>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-14 h-14 md:w-16 md:h-16 bg-neutral-900 text-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.3)] flex items-center justify-center text-3xl font-light hover:scale-105 active:scale-95 transition-transform z-[150]"
          >
            +
          </button>

          <MobileUploadModal 
            isOpen={isUploadModalOpen} 
            onClose={() => setIsUploadModalOpen(false)} 
            onUpload={handleMobileUpload}
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;