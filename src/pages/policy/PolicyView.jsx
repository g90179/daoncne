// daon-frontend/src/pages/PolicyView.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom'; // 🔑 Link 임포트 체크
import axios from 'axios'; 
import { API_URL } from '../../config';

const PolicyView = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'PRIVACY');
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchExposedPolicy = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/policies/exposed/${activeTab}`);
        setPolicy(res.data); 
      } catch (e) {
        setPolicy(null);
      } finally {
        setLoading(false);
      }
    };
    fetchExposedPolicy();
  }, [activeTab]);

  return (
    <div className="w-full bg-slate-50 min-h-screen text-neutral-900 font-sans antialiased selection:bg-blue-500/10 selection:text-blue-600">
      
      {/* 🌌 상단 프리미엄 미니멀 헤더 플레이트 */}
      <header className="bg-white border-b border-neutral-200/60 pt-32 pb-16 px-4 md:px-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-12 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <div className="text-[10px] tracking-widest font-black text-blue-500 uppercase font-mono bg-blue-50 px-3 py-1 rounded-full inline-block">
            Legal & Transparency
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[oklch(0.38_0.07_259.56)] tracking-tight">
            다온씨엔이 공시 의무 규정
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 font-medium tracking-wide">
            네이버·카카오의 표준 가이드라인을 준수하며, 이용자의 권익 보호와 안전한 서비스 환경을 단호히 보장합니다.
          </p>
        </div>

        {/* 🎛️ 중앙 세그먼트 스위치 탭 */}
        <div className="max-w-xs mx-auto mt-10 p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200/40 flex gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('TERMS')}
            className={`flex-1 text-xs font-bold py-3 rounded-xl transition-all duration-300 cursor-pointer ${
              activeTab === 'TERMS'
                ? 'bg-white text-[oklch(0.38_0.07_259.56)] shadow-md font-black scale-[1.01]'
                : 'text-neutral-400 hover:text-neutral-800'
            }`}
          >
            이용약관
          </button>
          <button
            onClick={() => setActiveTab('PRIVACY')}
            className={`flex-1 text-xs font-bold py-3 rounded-xl transition-all duration-300 cursor-pointer ${
              activeTab === 'PRIVACY'
                ? 'bg-white text-[oklch(0.38_0.07_259.56)] shadow-md font-black scale-[1.01]'
                : 'text-neutral-400 hover:text-neutral-800'
            }`}
          >
            개인정보처리방침
          </button>
        </div>
      </header>

      {/* 📄 본문 약관 명세 보드 레이아웃 */}
      <main className="max-w-7xl mx-auto py-12 md:py-20 px-4 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* 👈 좌측 Sticky 고정 신뢰 지표 패널 (cols-4) */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-neutral-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.01)] text-left space-y-5">
            <div className="flex items-center gap-3 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-xs font-black uppercase tracking-wider font-mono">Status Dashboard</span>
            </div>
            
            <div className="space-y-4 font-sans text-xs">
              <div className="flex justify-between border-b border-neutral-100 pb-2.5 items-center gap-2">
                <span className="text-neutral-400 font-medium shrink-0">현재 적용 명칭</span>
                <span className="text-neutral-900 font-bold truncate text-right max-w-[160px]" title={policy?.title}>
                  {policy ? policy.title : '공시 준비 중'}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-neutral-400 font-medium">공고일자</span>
                <span className="text-neutral-900 font-bold font-mono">
                  {policy?.createdAt ? policy.createdAt.slice(0, 10) : '-'}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-neutral-400 font-medium">법적 효력 시행일</span>
                <span className="text-blue-500 font-bold font-mono">
                  {policy?.effectiveDate ? policy.effectiveDate.slice(0, 10) : '즉시 시행'}
                </span>
              </div>
              <div className="flex justify-between pb-4">
                <span className="text-neutral-400 font-medium">암호화 등급</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> High-Grade AES
                </span>
              </div>
            </div>

            {/* 🔑 [신규 삽입] 아카이브 리스트로 진입하는 프리미엄 네비게이션 버튼 플레이트 */}
            <div className="pt-2 border-t border-neutral-100">
              <Link
                to="/policy/history"
                state={{ defaultFilter: activeTab }} // 현재 활성화된 탭을 아카이브 분류 필터 기본값으로 안전 릴레이
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full flex items-center justify-center gap-2 text-center text-[11px] font-bold bg-neutral-50 hover:bg-neutral-100 hover:text-blue-500 text-neutral-500 py-3 rounded-xl border border-neutral-200/50 transition-all duration-200 cursor-pointer"
              >
                <span>이전 {activeTab === 'TERMS' ? '이용약관' : '개인정보처리방침'} 전체 목록 보기</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* 👉 우측 실질 약관 상세 내역 보드 (cols-8) */}
        <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[2.5rem] border border-neutral-200/50 shadow-[0_30px_70px_rgba(0,0,0,0.015)] text-left min-h-[500px] flex flex-col justify-start">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-neutral-400 py-32">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium tracking-wide">보안 데이터 쉘 로드 중...</p>
            </div>
          ) : !policy ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-neutral-400 py-32 text-center">
              <span className="text-3xl">⚖️</span>
              <p className="text-sm font-bold text-neutral-700">공시된 문서가 존재하지 않습니다.</p>
              <p className="text-xs text-neutral-400 font-medium">현재 관리자 대시보드에서 정식 발행 절차가 진행 중입니다.</p>
            </div>
          ) : (
            <article 
              className="w-full max-w-none text-neutral-700 font-sans text-sm animate-fadeIn focus:outline-none"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          )}
        </div>

      </main>
    </div>
  );
};

export default PolicyView;