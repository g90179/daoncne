import React, { useState } from 'react'; // ✅ 상태 관리를 위해 useState 추가
import PostView from './PostView';
import QuoteBoard from '../pages/QuoteBoard'; // ✅ 상대 경로 수정 (../pages/)
import Footer from './Footer';
import { API_URL } from '../config';

const HomeView = ({ 
  posts, 
  activeTab, 
  setActiveTab, 
  isLoggedIn, 
  setAdminView, 
  setShowLoginModal, 
  selectedPost, 
  setSelectedPost,
  companyInfo,  
  isMapScriptLoaded 
}) => {
  // 📝 견적문의 게시판 화면 노출 여부를 제어하는 로컬 상태 추가
  const [showQuoteBoard, setShowQuoteBoard] = useState(false);
  const [quoteTab, setQuoteTab] = useState('list'); // ✅ 추가


  // 메인 화면으로 돌아오는 공통 초기화 함수
  const handleGoHome = () => {
    setSelectedPost(null);
    setShowQuoteBoard(false);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans antialiased selection:bg-neutral-900 selection:text-white">
      <div className="relative flex-1">
        {selectedPost ? (
          <PostView post={selectedPost} onBack={handleGoHome} />
        ) : (
          <>
            {/* ─── 1. 상단 헤더 (Navigation Bar) ─── */}
            <header className="w-full border-b border-neutral-200 bg-white sticky top-0 z-50">
              <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
                
                {/* 로고 (클릭 시 메인 홈으로 부드럽게 복귀) */}
                <div 
                  className="text-xl font-normal tracking-tight text-neutral-900 cursor-pointer" 
                  onClick={handleGoHome}
                >
                  daon<span className="font-bold text-neutral-900">cne</span>
                </div>
                
                {/* 우측 메뉴 헤더 내비게이션 */}
                <div className="flex items-center gap-8 md:gap-12">
                  <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-neutral-500">
                    <button 
                      onClick={handleGoHome} 
                      className={`transition duration-200 ${!showQuoteBoard ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'}`}
                    >
                      Index
                    </button>
                    <a 
                      href="#archive" 
                      onClick={() => setShowQuoteBoard(false)} 
                      className="hover:text-neutral-900 transition duration-200"
                    >
                      Our Works
                    </a>
                    {/* 🔥 [추가] 견적문의 메뉴 탭 */}
                    <button 
                      onClick={() => { 
                        setSelectedPost(null); 
                        setQuoteTab('list'); // 네비바 메뉴 클릭 시에는 기본 '목록' 노출
                        setShowQuoteBoard(true); 
                      }} 
                      className={`transition duration-200 ${showQuoteBoard ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'}`}
                    >
                      견적문의
                    </button>
                  </div>

                  <button 
                    onClick={() => isLoggedIn ? setAdminView('posts') : setShowLoginModal(true)} 
                    className="text-xs font-bold tracking-wider uppercase border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-all duration-200"
                  >
                    {isLoggedIn ? 'Dashboard' : 'Sign In'}
                  </button>
                </div>

              </div>
            </header>

            {/* ─── 조건부 렌더링 영역 ─── */}
            {showQuoteBoard ? (
              <QuoteBoard initialTab={quoteTab} /> // ✅ initialTab 프롭스 전달
            ) : (
              /* 🏠 기본 메인 아카이브 레이아웃 */
              <>
                {/* ─── 2. 메인 인트로 섹션 ─── */}
                <section className="bg-[#f4f4f5] border-b border-neutral-200 py-20 md:py-32 px-6 md:px-12">
                  <div className="max-w-[1600px] mx-auto text-left space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Engineering & Logistics Archive</p>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-neutral-900 leading-[1.15]">
                      다온씨엔이가 설계하고 완수한 <br />
                      <span className="font-bold text-neutral-900">중량물 설비 이전 및 설치</span> 프로젝트 쇼케이스입니다.
                    </h1>
                    <p className="text-sm text-neutral-500 max-w-xl pt-2 font-medium leading-relaxed">
                      정밀한 공학적 시뮬레이션과 안전 표준을 준수하여 인프라 자산을 완벽하게 이동시킵니다. 아래 아카이브에서 필터별 실적을 탐색할 수 있습니다.
                    </p>
                  </div>
                </section>

                {/* ─── 3. 아카이브 섹션 ─── */}
                <section className="py-12 bg-white px-4 md:px-10 w-full" id="archive">
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
                            className={`pb-1 transition-all relative ${
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
                      {posts.map(post => {
                        const imageFile = post.files?.find(f => f.type === 'image');
                        const videoFile = post.files?.find(f => f.type === 'video' || f.url?.toLowerCase().endsWith('.mp4'));

                        return (
                          <div 
                            key={post.id} 
                            onClick={() => { setSelectedPost(post); window.scrollTo(0,0); }} 
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

                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>

      {/* ─── 4. 하단 푸터 연동 ─── */}
      {/* 💡 푸터 내부의 견적문의하기 버튼을 클릭했을 때도 화면이 전환될 수 있도록 이벤트 주입 */}
      <Footer 
      companyInfo={companyInfo} 
      isMapScriptLoaded={isMapScriptLoaded} 
      onQuoteClick={() => {
        setSelectedPost(null);
        setQuoteTab('write'); // 🔥 푸터 버튼을 누르면 '문의하기(write)' 탭으로 지정
        setShowQuoteBoard(true);
        window.scrollTo(0, 0);
      }}
      />
    </div>
  );
};

export default HomeView;