// daon-frontend/src/components/HomeView.jsx
import React, { useState, useEffect } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom'; 
import MainVideoBanner from './MainVideoBanner'; 
import { API_URL } from '../config';

const HomeView = ({ 
  posts, 
  activeTab, 
  setActiveTab
}) => {
  const location = useLocation();
  const navigate = useNavigate(); // 🔑 라우터 이동을 위한 navigate 훅
  
  const [currentPage, setCurrentPage] = useState(1);
  
  // lg:grid-cols-4(4열) 환경에서 항상 정갈하게 3줄(3 rows)을 유지하기 위한 절대 기조 (4 * 3 = 12)
  const ITEMS_PER_PAGE = 12;

  // 카테고리 탭 변경 감지 시 페이징 인덱스를 1페이지로 자동 회귀 조치
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // 다른 페이지에서 해시(#archive)를 들고 들어오거나 posts가 바뀔 때 정확히 저격 스크롤
  useEffect(() => {
    if (location.hash === '#archive') {
      const timer = setTimeout(() => {
        const element = document.getElementById('archive');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location.hash, posts]); 

  // 페이징 슬라이싱 연산 기동
  const totalPages = Math.ceil((posts || []).length / ITEMS_PER_PAGE);
  const currentPosts = (posts || []).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="w-full bg-white text-neutral-900 flex flex-col font-sans antialiased">
      {/* 1. 메인 동적 비디오 배너 슬라이더 */}
      <MainVideoBanner />

      {/* 2. 아카이브 섹션 */}
      <section className="py-12 bg-white px-4 md:px-10 w-full scroll-mt-20" id="archive">
        <div className="w-full">
          
          <div className="flex flex-col items-center justify-center border-b border-neutral-200 pb-6 mb-12 gap-3 text-sm">
            <div className="flex items-center gap-2 text-neutral-400 font-medium">
              <span>Filter by:</span>
              <span className="text-neutral-900 font-bold">{activeTab}</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 font-medium">
              {['전체', '현장사진', '공사실적', '보유장비'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`pb-1 transition-all relative cursor-pointer ${
                    activeTab === tab 
                      ? 'text-neutral-900 font-bold border-b-2 border-neutral-900' 
                      : 'text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* 격자 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-12">
            {currentPosts.map(post => {
              const imageFile = post.files?.find(f => f.type === 'image');
              const videoFile = post.files?.find(f => f.type === 'video' || f.url?.toLowerCase().endsWith('.mp4'));

              return (
                <div 
                  key={post.id} 
                  // 🔑 핵심 변경: 클릭 시 상세 페이지(PortfolioDetail) URL로 이동시킵니다.
                  onClick={() => { 
                    window.scrollTo(0,0); 
                    navigate(`/portfolio/${post.id}`); 
                  }} 
                  className="group cursor-pointer flex flex-col gap-3"
                >
                  <div className="aspect-[6/4] p-6 bg-[#f4f4f5] overflow-hidden relative border-neutral-100">
                    <div className="absolute inset-0 bg-neutral-950/0 group-hover:bg-neutral-950/5 transition-colors duration-300 z-10 pointer-events-none"></div>
                    
                    {imageFile ? (
                      <img 
                        src={`${API_URL}${imageFile.url}`} 
                        className="w-full h-full object-cover transition-transform duration-500 ease-out brightness-[0.98]" 
                        alt={post.title} 
                      />
                    ) : videoFile ? (
                      <div className="w-full h-full bg-neutral-950 flex items-center justify-center relative overflow-hidden">
                        <video 
                          src={`${API_URL}${videoFile.url}`} 
                          className="w-full h-full object-cover opacity-90" 
                          muted 
                          preload="metadata" 
                        />
                        <div className="absolute bottom-3 right-3 bg-neutral-900/80 text-[9px] font-black tracking-widest text-white px-2 py-1 uppercase z-20">
                          Video
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#f4f4f5] text-neutral-300 border border-dashed">
                        <span className="text-xs font-medium tracking-widest uppercase">No Media</span>
                      </div>
                    )}
                  </div>

                  <div className="text-left space-y-0.5 pt-1">
                    <h3 className="text-sm font-bold text-neutral-900 group-hover:underline underline-offset-4 decoration-neutral-900 transition-all duration-200 line-clamp-1">
                      {post.title}
                    </h3>
                    <div className="text-xs text-neutral-400 font-medium tracking-wide">
                      {post.category} — Daon CNE
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {posts.length === 0 && (
            <div className="w-full text-center py-32 border border-dashed border-neutral-200 mt-6">
              <p className="text-neutral-400 text-xs font-medium tracking-widest uppercase">No projects cataloged in this filter</p>
            </div>
          )}

          {/* 프리미엄 도트 페이징 유닛 */}
          {totalPages > 1 && (
            <div className="mt-10 pt-4 border-t border-neutral-100 flex justify-center">
              <div className="flex items-center gap-3 py-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  const isActive = currentPage === pageNumber;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => {
                        setCurrentPage(pageNumber);
                        document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer outline-none ${
                        isActive 
                          ? 'bg-neutral-900 scale-125 shadow-sm' 
                          : 'bg-neutral-200 hover:bg-neutral-400'
                      }`}
                      title={`${pageNumber}페이지로 이동`}
                    />
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default HomeView;