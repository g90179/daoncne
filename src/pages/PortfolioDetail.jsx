// daon-frontend/src/pages/PortfolioDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/axios';

const PortfolioDetail = () => {
  const { id } = useParams(); // URL의 :id 값을 가져옵니다
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        alert('존재하지 않거나 삭제된 게시글입니다.');
        navigate('/'); // 에러 시 메인으로 이동
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  if (isLoading) return <div className="min-h-screen pt-40 text-center font-bold text-neutral-400">데이터를 불러오는 중입니다...</div>;
  if (!post) return null;

  // HTML 태그 제거 함수 (Meta Description 용)
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | 다온씨엔이(DAON C&E)</title>
        <meta name="description" content={stripHtml(post.content).substring(0, 150)} />
        <meta property="og:title" content={`${post.title} | 다온씨엔이`} />
        <meta property="og:description" content={stripHtml(post.content).substring(0, 150)} />
      </Helmet>

      <div className="w-full bg-slate-50 min-h-screen text-neutral-900 font-sans antialiased">
        <main className="max-w-4xl mx-auto pt-32 pb-20 px-4 md:px-10 animate-fadeIn">
          {/* 헤더 영역 */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-neutral-200/50 shadow-sm mb-8 text-center">
            <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase bg-blue-50 px-3 py-1 rounded-full inline-block mb-4">
              {post.category || 'PORTFOLIO'}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-800 mb-6">{post.title}</h1>
            <div className="text-xs text-neutral-400 font-medium">
              등록일: {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* 본문 영역 */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-neutral-200/50 shadow-sm">
            <div 
              className="prose max-w-none text-sm md:text-base text-neutral-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </div>

          {/* 하단 버튼 */}
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate(-1)}
              className="bg-neutral-900 text-white px-8 py-3 rounded-2xl font-bold text-xs shadow-lg shadow-neutral-900/10 hover:bg-blue-500 transition-all active:scale-95 cursor-pointer"
            >
              목록으로 돌아가기
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default PortfolioDetail;