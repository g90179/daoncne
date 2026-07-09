// daon-frontend/src/pages/admin/AdminPostAdmin.jsx
import React, { useState, useEffect } from 'react';
import axiosOriginal from 'axios';
import AdminPostEditor from '../../components/AdminPostEditor';
import AdminPostList from '../../components/AdminPostList';
import MobileUploadModal from '../../components/MobileUploadModal';
import Pagination from '../../components/Pagination';
import { API_URL } from '../../config';

const AdminPostAdmin = ({ posts, fetchPosts, activeTab, setActiveTab }) => {
  const [editingPost, setEditingPost] = useState(null);
  const [postPage, setPostPage] = useState(1);
  
  // 🚀 [추가] 모바일 업로드 모달 상태 관리
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const POSTS_PER_PAGE = 9;

  const axiosInstance = axiosOriginal.create({ baseURL: API_URL });
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // 💡 기존 로컬스토리지 키 'token' 유지
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // 탭 변경 시 페이지 1로 초기화 및 데이터 리페치
  useEffect(() => {
    setPostPage(1);
    fetchPosts();
  }, [activeTab]);

  const totalPostPages = Math.ceil((posts || []).length / POSTS_PER_PAGE);
  const currentPosts = (posts || []).slice((postPage - 1) * POSTS_PER_PAGE, postPage * POSTS_PER_PAGE);

  // 🚀 [추가] 모바일 전용 초고속 사진/글 업로드 API 호출 함수
  const handleMobileUpload = async ({ file, content }) => {
    try {
      const formData = new FormData();
      
      // 1. 파일 세팅 (백엔드 컨트롤러에 맞춰 'image' 또는 'file'로 이름 확인 필요)
      if (file) {
        formData.append('image', file, file.name || 'mobile-upload.jpg');
      }
      
      // 2. 내용 및 제목 세팅
      formData.append('content', content);
      const title = content.length > 15 ? content.substring(0, 15) + '...' : content || '모바일 업로드';
      formData.append('title', title);
      
      // 3. 현재 보고 있는 탭(현장사진 등)을 카테고리로 지정
      formData.append('category', activeTab || '현장사진');

      // 인터셉터가 토큰을 알아서 넣어주므로, 여기서는 파일 타입 헤더만 추가하면 됩니다.
      await axiosInstance.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      alert('모바일 업로드가 성공적으로 완료되었습니다! 🎉');
      
      // 업로드 성공 후 모달 닫기 및 리스트 새로고침
      setIsUploadModalOpen(false);
      fetchPosts(); 

    } catch (error) {
      console.error('모바일 업로드 실패:', error);
      alert('업로드 중 오류가 발생했습니다. 권한이나 서버 상태를 확인해 주세요.');
    }
  };

  return (
    <div className="max-w-12xl mx-auto animate-fadeIn relative">
      
      {/* 🔄 [1:1 대칭 매칭] 그리드 너비 6:6 분할 및 높이 h-[850px] 락업 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* 👈 좌측: 콘텐츠 목록 카드 */}
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.02)] border border-white/70 flex flex-col justify-between h-[850px] transition-all duration-500">
          
          <div>
            {/* 카테고리 바 영역 */}
            <div className="mb-6 flex justify-center sm:justify-start">
              <div className="bg-slate-200/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60 flex gap-1 shadow-inner w-full sm:w-auto">
                {['현장사진', '공사실적', '보유장비'].map(tab => {
                  const isTabActive = activeTab === tab;
                  return (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)} 
                      // 🔑 활성화 시 기존 다크 스킨에서 명품 무드의 bg-blue-400 컬러 플레이로 변경 조치
                      className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                        isTabActive 
                          ? 'bg-blue-400 text-white shadow-lg shadow-blue-400/20 scale-[1.02]' 
                          : 'text-slate-400 hover:text-slate-700 hover:bg-white/40'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 📜 스크롤이 구동되는 리스트 순수 본문 존 */}
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 mb-4">
            <AdminPostList 
              posts={currentPosts} 
              onEdit={(post) => { setEditingPost(post); }} 
              onDelete={async (id) => { 
                if(confirm('삭제하시겠습니까?')) { 
                  await axiosInstance.delete(`/posts/${id}`); 
                  fetchPosts(); 
                } 
              }} 
            />
          </div>

          {/* 하단 페이징 제어판 */}
          <div className="pt-4 border-t border-slate-100/60">
            <Pagination currentPage={postPage} totalPages={totalPostPages} onPageChange={setPostPage} />
          </div>
        </div>

        {/* 👉 우측: 에디터 폼 컴포넌트 박스 */}
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.02)] border border-white/70 h-[850px] overflow-y-auto custom-scrollbar transition-all duration-500">
          <AdminPostEditor 
            editingPost={editingPost} 
            onCancel={() => setEditingPost(null)} 
            onSuccess={() => { setEditingPost(null); fetchPosts(); }} 
          />
        </div>
        
      </div>

      {/* 🚀 콘텐츠 관리용 모바일 플로팅 메뉴 (FAB) & 업로드 모달 */}
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
      
    </div>
  );
};

export default AdminPostAdmin;