import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ companyInfo, isMapScriptLoaded, isLoggedIn, setAdminView, setShowLoginModal, onQuoteClick }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 고정 상단 헤더 프레임 */}
      <Header 
        companyInfo={companyInfo} 
        isLoggedIn={isLoggedIn}
        setAdminView={setAdminView}
        setShowLoginModal={setShowLoginModal}
      />
      
      {/* 메인이 아닐 때만 헤더 가림 방지 pt-24 자동 다이내믹 주입 */}
      <main className={`flex-1 ${isHome ? '' : 'pt-24'}`}>
        <Outlet /> 
      </main>
      
      {/* 하단 푸터 프레임 */}
      <Footer companyInfo={companyInfo} isMapScriptLoaded={isMapScriptLoaded} onQuoteClick={onQuoteClick} />
    </div>
  );
};

export default Layout;