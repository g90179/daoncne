// daon-frontend/src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ companyInfo = {}, isLoggedIn, setShowLoginModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
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
        
        {/* 네비게이션 메뉴 및 버튼 영역 */}
        <div className="flex items-center gap-8 md:gap-12">
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium">
            <Link 
              to="/" 
              onClick={handleScrollTop}
              className={`transition duration-200 ${
                isWhiteTextTheme ? 'text-white/90 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              홈
            </Link>

            <Link 
              to="/company" 
              onClick={handleScrollTop}
              className={`transition duration-200 ${
                isWhiteTextTheme ? 'text-white/90 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              회사소개
            </Link>
            
            <Link 
              to="//#archive" 
              onClick={handlePortfolioClick}
              className={`transition duration-200 ${
                isWhiteTextTheme ? 'text-white/90 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              포트폴리오
            </Link>
            
            <Link 
              to="/quotes" 
              onClick={handleScrollTop}
              className={`transition duration-200 ${
                isWhiteTextTheme ? 'text-white/90 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              견적문의
            </Link>
          </div>

          {/* 🔑 [수정] 비로그인 시 Sign In 버튼을 완전히 숨기고, 로그인 상태(isLoggedIn)일 때만 Dashboard 버튼을 렌더링합니다. */}
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