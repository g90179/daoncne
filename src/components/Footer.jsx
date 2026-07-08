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

const Footer = ({ companyInfo, isMapScriptLoaded }) => {
  const mapContainerRef = useRef(null);
  const hasCoords = !!(companyInfo?.lat && companyInfo?.lng);

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

  const InfoRow = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="flex gap-2 items-center">
        <span className="text-neutral-400 shrink-0">{label}</span>
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
      <div className="absolute top-8 left-6 right-6 md:right-16 md:left-auto bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-neutral-200/50 max-w-full md:w-[700px] z-10 transition-all">
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          
          {/* 👈 좌측 영역: 회사 정보 상세 표출단 */}
          <div className="flex-1 w-full space-y-4">
            <div className="text-lg font-normal tracking-tight text-neutral-900">
              daon<span className="font-bold">cne</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs leading-relaxed">
              <InfoRow label="상호" value={companyInfo?.name} />
              <InfoRow label="대표자" value={companyInfo?.ceo} />
              
              {/* 🔑 [핵심 수정] 요청하신 네이버 검색 파라미터 링크 결합 및 UI 배지 교체 */}
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
                            fill="none" // 🔑 내부 채우기 없이 투명하게 유지
                            viewBox="0 0 24 24" 
                            strokeWidth={2.5} 
                            // 🔑 오직 stroke(선) 색상만 blue-400 -> 호버 시 blue-500으로 변경합니다.
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

        {/* 카피라이트 */}
        <p className="text-[10px] text-neutral-400 pt-3 border-t border-neutral-100 font-medium mt-4">
          © {new Date().getFullYear()} {companyInfo?.name || 'Daon CNE'}. All rights reserved.
        </p>
      </div>

    </footer>
  );
};

export default Footer;