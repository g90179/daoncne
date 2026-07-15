// daon-frontend/src/components/HomeView.jsx
import React, { useState, useEffect, useMemo } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom'; 
import MainVideoBanner from './MainVideoBanner'; 
import KoreaArchiveMap from './KoreaArchiveMap';
import api from '../api/axios';
import { API_URL } from '../config';

const HomeView = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✨ [변경] 메인 아카이브는 "공사실적" 카테고리만, 자체적으로 fetch
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // ✨ [신규] 카테고리 탭 대신 해시태그 필터
  const [selectedKeyword, setSelectedKeyword] = useState(null); // null = 전체

  useEffect(() => {
    const fetchArchivePosts = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/posts?category=공사실적');
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('공사실적 게시글 로드 실패:', e);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchivePosts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedKeyword]);

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

  // ✨ [신규] 게시글에서 키워드 이름 배열 추출하는 헬퍼
  const getPostKeywords = (post) =>
    (post.keywords || []).map(pk => pk.keyword?.name).filter(Boolean);

  // ✨ [신규] 전체 게시글에서 등장하는 고유 키워드 목록 (빈도순 정렬)
  const uniqueKeywords = useMemo(() => {
    const countMap = new Map();
    posts.forEach(post => {
      getPostKeywords(post).forEach(name => {
        countMap.set(name, (countMap.get(name) || 0) + 1);
      });
    });
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [posts]);

  // ✨ [신규] 선택된 키워드로 게시글 필터링
  const filteredPosts = useMemo(() => {
    if (!selectedKeyword) return posts;
    return posts.filter(post => getPostKeywords(post).includes(selectedKeyword));
  }, [posts, selectedKeyword]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const currentPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleKeywordClick = (keyword) => {
    setSelectedKeyword(prev => (prev === keyword ? null : keyword)); // 같은 걸 다시 누르면 해제
    document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-white text-neutral-900 flex flex-col font-sans antialiased">
      {/* 메인 동적 비디오 배너 슬라이더 */}
      <MainVideoBanner />

      {/* ✨ [신규] 시공 현장 지도 */}
      <KoreaArchiveMap posts={posts} />

      {/* 아카이브 섹션 */}
      <section className="py-12 bg-white px-4 md:px-10 w-full scroll-mt-20" id="archive">
        <div className="w-full">
          
          <div className="flex flex-col items-center justify-center border-b border-neutral-200 pb-6 mb-12 gap-3 text-sm">
            
            {/* ✨ [변경] 카테고리 탭 → 해시태그 탭 */}
            {uniqueKeywords.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 md:gap-8 font-medium">
                <button
                  onClick={() => handleKeywordClick(null)}
                  className={`pb-1 transition-all relative cursor-pointer ${
                    !selectedKeyword
                      ? 'text-neutral-900 font-bold border-b-2 border-neutral-900'
                      : 'text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  전체
                </button>
                {uniqueKeywords.map(keyword => (
                  <button
                    key={keyword}
                    onClick={() => handleKeywordClick(keyword)}
                    className={`pb-1 transition-all relative cursor-pointer ${
                      selectedKeyword === keyword
                        ? 'text-neutral-900 font-bold border-b-2 border-neutral-900'
                        : 'text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    #{keyword}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* 격자 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-12">
            {currentPosts.map(post => {
              const imageFile = post.files?.find(f => f.type === 'image');
              const videoFile = post.files?.find(f => f.type === 'video' || f.url?.toLowerCase().endsWith('.mp4'));
              const postKeywords = getPostKeywords(post);

              return (
                <div 
                  key={post.id} 
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

                  <div className="text-left space-y-1.5 pt-1">
                    <h3 className="text-sm font-bold text-neutral-900 group-hover:underline underline-offset-4 decoration-neutral-900 transition-all duration-200 line-clamp-1">
                      {post.title}
                    </h3>

                    {/* ✨ [변경] 카테고리 텍스트 → 해시태그 목록 (클릭 시 필터링) */}
                    {postKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-x-2 gap-y-1">
                        {postKeywords.map(keyword => (
                          <button
                            key={keyword}
                            onClick={(e) => {
                              e.stopPropagation(); // 카드 클릭(상세 이동) 방지
                              handleKeywordClick(keyword);
                            }}
                            className={`text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                              selectedKeyword === keyword
                                ? 'text-blue-500 font-bold'
                                : 'text-neutral-400 hover:text-blue-500'
                            }`}
                          >
                            #{keyword}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 font-medium tracking-wide">
                        Daon CNE
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isLoading && filteredPosts.length === 0 && (
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