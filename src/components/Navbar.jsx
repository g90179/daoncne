import React, { useState } from 'react';
// 만약 react-router-dom을 사용하지 않는 순수 state 라우팅 구조라면 <a> 태그로 대체하셔도 됩니다.
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // 모바일 햄버거 메뉴 제어 토글

  // 네비게이션 링크 레이아웃 데이터 정의
  const navItems = [
    { name: '회사소개', path: '/about' },
    { name: '사업영역', path: '/services' },
    { name: '보유장비', path: '/equipment' },
    { name: '견적문의', path: '/quotes' }, // 🔥 새로 추가된 메뉴 라우트 고정
  ];

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-neutral-200/60 fixed top-0 left-0 right-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        
        {/* 🏢 브랜드 컴퍼니 로고 */}
        <Link to="/" className="text-xl font-normal tracking-tight text-neutral-900">
          daon<span className="font-bold">cne</span>
        </Link>

        {/* 🖥️ 데스크톱 메뉴 링크 링크그룹 */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors py-2 border-b-2 tracking-wide ${
                  isActive 
                    ? 'border-neutral-950 text-neutral-950 font-bold' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-950'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* 📱 모바일 토글 햄버거 스위치 */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-neutral-900 focus:outline-none p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 📱 모바일 전용 드롭다운 서브 레이어 */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-6 py-4 space-y-3 shadow-lg absolute w-full left-0 animate-fadeIn">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`block py-2.5 px-3 text-sm font-medium rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-neutral-50 text-neutral-950 font-bold'
                  : 'text-neutral-500 hover:bg-neutral-50/60 hover:text-neutral-950'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;