// daon-frontend\src\components\Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ companyInfo = {}, isLoggedIn, setAdminView, setShowLoginModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // 현재 페이지가 메인 홈인지 확인
  const isMainHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 전역 스크롤 탑 이동 헬퍼 함수
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 홈 화면이면서 스크롤이 안 되었을 때만 글씨를 흰색으로 바꿈 (비디오 배너 레이어용)
  const isWhiteTextTheme = isMainHome && !isScrolled;

  return (
    <header className={`w-full z-50 transition-all duration-300 fixed top-0 left-0 ${
      isMainHome 
        ? isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-neutral-200/80 py-1' 
          : 'bg-transparent border-b border-white/10 py-0'
        : 'bg-white border-b border-neutral-200 shadow-sm py-1'
    }`}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center transition-all">
        
        {/* 로고 영역 */}
        <div 
          className={`text-xl font-normal tracking-tight cursor-pointer transition-colors duration-300 ${
            isWhiteTextTheme ? 'text-white' : 'text-neutral-900'
          }`} 
          onClick={() => {
            navigate('/');
            handleScrollTop();
          }}
        >
          daon<span className={`font-bold ${isWhiteTextTheme ? 'text-white' : 'text-neutral-900'}`}>cne</span>
        </div>
        
        {/* 네비게이션 내비바 */}
        <div className="flex items-center gap-8 md:gap-12">
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium">
            <Link 
              to="/" 
              onClick={handleScrollTop} // 🔑 홈 클릭 시에도 상단 롤업 UX 추가
              className={`transition duration-200 ${
                isWhiteTextTheme ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              홈
            </Link>
            <a 
              href={isMainHome ? '#archive' : '/#archive'} 
              className={`transition duration-200 ${
                isWhiteTextTheme ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              포트폴리오
            </a>
            
            {/* 🔑 [핵심 수정] 견적문의 링크 클릭 시 상단으로 자동 스크롤 트리거 장착! */}
            <Link 
              to="/quotes" 
              onClick={handleScrollTop}
              className={`transition duration-200 ${
                isWhiteTextTheme ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              견적문의
            </Link>
          </div>

          {/* 우측 대시보드 로그인 버튼 */}
          <button 
            onClick={() => {
              if (isLoggedIn) {
                setAdminView('posts');
                navigate('/admin'); // 🔑 핵심 수정: 관리자 페이지 주소로 이동시킵니다.
              } else {
                setShowLoginModal(true);
              }
            }} 
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
  );
};

export default Header;