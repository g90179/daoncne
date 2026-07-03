// import React from 'react';
import { API_URL } from '../config';

const AdminPostList = ({ posts, onEdit, onDelete }) => (
  <div className="space-y-4 mt-8">
    <h3 className="text-xl font-black text-slate-800 mb-6">콘텐츠 관리 목록</h3>
    {posts.map(post => {
      const imageFile = post.files?.find(f => f.type === 'image');
      const videoFile = post.files?.find(f => f.type === 'video' || f.url?.toLowerCase().endsWith('.mp4'));

      return (
        <div key={post.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex gap-6 items-center hover:shadow-md transition group">
          <div className="w-32 h-24 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 relative">
            {imageFile ? (
              <img src={`${API_URL}${imageFile.url}`} className="w-full h-full object-cover" alt="" />
            ) : videoFile ? (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                <video src={`${API_URL}${videoFile.url}`} className="w-full h-full object-cover opacity-60" muted preload="metadata" />
                <span className="absolute text-[9px] font-black bg-black/60 text-white px-1.5 py-0.5 rounded">VIDEO</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 font-bold">NO IMAGE</div>
            )}
          </div>
          <div className="flex-grow">
            <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-bold">{post.category}</span>
            <h4 className="text-lg font-black text-slate-800 mt-1 line-clamp-1">{post.title}</h4>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(post)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition">수정</button>
            <button onClick={() => onDelete(post.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition">삭제</button>
          </div>
        </div>
      );
    })}
  </div>
);

export default AdminPostList;