import React from 'react';
import { API_URL } from '../config';

// ✨ [신규] 확장자 기반 파일 타입 아이콘/라벨 매핑
const getFileTypeInfo = (fileName = '', fileUrl = '') => {
  const ext = (fileName.split('.').pop() || fileUrl.split('.').pop() || '').toLowerCase();

  const map = {
    pdf:  { icon: '📕', label: 'PDF' },
    doc:  { icon: '📘', label: 'DOC' },
    docx: { icon: '📘', label: 'DOC' },
    xls:  { icon: '📗', label: 'XLS' },
    xlsx: { icon: '📗', label: 'XLS' },
    ppt:  { icon: '📙', label: 'PPT' },
    pptx: { icon: '📙', label: 'PPT' },
    zip:  { icon: '🗜️', label: 'ZIP' },
    rar:  { icon: '🗜️', label: 'RAR' },
    '7z': { icon: '🗜️', label: '7Z' },
    txt:  { icon: '📄', label: 'TXT' },
    hwp:  { icon: '📄', label: 'HWP' },
  };

  return map[ext] || { icon: '📎', label: ext ? ext.toUpperCase() : 'FILE' };
};

const PostView = ({ post, onBack }) => {
  if (!post) return null;

  const videoFiles = post.files?.filter(f => 
    f.type === 'video' || f.url?.toLowerCase().endsWith('.mp4')
  ) || [];

  // ✨ [신규] 이미지·영상·에디터 썸네일을 제외한 일반 첨부파일만 추출
  const attachmentFiles = post.files?.filter(f => 
    f.type !== 'image' && f.type !== 'video' && f.name !== 'editor_thumbnail'
    && !f.url?.toLowerCase().endsWith('.mp4')
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

      {/* ✨ [신규] 첨부파일 카드 목록 (본문 상단) */}
      {attachmentFiles.length > 0 && (
        <div className="mb-10 space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">📎 첨부파일 ({attachmentFiles.length})</h3>
          {attachmentFiles.map((file, idx) => {
            const { icon, label } = getFileTypeInfo(file.name, file.url);
            return (
              
                key={file.id || idx}
                href={`${API_URL}${file.url}`}
                target="_blank"
                rel="noopener noreferrer"
                download={file.name}
                className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl px-5 py-3.5 transition-colors group"
              >
                <span className="text-2xl shrink-0">{icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-orange-500 transition-colors">
                    {file.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
                <span className="text-slate-300 group-hover:text-orange-400 transition-colors shrink-0 text-lg">↓</span>
              </a>
            );
          })}
        </div>
      )}

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