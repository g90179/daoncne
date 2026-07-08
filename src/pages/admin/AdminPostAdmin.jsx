// daon-frontend/src/pages/admin/AdminPostAdmin.jsx
import React, { useState, useEffect } from 'react';
import axiosOriginal from 'axios';
import AdminPostEditor from '../../components/AdminPostEditor';
import AdminPostList from '../../components/AdminPostList';
import Pagination from '../../components/Pagination';
import { API_URL } from '../../config';

const AdminPostAdmin = ({ posts, fetchPosts, activeTab, setActiveTab }) => {
  const [editingPost, setEditingPost] = useState(null);
  const [postPage, setPostPage] = useState(1);
  const POSTS_PER_PAGE = 9;

  const axiosInstance = axiosOriginal.create({ baseURL: API_URL });
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
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

  return (
    <div className="max-w-12xl mx-auto animate-fadeIn">
      
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
    </div>
  );
};

export default AdminPostAdmin;