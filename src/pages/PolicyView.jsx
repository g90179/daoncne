// daon-frontend/src/pages/PolicyView.jsx
import React, { useState, useEffect } from 'react'; // 🔑 useEffect 추가
import { useLocation } from 'react-router-dom'; // 🔑 useLocation 추가

const PolicyView = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'PRIVACY');
  

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

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
              <div className="flex justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-neutral-400 font-medium">현재 적용 버전</span>
                <span className="text-neutral-900 font-bold font-mono">v1.0.0</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-neutral-400 font-medium">최종 공시일자</span>
                <span className="text-neutral-900 font-bold font-mono">2026.07.09</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-neutral-400 font-medium">법적 효력 시행일</span>
                <span className="text-blue-500 font-bold font-mono">즉시 시행</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 font-medium">암호화 등급</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> High-Grade AES
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-neutral-100 text-[11px] text-neutral-400 leading-relaxed font-medium">
              본 조항은 신용정보의 이용 및 보호에 관한 법률 및 개인정보보호법에 의거하여 엄격히 통제 관리됩니다.
            </div>
          </div>
        </div>

        {/* 👉 우측 실질 약관 상세 내역 보드 (cols-8) */}
        <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[2.5rem] border border-neutral-200/50 shadow-[0_30px_70px_rgba(0,0,0,0.015)] text-left">
          
          {activeTab === 'PRIVACY' ? (
            /* 1. 개인정보처리방침 (PRIVACY CONTENT) */
            <article className="space-y-10 animate-fadeIn">
              <div className="space-y-2 border-b border-neutral-100 pb-6">
                <h2 className="text-2xl font-black text-[oklch(0.38_0.07_259.56)] tracking-tight">개인정보처리방침</h2>
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                  주식회사 다온씨엔이(이하 "회사")는 이용자의 개인정보를 소중하게 처리하며, 개인정보보호법 제30조에 따라 이용자의 권익을 보호하고 개인정보와 관련한 고충을 신속하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
                </p>
              </div>

              {/* 제 1조 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  제 1조 (수집하는 개인정보 항목 및 목적)
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed pl-3.5">
                  회사는 공식 웹사이트를 통한 <strong>'고객 견적 문의 상담 및 비즈니스 매칭'</strong>을 위해 최소한의 필수 개인정보를 수집하고 있습니다. 수집된 정보는 지정된 목적 외의 용도로는 절대 사용되지 않습니다.
                </p>
                <div className="pl-3.5 pt-1 overflow-x-auto">
                  <table className="w-full border-collapse font-sans text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-y border-neutral-200/60 font-bold text-neutral-600">
                        <th className="p-3">수집 분류</th>
                        <th className="p-3">필수 수집 항목</th>
                        <th className="p-3">수집 및 이용 목적</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium text-neutral-500">
                      <tr>
                        <td className="p-3 font-bold text-neutral-800">온라인 견적문의</td>
                        <td className="p-3 font-mono">고객명/회사명, 연락처, 이메일 주소</td>
                        <td className="p-3">견적 산출 안내, 공사 실적 조율을 위한 비상 연락망 확보</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 제 2조 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  제 2조 (개인정보의 보유 및 이용기간)
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed pl-3.5">
                  회사는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
                </p>
                <ul className="list-disc pl-8 text-xs text-neutral-500 space-y-1 font-medium">
                  <li><strong>웹사이트 상작성 견적 및 상담 이력:</strong> 상담 종료 시점으로부터 최대 1년 보유 후 영구 파기</li>
                  <li><strong>소비자의 불만 또는 분쟁처리에 관한 기록:</strong> 3년 보존 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                </ul>
              </div>

              {/* 제 3조 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  제 3조 (개인정보의 제3자 제공 및 위탁에 관한 단호한 방침)
                </h3>
                <p className="text-xs text-rose-600 font-bold leading-relaxed pl-3.5 bg-rose-50/50 p-4 rounded-xl border border-rose-100/60">
                  회사는 어떠한 경우에도 이용자의 동의 없이 개인정보를 외부에 무단 제공하거나 타 비즈니스 목적으로 위탁 유출하지 않는 것을 절대 원칙으로 삼고 있습니다. 범죄 수사 등 법령에 정해진 절차와 방법에 따라 관계기관의 요구가 있는 경우를 제외하고는 제3자 제공을 전면 차단합니다.
                </p>
              </div>

              {/* 제 4조 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  제 4조 (정보주체의 권리 및 행사방법)
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed pl-3.5">
                  이용자는 언제든지 등록되어 있는 자신의 개인정보 조회를 요청하거나, 정보의 오류가 있을 경우 수정 및 완전 파기(삭제)를 단호히 요구할 수 있습니다. 서면, 전화 또는 이메일을 통해 개인정보 보호책임자에게 연락하시면 즉시 지체 없이 조치하겠습니다.
                </p>
              </div>

            </article>
          ) : (
            /* 2. 이용약관 (TERMS CONTENT) */
            <article className="space-y-10 animate-fadeIn">
              <div className="space-y-2 border-b border-neutral-100 pb-6">
                <h2 className="text-2xl font-black text-[oklch(0.38_0.07_259.56)] tracking-tight">서비스 이용약관</h2>
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                  본 약관은 주식회사 다온씨엔이(이하 "회사")가 제공하는 인터넷 서비스 및 웹사이트의 이용조건 및 절차, 회사와 이용자 간의 명확한 권리, 의무 및 책임 사항을 단호하게 규정함을 목적으로 합니다.
                </p>
              </div>

              {/* 제 1조 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  제 1조 (목적 및 정의)
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed pl-3.5">
                  본 약관은 다온씨엔이가 웹사이트상에 게시하는 현장사진, 공사실적, 보유장비 등의 아카이브 카탈로그를 이용자가 열람하고, 제공되는 양식에 맞추어 비즈니스 견적을 정식 의뢰하는 절차 상의 신뢰를 수립하기 위한 법적 합의서입니다.
                </p>
              </div>

              {/* 제 2조 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  제 2조 (회사 지식재산권 보호에 관한 단호한 선언)
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed pl-3.5">
                  회사가 웹사이트에 직접 업로드하고 배포하는 모든 공사실적 그래픽, 현장 실사 사진, 고유 미디어 배너 소스는 회사의 소중한 기술 자산이자 <strong>저작권법의 보호를 받는 독점 저작물</strong>입니다.
                </p>
                <p className="text-xs text-rose-600 font-bold leading-relaxed pl-3.5 bg-rose-50/50 p-4 rounded-xl border border-rose-100/60">
                  회사의 사전 서면 승인 없이 본 플랫폼의 이미지, 동영상 데이터를 무단 복제, 캡처, 양도, 상업적 재배포 또는 자동화 봇(Crawler)을 이용한 무단 스크래핑을 하는 행위를 절대 금지하며, 적발 시 예고 없이 강력한 민·형사상 법적 조치와 손해배상 청구가 민사 소송으로 즉시 개시됩니다.
                </p>
              </div>

              {/* 제 3조 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  제 3조 (서비스 제공 및 면책 사항)
                </h3>
                <ul className="list-decimal pl-7 text-xs text-neutral-500 space-y-2 font-medium">
                  <li>회사는 천재지변, 전시, 디도스(DDoS) 공격, 가비아 호스팅 인프라의 마비 등 국가 비상사태에 준하는 불가항력적 사유로 인해 서비스를 일시적으로 제공할 수 없는 경우, 이에 대한 손해 책임으로부터 면책됩니다.</li>
                  <li>이용자가 견적 입력 폼에 허위 사실이나 오타가 있는 허위 정보를 입력하여 발생한 소통 차단 및 비즈니스 불이익에 대해서는 회사가 책임을 지지 않습니다.</li>
                </ul>
              </div>

              {/* 제 4조 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  제 4조 (관할 법원 규정)
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed pl-3.5">
                  본 약관 및 회사와 이용자 간에 발생한 비즈니스 분쟁, 저작권 침해 분쟁에 관한 소송이 제기될 경우, 대한민국 법률을 준거법으로 삼으며 <strong>회사의 본사 소재지를 관할하는 지방법원</strong>을 전속 관할 법원으로 삼아 단호히 해결합니다.
                </p>
              </div>

            </article>
          )}

        </div>

      </main>
    </div>
  );
};

export default PolicyView;