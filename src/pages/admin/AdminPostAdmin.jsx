// daon-frontend/src/pages/admin/AdminPostAdmin.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { API_URL } from '../../config';
import AdminPostEditor from '../../components/AdminPostEditor';
import AdminPostList from '../../components/AdminPostList';
import MobileUploadModal from '../../components/MobileUploadModal';
import Pagination from '../../components/Pagination';

const AdminPostAdmin = ({ posts, fetchPosts, activeTab, setActiveTab }) => {
  const [editingPost, setEditingPost] = useState(null);
  const [postPage, setPostPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const POSTS_PER_PAGE = 9;

  useEffect(() => {
    setPostPage(1);
    fetchPosts();
  }, [activeTab]);

  const totalPostPages = Math.ceil((posts || []).length / POSTS_PER_PAGE);
  const currentPosts = (posts || []).slice((postPage - 1) * POSTS_PER_PAGE, postPage * POSTS_PER_PAGE);

  // 🔑 모바일 업로드 시 이미지 파일이 항상 첫 번째(썸네일)로 오도록 정렬하여 전송
  const handleMobileUpload = async ({
    files,
    title,
    content,
    clientName,
    workYear,
    workMonth,
    workAddress,
    workLat,
    workLng,
    keywords,
    additionalFiles,
    thumbnailUrl, // ✨ [신규]
  }) => {
    try {
      const formData = new FormData();

      if (files && files.length > 0) {
        const sortedFiles = [...files].sort((a, b) => {
          const isAImage = a.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.name || '');
          const isBImage = b.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(b.name || '');
          if (isAImage && !isBImage) return -1;
          if (!isAImage && isBImage) return 1;
          return 0;
        });

        sortedFiles.forEach(f => {
          formData.append('files', f, f.name || 'mobile-upload.jpg');
        });
      }

      if (additionalFiles && additionalFiles.length > 0) {
        additionalFiles.forEach(f => formData.append('files', f, f.name));
      }

      formData.append('content', content || '');
      formData.append('title', title || (content.length > 15 ? content.substring(0, 15) + '...' : '포트폴리오'));
      formData.append('category', activeTab || '현장사진');

      formData.append('clientName', clientName || '');
      formData.append('workAddress', workAddress || '');
      if (workLat != null) formData.append('workLat', String(workLat));
      if (workLng != null) formData.append('workLng', String(workLng));
      if (workYear) formData.append('workYear', workYear);
      if (workMonth) formData.append('workMonth', workMonth);
      formData.append('keywords', JSON.stringify(keywords || []));

      // ✨ [신규] 모바일에서 명시적으로 지정한 썸네일 URL 전달
      if (thumbnailUrl) formData.append('thumbnailUrl', thumbnailUrl);

      if (editingPost) {
        await api.patch(`/posts/${editingPost.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('포트폴리오가 성공적으로 수정되었습니다! 🎉');
      } else {
        await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('포트폴리오가 성공적으로 등록되었습니다! 🎉');
      }
      
      setIsUploadModalOpen(false);
      setEditingPost(null);
      fetchPosts(); 
    } catch (error) {
      console.error('포트폴리오 저장 실패:', error);
      alert('처리 실패: ' + (error.response?.data?.message || '권한을 확인하세요.'));
    }
  };

  return (
    <div className="max-w-12xl mx-auto animate-fadeIn relative space-y-6">
      
      <div className="flex xl:hidden justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="text-xs font-bold text-slate-500">
          현재 카테고리: <span className="text-blue-500 font-black">{activeTab}</span>
        </div>
        <button
          onClick={() => { setEditingPost(null); setIsUploadModalOpen(true); }}
          className="bg-neutral-900 text-white hover:bg-blue-500 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <span>✍️</span> 새 글쓰기
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.02)] border border-white/70 flex flex-col justify-between h-[85vh] transition-all duration-500">
          <div>
            <div className="mb-6 flex justify-center sm:justify-start">
              <div className="bg-slate-200/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60 flex gap-1 shadow-inner w-full sm:w-auto">
                {['현장사진', '공사실적', '보유장비'].map(tab => {
                  const isTabActive = activeTab === tab;
                  return (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)} 
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

          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 mb-4">
            <AdminPostList 
              posts={currentPosts} 
              onEdit={(post) => { 
                setEditingPost(post); 
                if (window.innerWidth < 1280) {
                  setIsUploadModalOpen(true);
                }
              }} 
              onDelete={async (id) => { 
                if(confirm('삭제하시겠습니까?')) { 
                  await api.delete(`/posts/${id}`); 
                  fetchPosts(); 
                } 
              }} 
            />
          </div>

          <div className="pt-4 border-t border-slate-100/60">
            <Pagination currentPage={postPage} totalPages={totalPostPages} onPageChange={setPostPage} />
          </div>
        </div>

        <div className="hidden xl:flex bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.02)] border border-white/70 h-[85vh] overflow-y-auto custom-scrollbar flex-col transition-all duration-500">
          <AdminPostEditor 
            editingPost={editingPost} 
            onCancel={() => setEditingPost(null)} 
            onSuccess={() => { setEditingPost(null); fetchPosts(); }} 
          />
        </div>
      </div>

      <button
        onClick={() => { setEditingPost(null); setIsUploadModalOpen(true); }}
        className="hidden xl:flex fixed bottom-12 right-12 w-16 h-16 bg-neutral-900 text-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.3)] items-center justify-center text-3xl font-light hover:scale-105 active:scale-95 transition-transform z-[150] cursor-pointer"
        title="새 콘텐츠 등록"
      >
        +
      </button>

      <MobileUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => { setIsUploadModalOpen(false); setEditingPost(null); }} 
        onUpload={handleMobileUpload}
        editingPost={editingPost}
      />
      
    </div>
  );
};

export default AdminPostAdmin;