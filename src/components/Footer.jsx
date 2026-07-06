import React, { useEffect, useRef } from 'react';

// ✅ 대지(onQuoteClick) 프롭스 추가
const Footer = ({ companyInfo, isMapScriptLoaded, onQuoteClick }) => {
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
      <div className="flex gap-2">
        <span className="text-neutral-400 shrink-0">{label}</span>
        <span className="text-neutral-600">{value}</span>
      </div>
    );
  };

  return (
    <footer className="w-full bg-white border-t border-neutral-200 relative">
      
      {/* 🗺️ [레이어 1] 좌우를 꽉 채우는 하단 지도 베이스 백그라운드 */}
      <div className="w-full h-[300px] relative z-0">
        {hasCoords ? (
          <div 
            ref={mapContainerRef} 
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-neutral-50 flex items-center justify-center">
            <span className="text-xs font-bold text-neutral-400 tracking-widest uppercase">
              위치 정보 준비 중
            </span>
          </div>
        )}
      </div>

      {/* 🏢 [레이어 2] 지도 위에 절대 좌표(absolute)로 하단(bottom-20)에 떠 있는 회사 정보 카드 */}
      <div className="absolute top-8 left-6 right-6 md:right-16 md:left-auto bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-neutral-200/50 max-w-full md:w-[620px] z-10 transition-all">
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          
          {/* 👈 좌측 영역: 로고 및 회사 상세 메타데이터 */}
          <div className="flex-1 w-full space-y-4">
            <div className="text-lg font-normal tracking-tight text-neutral-900">
              daon<span className="font-bold">cne</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs leading-relaxed">
              <InfoRow label="상호" value={companyInfo?.name} />
              <InfoRow label="대표자" value={companyInfo?.ceo} />
              <InfoRow label="사업자등록번호" value={companyInfo?.bizNumber} />
              <InfoRow label="팩스" value={companyInfo?.fax} />
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

          {/* 👉 우측 영역: 견적문의하기 버튼 & 강조된 전화번호 */}
          <div className="w-full md:w-auto flex flex-col items-stretch md:items-end justify-center shrink-0 gap-3 min-w-[140px]">
            <button
              type="button"
              onClick={() => {
                if (onQuoteClick) onQuoteClick();
              }}
              className="w-full text-center text-xs font-bold tracking-wider bg-blue-400 hover:bg-blue-500 text-white px-5 py-3 rounded-md shadow-sm transition-all duration-200 whitespace-nowrap"
            >
              견적문의하기
            </button>

            {/* 📞 버튼 아래로 배치하여 강조한 전화번호 레이아웃 */}
            {companyInfo?.phone && (
              <div className="text-center md:text-right space-y-0.5 px-0.5 w-full">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
                  CUSTOMER CENTER
                </span>
                <span className="text-base font-extrabold text-neutral-900 tracking-wide block">
                  {companyInfo.phone}
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