import React from 'react';
import { API_URL } from '../config';

const PostView = ({ post, onBack }) => {
  if (!post) return null;

  const videoFiles = post.files?.filter(f => 
    f.type === 'video' || f.url?.toLowerCase().endsWith('.mp4')
  ) || [];

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 bg-white min-h-screen animate-fadeIn">
      <button onClick={onBack} className="mb-8 text-gray-400 hover:text-orange-500 flex items-center gap-2 transition font-bold">
        ← 목록으로 돌아가기
      </button>
      <div className="mb-10 border-b border-gray-100 pb-8">
        <span className="text-orange-500 font-bold text-sm uppercase tracking-widest">{post.category}</span>
        <h1 className="text-4xl font-black text-slate-900 mt-2">{post.title}</h1>
        <p className="text-gray-400 mt-4 text-sm">{new Date(post.createdAt).toLocaleDateString()} | 다온씨엔이</p>
      </div>
      <div 
        className="prose prose-slate max-w-none mb-12 border-t pt-8"
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />

      {videoFiles.length > 0 && (
        <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-4">🎬 첨부된 동영상 재생</h3>
          <div className="grid grid-cols-1 gap-6">
            {videoFiles.map((file, idx) => (
              <div key={idx} className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border">
                <span className="text-xs font-bold text-slate-400 truncate">📎 {file.name}</span>
                <video src={`${API_URL}${file.url}`} controls className="w-full rounded-xl bg-black aspect-video shadow-md" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostView;