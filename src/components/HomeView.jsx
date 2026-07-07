// daon-frontend\src\components\HomeView.jsx
import React, { useState, useEffect } from 'react'; // ✅ 실시간 스크롤 감지를 위해 useEffect 추가
import PostView from './PostView';
import QuoteBoard from '../pages/QuoteBoard'; 
import Footer from './Footer';
import MainVideoBanner from './MainVideoBanner'; 
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
  const [showQuoteBoard, setShowQuoteBoard] = useState(false);
  const [quoteTab, setQuoteTab] = useState('list'); 

  // ⏱️ [신규 추가] 스크롤 여부를 저장하는 상태값
  const [isScrolled, setIsScrolled] = useState(false);

  // ⏱️ [신규 추가] 브라우저 스크롤 Y축을 실시간 24시간 감시하는 엔진
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true); // 50px 이상 내려가면 화이트 모드 가동
      } else {
        setIsScrolled(false); // 맨 위로 올라오면 다시 투명 모드 복귀
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // 컴포넌트 해제 시 메모리 정돈
  }, []);

  const handleGoHome = () => {
    setSelectedPost(null);
    setShowQuoteBoard(false);
  };

  const isMainHome = !showQuoteBoard;

  // 🎨 스크롤 상태 및 페이지 모드에 따라 테마 색상을 동적으로 매핑
  const isWhiteTextTheme = isMainHome && !isScrolled;

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans antialiased selection:bg-neutral-900 selection:text-white">
      <div className="relative flex-1">
        {selectedPost ? (
          <PostView post={selectedPost} onBack={handleGoHome} />
        ) : (
          <>
            {/* ─── 1. 상단 헤더 (Navigation Bar 스마트 업그레이드) ─── */}
            {/* 🔒 fixed top-0 left-0 조치로 스크롤을 아무리 내려도 상단에 철컥 고정됩니다. */}
            <header className={`w-full z-50 transition-all duration-300 ${
              isMainHome 
                ? 'fixed top-0 left-0 bg-white/10 backdrop-blur-md border-b border-white/10 py-0' 
                : 'sticky top-0 bg-white border-b border-neutral-200 shadow-sm'
            } ${
              isMainHome && isScrolled 
                ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-neutral-200/80 py-1' 
                : isMainHome && !isScrolled 
                ? 'bg-transparent border-b border-white/10 py-0' 
                : ''
            }`}>
              <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center transition-all">
                
                {/* 로고 색상 스위칭 */}
                <div 
                  className={`text-xl font-normal tracking-tight cursor-pointer transition-colors duration-300 ${
                    isWhiteTextTheme ? 'text-white' : 'text-neutral-900'
                  }`} 
                  onClick={handleGoHome}
                >
                  daon<span className={`font-bold ${isWhiteTextTheme ? 'text-white' : 'text-neutral-900'}`}>cne</span>
                </div>
                
                {/* 우측 메뉴 헤더 내비게이션 */}
                <div className="flex items-center gap-8 md:gap-12">
                  <div className="hidden sm:flex items-center gap-8 text-sm font-medium">
                    
                    {/* Index 메뉴 버튼 */}
                    <button 
                      onClick={handleGoHome} 
                      className={`transition duration-200 ${
                        isWhiteTextTheme 
                          ? (!showQuoteBoard ? 'text-white font-bold' : 'text-white/60 hover:text-white') 
                          : (!showQuoteBoard ? 'text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900')
                      }`}
                    >
                      Index
                    </button>

                    {/* Our Works 메뉴 버튼 */}
                    <a 
                      href="#archive" 
                      onClick={() => setShowQuoteBoard(false)} 
                      className={`transition duration-200 ${
                        isWhiteTextTheme ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Our Works
                    </a>

                    {/* 견적문의 메뉴 버튼 */}
                    <button 
                      onClick={() => { 
                        setSelectedPost(null); 
                        setQuoteTab('list'); 
                        setShowQuoteBoard(true); 
                      }} 
                      className={`transition duration-200 ${
                        isWhiteTextTheme 
                          ? (showQuoteBoard ? 'text-white font-bold' : 'text-white/60 hover:text-white') 
                          : (showQuoteBoard ? 'text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900')
                      }`}
                    >
                      견적문의
                    </button>
                  </div>

                  {/* 우측 대시보드 로그인 버튼 테마 변환 */}
                  <button 
                    onClick={() => isLoggedIn ? setAdminView('posts') : setShowLoginModal(true)} 
                    className={`text-xs font-bold tracking-wider uppercase border px-4 py-2 transition-all duration-200 ${
                      isWhiteTextTheme 
                        ? 'border-white text-white hover:bg-white hover:text-neutral-900' 
                        : 'border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    {isLoggedIn ? 'Dashboard' : 'Sign In'}
                  </button>
                </div>

              </div>
            </header>

            {/* ─── 조건부 렌더링 영역 ─── */}
            {showQuoteBoard ? (
              <QuoteBoard initialTab={quoteTab} isLoggedIn={isLoggedIn} /> 
            ) : (
              /* 🏠 기본 메인 아카이브 레이아웃 */
              <>
                {/* ─── 2. 메인 동적 비디오 배너 슬라이더 ─── */}
                <MainVideoBanner />

                {/* ─── 3. 아카이브 섹션 ─── */}
                <section className="py-12 bg-white px-4 md:px-10 w-full scroll-mt-30" id="archive">
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

      <Footer 
        companyInfo={companyInfo} 
        isMapScriptLoaded={isMapScriptLoaded} 
        onQuoteClick={() => {
          setSelectedPost(null);
          setQuoteTab('write'); 
          setShowQuoteBoard(true);
          window.scrollTo(0, 0);
        }}
      />
    </div>
  );
};

export default HomeView;