// daon-frontend/src/components/HomeView.jsx
import React, { useState, useEffect, useMemo } from 'react'; 
import { useLocation, useNavigate, Link } from 'react-router-dom'; 
import MainVideoBanner from './MainVideoBanner'; 
import KoreaArchiveMap from './KoreaArchiveMap';
import api from '../api/axios';
import { API_URL } from '../config';

// 📞 전화번호 포맷팅 헬퍼 함수 (예: 051-123-4567)
const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2,3})(\d{3,4})(\d{4})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}`; // 이미지 스타일(.)에 맞춰 포맷팅
  }
  return phone;
};

const HomeView = ({ isLoggedIn = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✨ 메인 아카이브는 "공사실적" 카테고리만, 자체적으로 fetch
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState(null); // 회사 정보 상태 추가

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // ✨ 카테고리 탭 대신 해시태그 필터
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

    // 회사 정보(전화번호 등) 불러오기
    const fetchCompanyInfo = async () => {
      try {
        const res = await api.get('/company');
        setCompanyInfo(res.data);
      } catch (e) {
        console.error('회사 정보 로드 실패:', e);
      }
    };

    fetchArchivePosts();
    fetchCompanyInfo();
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

  // ✨ 게시글에서 키워드 이름 배열 추출하는 헬퍼
  const getPostKeywords = (post) =>
    (post.keywords || []).map(pk => pk.keyword?.name).filter(Boolean);

  // ✨ 전체 게시글에서 등장하는 고유 키워드 목록 (빈도순 정렬)
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

  // ✨ 선택된 키워드로 게시글 필터링
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

      {/* 🚀 견적문의 배너 (이미지 스타일 반영) */}
      <section className="w-full bg-[#3e5668] py-4 px-4 shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10">
          
          {/* 텍스트 영역 */}
          <div className="text-white text-sm md:text-[15px] tracking-wide flex items-center gap-2">
            <span>🔔</span>
            <p>
              <span className="text-[#ffce32] font-extrabold">도비전문</span> 다온씨엔이
            </p>
          </div>

          {/* 버튼 영역 */}
          <div className="flex items-center gap-3">
            <Link
              to="/quotes"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-[#3eb0ff] hover:bg-[#2fa3f2] text-white text-[13px] md:text-sm font-bold px-6 py-2.5 rounded shadow-sm transition-all duration-200 whitespace-nowrap cursor-pointer"
            >
              견적문의하기
            </Link>
            
            <a
              href={`tel:${companyInfo?.phone || '051-000-0000'}`}
              className="bg-white hover:bg-neutral-50 text-neutral-900 text-[13px] md:text-sm font-extrabold px-6 py-2.5 rounded shadow-sm flex items-center gap-2 transition-all duration-200 whitespace-nowrap cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
              </svg>
              {companyInfo?.phone ? formatPhone(companyInfo.phone) : '전화 문의하기'}
            </a>
          </div>
        </div>
      </section>

      {/* ✨ 시공 현장 지도 */}
      <KoreaArchiveMap posts={posts} isLoggedIn={isLoggedIn} />

      {/* 아카이브 섹션 */}
      <section className="py-12 bg-white px-4 md:px-10 w-full scroll-mt-20" id="archive">
        <div className="w-full">
          
          <div className="flex flex-col items-center justify-center border-b border-neutral-200 pb-6 mb-12 gap-3 text-sm">
            
            {/* ✨ 카테고리 탭 → 해시태그 탭 */}
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

                    {/* ✨ 카테고리 텍스트 → 해시태그 목록 (클릭 시 필터링) */}
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

      {/* ✨ [신규] 회사소개서 PDF 다운로드 섹션 (푸터 바로 위) */}
      <section className="w-full bg-slate-50 border-t border-neutral-100 py-14 px-4 md:px-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-[2rem] border border-neutral-200/60 shadow-sm p-8 md:p-10">
          <div className="text-center md:text-left space-y-1.5">
            <div className="text-[10px] tracking-widest font-black text-blue-500 uppercase font-mono bg-blue-50 px-3 py-1 rounded-full inline-block">
              Company Brochure
            </div>
            <h3 className="text-lg md:text-xl font-black text-neutral-900">
              다온씨엔이 회사소개서 PDF 다운로드
            </h3>
            <p className="text-xs text-neutral-400 font-medium">
              다운로드 시점의 최신 회사 정보와 시공 실적이 반영된 문서입니다.
            </p>
          </div>
          <a
            href={`${API_URL}/brochure/download`}
            className="shrink-0 inline-flex items-center gap-2 bg-neutral-900 hover:bg-blue-500 text-white text-sm font-bold px-7 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            📄 PDF 다운로드
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomeView;