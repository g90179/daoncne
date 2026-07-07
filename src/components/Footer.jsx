// daon-frontend/src/components/Footer.jsx
import React, { useEffect, useRef, useState } from 'react'; // 🔑 useState 추가
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

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

  // 🔑 국세청 실시간 상태 보관용 로컬 변수
  const [ntsStatus, setNtsStatus] = useState(''); 
  const [isNtsLoading, setIsNtsLoading] = useState(false);

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

  // 🔑 [신규 추가] 푸터 내부에서 안전하게 백엔드 프록시를 경유해 국세청 API를 찌르는 함수
  const handleNtsLookup = async () => {
    if (!companyInfo?.bizNumber || isNtsLoading) return;
    
    setIsNtsLoading(true);
    setNtsStatus('국세청 조회 중...');
    
    try {
      const cleanNum = companyInfo.bizNumber.replace(/\D/g, '');
      const res = await axios.get(`${API_URL}/company/nts-check/${cleanNum}`);
      setNtsStatus(res.data); // 국세청 검증 결과 데이터 주입
    } catch (err) {
      setNtsStatus('조회 실패 (네트워크 확인)');
    } finally {
      setIsNtsLoading(false);
    }
  };

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
            <span className="text-xs font-bold text-neutral-400 tracking-widest uppercase">
              위치 정보 준비 중
            </span>
          </div>
        )}
      </div>

      {/* 🏢 [레이어 2] 지도 위에 absolute로 떠 있는 회사 정보 카드 */}
      <div className="absolute top-8 left-6 right-6 md:right-16 md:left-auto bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-neutral-200/50 max-w-full md:w-[700px] z-10 transition-all">
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          
          {/* 👈 좌측 영역: 메타데이터 */}
          <div className="flex-1 w-full space-y-4">
            <div className="text-lg font-normal tracking-tight text-neutral-900">
              daon<span className="font-bold">cne</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs leading-relaxed">
              <InfoRow label="상호" value={companyInfo?.name} />
              <InfoRow label="대표자" value={companyInfo?.ceo} />
              
              {/* 🔑 [핵심 수정] 이제 외부 링크로 나가지 않고 클릭 시 국세청 실시간 조회가 발동합니다. */}
              <InfoRow 
                label="사업자등록번호" 
                value={
                  companyInfo?.bizNumber ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 cursor-pointer">
                      <button 
                        type="button"
                        onClick={handleNtsLookup}
                        className="hover:text-blue-600 hover:underline transition-colors text-neutral-600 font-mono text-left font-bold"
                        title="클릭 시 국세청 실시간 데이터 확인"
                      >
                        {formatBizNumber(companyInfo.bizNumber)}
                      </button>
                      
                      {/* 국세청 결과값 동적 레이블 표출 */}
                      {ntsStatus && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          ntsStatus.includes('일반') || ntsStatus.includes('정상')
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        } animate-fadeIn`}>
                          {ntsStatus}
                        </span>
                      )}
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