// daon-frontend/src/pages/PortfolioDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/axios';
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

const PortfolioDetail = () => {
  const { id } = useParams(); // URL의 :id 값을 가져옵니다
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        setNotFound(true);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // HTML 태그 제거 함수 (Meta Description 용)
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  // ✨ [신규] 이미지·영상·에디터 썸네일을 제외한 일반 첨부파일만 추출
  const attachmentFiles = post?.files?.filter(f =>
    f.type !== 'image' && f.type !== 'video' && f.name !== 'editor_thumbnail'
    && !f.url?.toLowerCase().endsWith('.mp4')
  ) || [];

  const BackButton = () => (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-[11px] font-bold bg-neutral-50 hover:bg-neutral-100 hover:text-blue-500 text-neutral-500 px-4 py-2.5 rounded-xl border border-neutral-200/50 transition-all duration-200 cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      <span>목록으로 돌아가기</span>
    </button>
  );

  return (
    <>
      {post && (
        <Helmet>
          <title>{post.title} | 다온씨엔이(DAON C&E)</title>
          <meta name="description" content={stripHtml(post.content).substring(0, 150)} />
          <meta property="og:title" content={`${post.title} | 다온씨엔이`} />
          <meta property="og:description" content={stripHtml(post.content).substring(0, 150)} />
        </Helmet>
      )}

      <div className="w-full bg-slate-50 min-h-screen text-neutral-900 font-sans antialiased selection:bg-blue-500/10 selection:text-blue-600">

        {/* 🌌 상단 프리미엄 미니멀 헤더 플레이트 */}
        <header className="bg-white border-b border-neutral-200/60 pt-32 pb-10 px-4 md:px-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
            <div className="absolute top-12 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <div className="text-[10px] tracking-widest font-black text-blue-500 uppercase font-mono bg-blue-50 px-3 py-1 rounded-full inline-block">
              {post?.category || 'Portfolio'}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[oklch(0.38_0.07_259.56)] tracking-tight">
              {isLoading ? '불러오는 중...' : notFound ? '게시물을 찾을 수 없습니다' : post.title}
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 font-medium tracking-wide">
              다온씨엔이가 진행한 프로젝트와 시공 사례를 소개합니다.
            </p>

            {/* 🧾 정보 + 목록 버튼: 헤더 내부, 설명 문구 하단, 세로 중앙 정렬 */}
            {post && (
              <div className="pt-6 mt-3 border-t border-neutral-100 flex flex-col items-center gap-3">
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 font-medium">분류</span>
                    <span className="text-neutral-900 font-bold">{post.category || '기타'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 font-medium">등록일자</span>
                    <span className="text-neutral-900 font-bold font-mono">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 font-medium">게시물 번호</span>
                    <span className="text-blue-500 font-bold font-mono">#{id}</span>
                  </div>
                </div>
                <BackButton />
              </div>
            )}
          </div>
        </header>

        {/* 📄 본문 */}
        <main className="max-w-4xl mx-auto py-8 xl:py-20 px-4 md:px-10">

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-neutral-200/50 shadow-[0_30px_70px_rgba(0,0,0,0.015)] text-left min-h-[500px] flex flex-col justify-start">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-neutral-400 py-32">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium tracking-wide">게시물 데이터를 불러오는 중...</p>
              </div>
            ) : notFound || !post ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-neutral-400 py-32 text-center">
                <span className="text-3xl">🗂️</span>
                <p className="text-sm font-bold text-neutral-700">존재하지 않거나 삭제된 게시글입니다.</p>
                <p className="text-xs text-neutral-400 font-medium">주소를 다시 확인하시거나 목록으로 돌아가주세요.</p>
                <Link
                  to="/"
                  className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold bg-neutral-50 hover:bg-neutral-100 hover:text-blue-500 text-neutral-500 px-5 py-3 rounded-xl border border-neutral-200/50 transition-all duration-200"
                >
                  메인으로 이동
                </Link>
              </div>
            ) : (
              <>
                {/* ✨ [신규] 첨부파일 카드 목록 (본문 위) */}
                {attachmentFiles.length > 0 && (
                  <div className="mb-8 space-y-2">
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">📎 첨부파일 ({attachmentFiles.length})</h3>
                    {attachmentFiles.map((file, idx) => {
                      const { icon, label } = getFileTypeInfo(file.name, file.url);
                      return (
                        <a
                          key={file.id || idx}
                          href={`${API_URL}/posts/files/${file.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={file.name}
                          className="flex items-center gap-4 bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 rounded-2xl px-5 py-3.5 transition-colors group"
                        >
                          <span className="text-2xl shrink-0">{icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-neutral-800 truncate group-hover:text-blue-500 transition-colors">
                              {file.name}
                            </p>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{label}</p>
                          </div>
                          <span className="text-neutral-300 group-hover:text-blue-400 transition-colors shrink-0 text-lg">↓</span>
                        </a>
                      );
                    })}
                  </div>
                )}

                <article
                  className="w-full max-w-none text-neutral-700 font-sans text-sm md:text-base leading-relaxed animate-fadeIn focus:outline-none prose"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </>
            )}
          </div>

          {/* 🔙 목록 버튼: 콘텐츠 최하단 */}
          {post && (
            <div className="flex justify-center mt-8">
              <BackButton />
            </div>
          )}
        </main>

      </div>
    </>
  );
};

export default PortfolioDetail;