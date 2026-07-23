// daon-frontend/src/components/Footer.jsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const formatPhone = (num) => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, ''); 
  if (cleaned.startsWith('02')) {
    return cleaned.replace(/^(\d{2})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  }
  return cleaned.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
};

const formatBizNumber = (num) => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, '');
  return cleaned.replace(/^(\d{3})(\d{2})(\d{5})$/, '$1-$2-$3');
};

// 🚀 isLoggedIn과 setShowLoginModal 프롭스를 추가로 받습니다.
const Footer = ({ companyInfo, isMapScriptLoaded, isLoggedIn, setShowLoginModal }) => {
  const mapContainerRef = useRef(null);
  const hasCoords = !!(companyInfo?.lat && companyInfo?.lng);

  // 🚀 [관리자 비밀 통로] 클릭 횟수 및 타이머 추적 (5초 내 7번 클릭 감지)
  const secretClickCount = useRef(0);
  const secretClickTimer = useRef(null);

  const handleSecretClick = () => {
    // 이미 로그인 상태면 작동 무시
    if (isLoggedIn) return;

    // 첫 번째 클릭일 때만 5초 타이머 시작 (5초 뒤에는 무조건 횟수 0으로 증발)
    if (secretClickCount.current === 0) {
      secretClickTimer.current = setTimeout(() => {
        secretClickCount.current = 0;
      }, 5000);
    }

    secretClickCount.current += 1;

    // 제한 시간(5초) 안에 7번을 달성했다면?
    if (secretClickCount.current >= 7) {
      if (setShowLoginModal) setShowLoginModal(true); // 로그인 모달 오픈!
      
      // 성공했으므로 카운트와 타이머를 모두 깔끔하게 초기화
      secretClickCount.current = 0;
      clearTimeout(secretClickTimer.current); 
    }
  };

  useEffect(() => {
    if (!isMapScriptLoaded) return;
    if (!hasCoords) return;
    if (!mapContainerRef.current) return;
    if (!window.kakao || !window.kakao.maps) return;

    const coords = new window.kakao.maps.LatLng(companyInfo.lat, companyInfo.lng);
    const map = new window.kakao.maps.Map(mapContainerRef.current, {
      center: coords,
      level: 4,
    });

    const marker = new window.kakao.maps.Marker({ position: coords });
    marker.setMap(map);

    setTimeout(() => {
      map.relayout();
      map.setCenter(coords);
    }, 100);

  }, [isMapScriptLoaded, companyInfo?.lat, companyInfo?.lng, hasCoords]);

  // 🚀 특정 라벨 클릭 시 이벤트를 받을 수 있도록 onLabelClick 프롭스 추가
  const InfoRow = ({ label, value, onLabelClick }) => {
    if (!value) return null;
    return (
      <div className="flex gap-2 items-center">
        <span 
          // 🔑 cursor-pointer 대신 cursor-default를 사용하여 마우스 커서가 변하지 않게 숨김 처리!
          className={`text-neutral-400 shrink-0 ${onLabelClick ? 'cursor-default select-none' : ''}`}
          onClick={onLabelClick}
        >
          {label}
        </span>
        <div className="text-neutral-600 font-medium">{value}</div>
      </div>
    );
  };

  return (
    <footer className="w-full bg-white border-t border-neutral-200 relative">
      
      {/* 🗺️ [레이어 1] 카카오맵 백그라운드 */}
      <div className="w-full h-[300px] relative z-0">
        {hasCoords ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-neutral-50 flex items-center justify-center">
            <span className="text-xs font-bold text-neutral-400 tracking-widest uppercase">위치 정보 준비 중</span>
          </div>
        )}
      </div>

      {/* 🏢 [레이어 2] 지도 위에 떠 있는 회사 정보 카드 */}
      <div className="absolute top-8 left-6 right-6 md:right-16 md:left-auto bg-white/65 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-neutral-200/50 max-w-full md:w-[700px] z-10 transition-all">
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          
          {/* 👈 좌측 영역: 회사 정보 상세 표출단 */}
          <div className="flex-1 w-full space-y-4">
            <div className="text-lg font-normal tracking-tight text-neutral-900 text-left">
              daon<span className="font-bold">cne</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs leading-relaxed">
              <InfoRow label="상호" value={companyInfo?.name} />
              
              {/* 🚀 대표자 라벨 클릭 시 비밀 로그인 이벤트 트리거 */}
              <InfoRow 
                label="대표자" 
                value={companyInfo?.ceo} 
                onLabelClick={handleSecretClick} 
              />
              
              <InfoRow 
                label="사업자등록번호" 
                value={
                  companyInfo?.bizNumber ? (
                    <div className="flex items-center gap-2">
                      <a 
                        href={`https://search.naver.com/search.naver?sm=tab_clk.aitabkb&ssc=tab.ait.all&qvt=0&query=${companyInfo.bizNumber.replace(/\D/g, '')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center gap-1.5 hover:text-blue-400 transition-colors text-neutral-600 font-mono font-bold text-left"
                        title="클릭 시 네이버에서 사업자번호 정보 검색"
                      >
                        {formatBizNumber(companyInfo.bizNumber)} 
                        <span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={2.5} 
                            className="w-3 h-3 stroke-blue-400 group-hover:stroke-blue-500 transition-colors duration-200"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z" 
                            />
                          </svg>
                        </span>
                      </a>
                    </div>
                  ) : null
                } 
              />
              
              <InfoRow label="팩스" value={formatPhone(companyInfo?.fax)} />
              <InfoRow label="이메일" value={companyInfo?.email} />
              
              <div className="sm:col-span-2">
                <InfoRow 
                  label="주소" 
                  value={
                    companyInfo?.address 
                      ? `${companyInfo.address}${companyInfo.addressDetail ? ` ${companyInfo.addressDetail}` : ''}` 
                      : null
                  } 
                />
              </div>
            </div>
          </div>

          {/* ➖ 중앙 영역: 반응형 구분선 */}
          <div className="h-px w-full md:w-px md:h-auto md:self-stretch bg-neutral-200" />

          {/* 👉 우측 영역: 견적문의하기 링크 버튼 & 고객센터 */}
          <div className="w-full md:w-auto flex flex-col items-stretch md:items-end justify-center shrink-0 gap-3 min-w-[140px]">
            <Link
              to="/quotes"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full text-center text-xs font-bold tracking-wider bg-blue-400 hover:bg-blue-500 text-white px-5 py-3 rounded-md shadow-sm transition-all duration-200 whitespace-nowrap block"
            >
              견적문의하기
            </Link>

            {companyInfo?.phone && (
              <div className="text-center md:text-right space-y-0.5 px-0.5 w-full">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
                  CUSTOMER CENTER
                </span>
                <span className="text-base font-extrabold text-neutral-900 tracking-wide block font-mono">
                  {formatPhone(companyInfo.phone)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 카피라이트 & 약관 통합 싱글 라인 플레이트 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-neutral-400 pt-3 border-t border-neutral-100 font-medium mt-4 text-left">
          <Link
            to="/policy"
            state={{ tab: 'TERMS' }} // 약관 컴포넌트 내부 런타임 탭 분기용 시그널
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            이용약관
          </Link>
          
          <span className="text-neutral-200 select-none text-[9px]">|</span>
          
          <Link
            to="/policy"
            state={{ tab: 'PRIVACY' }} // 개인정보 내부 런타임 탭 분기용 시그널
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-neutral-500 hover:text-blue-500 transition-colors font-black cursor-pointer"
          >
            개인정보처리방침
          </Link>
          
          {/* 🔑 데스크톱 이상 화면에서만 노출되는 세련된 미니 구동점(Bullet) 구분자 */}
          <span className="text-neutral-200 select-none hidden sm:inline text-[9px]">|</span>
          
          <span className="text-neutral-400 block sm:inline">
            © {new Date().getFullYear()} {companyInfo?.name || 'Daon CNE'}. All rights reserved.
          </span>
        </div>
      </div>

    </footer>
  );
};

export default Footer;