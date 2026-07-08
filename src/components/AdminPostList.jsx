// daon-frontend/src/components/AdminPostList.jsx
import React from 'react';
import { API_URL } from '../config';

const AdminPostList = ({ posts, onEdit, onDelete }) => {
  
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs font-medium space-y-2 animate-fadeIn">
        <span className="text-2xl">📂</span>
        <span>등록된 콘텐츠가 존재하지 않습니다.</span>
      </div>
    );
  }

  return (
    // 🔑 row 간의 마진(space-y)을 완벽히 제거하여 플랫하게 밀착시킵니다.
    <div className="px-1">
      {posts.map((post, idx) => {
        const imageFile = post.files?.find(f => f.type === 'image');
        const videoFile = post.files?.find(f => f.type === 'video' || f.url?.toLowerCase().endsWith('.mp4'));

        return (
          <div 
            key={post.id || idx} 
            // 🔑 사방 테두리와 상하 마진을 없애고 오직 하단 보더(border-b)만 깔끔하게 남겼습니다.
            className="group flex items-center justify-between py-2.5 px-2 bg-white border-b border-slate-100 hover:bg-slate-50/60 transition-all duration-200 last:border-b-0"
          >
            {/* 👈 좌측 영역: 80*80 모던 직사각형 썸네일 존 */}
            <div className="flex items-center gap-5 min-w-0 flex-1">
              
              {/* 🔑 w-20 h-20 (정확히 80px * 80px) 적용 및 rounded-xl로 부드러운 직사각형 마감 */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/40 flex items-center justify-center shrink-0 shadow-inner">
                {imageFile ? (
                  <img 
                    src={`${API_URL}${imageFile.url}`}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : videoFile ? (
                  <video 
                    src={`${API_URL}${videoFile.url}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    muted 
                    preload="metadata" 
                  />
                ) : (
                  // 미디어 부재 시 표현될 이니셜 스킨
                  <span className="text-sm font-black text-slate-400 uppercase">
                    {post.title?.charAt(0) || 'D'}
                  </span>
                )}
              </div>

              {/* ✏️ 중앙 영역: 타이틀 계층 정보 */}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[oklch(0.38_0.07_259.56)] truncate group-hover:text-slate-900 transition-colors">
                  {post.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                  {post.category || '일반 콘텐츠'}
                </p>
              </div>
            </div>

            {/* 👉 우측 영역: 메타 날짜 및 액션 피드백 배지 버튼 */}
            <div className="flex items-center shrink-0 pl-4">
              
              <span className="text-xs font-medium text-slate-400/90 font-mono pr-5 hidden sm:inline-block">
                {post.createdAt?.split('T')[0] || '0000-00-00'}
              </span>

              <div className="flex items-center gap-1.5 font-sans">
                <button 
                  onClick={() => onEdit(post)}
                  className="cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 active:scale-95 whitespace-nowrap"
                >
                  수정
                </button>
                <button 
                  onClick={() => onDelete(post.id)}
                  className="cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-all duration-200 active:scale-95 whitespace-nowrap"
                >
                  삭제
                </button>
              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
};

export default AdminPostList;