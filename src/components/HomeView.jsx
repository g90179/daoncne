// import React from 'react';
import PostView from './PostView';
import { API_URL } from '../config';

const HomeView = ({ 
  posts, 
  activeTab, 
  setActiveTab, 
  isLoggedIn, 
  setAdminView, 
  setShowLoginModal, 
  selectedPost, 
  setSelectedPost 
}) => {
  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans antialiased selection:bg-neutral-900 selection:text-white">
      <div className="relative flex-1">
        {selectedPost ? (
          <PostView post={selectedPost} onBack={() => setSelectedPost(null)} />
        ) : (
          <>
            {/* ─── 1. 상단 헤더: 원래의 단정한 고정폭(max-w) 레이아웃 복원 ─── */}
            <header className="w-full border-b border-neutral-200 bg-white sticky top-0 z-50">
              <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
                
                {/* 로고 */}
                <div className="text-xl font-normal tracking-tight text-neutral-900 cursor-pointer" onClick={() => window.location.reload()}>
                  daon<span className="font-bold text-neutral-900">cne</span>
                </div>
                
                {/* 우측 메뉴 */}
                <div className="flex items-center gap-8 md:gap-12">
                  <div className="hidden sm:flex gap-8 text-sm font-medium text-neutral-500">
                    <a href="#" className="text-neutral-900 font-bold transition duration-200">Index</a>
                    <a href="#archive" className="hover:text-neutral-900 transition duration-200">Our Works</a>
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

            {/* ─── 3. 아카이브 섹션: 필터 중앙 정렬 및 전체 탭 추가 ─── */}
            <section className="py-12 bg-white px-4 md:px-10 w-full" id="archive">
              <div className="w-full">
                
                {/* ✨ 변경 포인트: flex-col items-center justify-center로 중앙 정렬 배치 */}
                <div className="flex flex-col items-center justify-center border-b border-neutral-200 pb-6 mb-12 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-neutral-400 font-medium">
                    <span>Filter by:</span>
                    <span className="text-neutral-900 font-bold">{activeTab}</span>
                  </div>
                  
                  {/* ✨ 변경 포인트: '전체' 탭 배열에 추가 */}
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
                
                {/* 4열 격자 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-x-12 gap-y-12">
                  {posts.map(post => {
                    const imageFile = post.files?.find(f => f.type === 'image');
                    const videoFile = post.files?.find(f => f.type === 'video' || f.url?.toLowerCase().endsWith('.mp4'));

                    return (
                      <div 
                        key={post.id} 
                        onClick={() => { setSelectedPost(post); window.scrollTo(0,0); }} 
                        className="group cursor-pointer flex flex-col gap-3"
                      >
                        {/* 썸네일 박스 */}
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

                        {/* 하단 텍스트 메타데이터 */}
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

                {/* 빈 데이터 처리 */}
                {posts.length === 0 && (
                  <div className="w-full text-center py-32 border border-dashed border-neutral-200 mt-6">
                    <p className="text-neutral-400 text-xs font-medium tracking-widest uppercase">No projects cataloged in this filter</p>
                  </div>
                )}

              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeView;