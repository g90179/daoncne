// daon-frontend/src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ companyInfo = {}, isLoggedIn, setShowLoginModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // 🚨 [관리자 비밀 통로용] 클릭 횟수와 타이머를 추적하는 변수 (화면 새로고침 방지용 useRef 사용)
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  
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

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePortfolioClick = (e) => {
    if (isMainHome) {
      e.preventDefault();
      document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 🚀 [신규] 로고 5연속 클릭 감지 함수
  const handleLogoClick = () => {
    // 1. 기본 동작: 1번 누르면 무조건 홈으로 이동 (일반 유저용)
    navigate('/');
    handleScrollTop();

    // 2. 비로그인 상태일 때만 5번 클릭 카운트 시작 (관리자용)
    if (!isLoggedIn) {
      clickCount.current += 1;

      // 5번을 연속으로 채웠다면?
      if (clickCount.current >= 5) {
        setShowLoginModal(true); // 로그인 모달 오픈!
        clickCount.current = 0; // 카운트 초기화
      }

      // 만약 클릭하고 2초(2000ms) 동안 다음 클릭이 없으면 횟수 리셋 (우연히 5번 채워지는 것 방지)
      clearTimeout(clickTimer.current);
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 2000);
    }
  };

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
        
        {/* 🚀 로고 영역: onClick에 5연타 감지 함수(handleLogoClick)를 연결했습니다. */}
        <div 
          className={`text-xl font-normal tracking-tight cursor-pointer transition-colors duration-300 select-none ${
            isWhiteTextTheme ? 'text-white' : 'text-neutral-900'
          }`} 
          onClick={handleLogoClick}
        >
          daon<span className={`font-bold ${isWhiteTextTheme ? 'text-white' : 'text-neutral-900'}`}>cne</span>
        </div>
        
        {/* 네비게이션 메뉴 및 버튼 영역 */}
        <div className="flex items-center gap-8 md:gap-12">
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium">
            <Link 
              to="/" 
              onClick={handleScrollTop}
              className={`transition duration-200 ${
                isWhiteTextTheme ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              홈
            </Link>

            <Link 
              to="/company" 
              onClick={handleScrollTop}
              className={`transition duration-200 ${
                isWhiteTextTheme ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              회사소개
            </Link>
            
            <Link 
              to="//#archive" 
              onClick={handlePortfolioClick}
              className={`transition duration-200 ${
                isWhiteTextTheme ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              포트폴리오
            </Link>
            
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

          {/* 로그인 상태일 때만 대시보드 진입 버튼 노출 */}
          {isLoggedIn && (
            <button 
              onClick={() => navigate('/admDashboard')} 
              className={`text-xs font-bold tracking-wider uppercase border px-4 py-2 transition-all duration-200 ${
                isWhiteTextTheme 
                  ? 'border-white text-white hover:bg-white hover:text-neutral-900' 
                  : 'border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              Dashboard
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;