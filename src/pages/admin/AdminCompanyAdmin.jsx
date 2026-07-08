// daon-frontend/src/pages/admin/AdminCompanyAdmin.jsx
import React, { useState, useEffect } from 'react';
import axiosOriginal from 'axios';
import { API_URL } from '../../config';

const formatPhone = (num) => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, '');
  if (cleaned.startsWith('02')) return cleaned.replace(/^(\d{2})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  return cleaned.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
};

const formatBizNumber = (num) => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, '');
  return cleaned.replace(/^(\d{3})(\d{2})(\d{5})$/, '$1-$2-$3');
};

const AdminCompanyAdmin = ({ isSuperAdmin, isMapScriptLoaded, fetchGlobalCompanyInfo }) => {
  const [companyName, setCompanyName] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [bizNumber, setBizNumber] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState(''); 
  const [phone, setPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [faxNumber, setFaxNumber] = useState('');
  const [lat, setLat] = useState(37.5665); 
  const [lng, setLng] = useState(126.9780); 

  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState({
    envKeyExist: '대기 중', scriptInjected: '대기 중', windowKakaoExist: '대기 중', sdkLoadComplete: '대기 중', geocoderLibraryExist: '대기 중'
  });

  const axiosInstance = axiosOriginal.create({ baseURL: API_URL });
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchLocalCompanyInfo = async () => {
    try {
      const res = await axiosInstance.get('/company');
      if (res.data) {
        setCompanyName(res.data.name || ''); setCeoName(res.data.ceo || ''); setBizNumber(res.data.bizNumber || '');
        setAddress(res.data.address || ''); setAddressDetail(res.data.addressDetail || ''); setPhone(res.data.phone || '');
        setCompanyEmail(res.data.email || ''); setFaxNumber(res.data.fax || '');
        if (res.data.lat) setLat(parseFloat(res.data.lat));
        if (res.data.lng) setLng(parseFloat(res.data.lng));
      }
    } catch (e) {}
  };

  useEffect(() => { fetchLocalCompanyInfo(); }, []);

  useEffect(() => {
    if (address && isMapScriptLoaded) {
      const initializeAdminMap = () => {
        const container = document.getElementById('admin-map');
        if (!container || !window.kakao?.maps?.services) return;
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const latVal = parseFloat(result[0].y);
            const lngVal = parseFloat(result[0].x);
            setLat(latVal); setLng(lngVal);
            const coords = new window.kakao.maps.LatLng(latVal, lngVal);
            const map = new window.kakao.maps.Map(container, { center: coords, level: 3 });
            const marker = new window.kakao.maps.Marker({ position: coords });
            marker.setMap(map);
          }
        });
      };
      initializeAdminMap();
    }
  }, [address, isMapScriptLoaded]);

  const handleAddressSearch = () => {
    if (window.daum?.Postcode) {
      new window.daum.Postcode({ oncomplete: (data) => setAddress(data.address) }).open();
    } else { alert('주소 검색 서비스를 불러오는 중입니다.'); }
  };

  const handleSaveCompanyInfo = async () => {
    try {
      await axiosInstance.post('/company', { name: companyName, ceo: ceoName, bizNumber, address, addressDetail, phone, email: companyEmail, fax: faxNumber, lat, lng });
      alert('회사 정보가 수정되었습니다.');
      if (fetchGlobalCompanyInfo) fetchGlobalCompanyInfo(); 
    } catch (e) { alert('회사 정보 저장 실패'); }
  };

  const runDiagnostics = () => {
    const report = {
      envKeyExist: (import.meta.env?.VITE_KAKAO_MAP_KEY) ? '통과' : '실패',
      scriptInjected: document.getElementById('kakao-map-script') ? '통과' : '실패',
      windowKakaoExist: window.kakao ? '통과' : '실패',
      sdkLoadComplete: (window.kakao && window.kakao.maps) ? '통과' : '실패',
      geocoderLibraryExist: (window.kakao?.maps?.services) ? '통과' : '실패'
    };
    setDiagnosticReport(report);
  };

  return (
    <div className="flex w-full relative animate-fadeIn">
      <div className="flex-1 max-w-4xl mx-auto space-y-6">
        
        {/* 🔑 다른 컴포넌트들과 통일성을 맞춘 소프트 글래스 메인 컨테이너 카드 */}
        <div className="bg-white/95 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.02)] border border-white/70 space-y-6">
          
          {/* 내부 탑 서브 제어 헤더 */}
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="text-base font-bold text-[oklch(0.38_0.07_259.56)] tracking-tight">
              🏢 기업 기본 인프라 설정
            </h3>
            {isSuperAdmin && (
              <button 
                onClick={() => { setShowDebugPanel(!showDebugPanel); runDiagnostics(); }} 
                className="bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-500 px-3.5 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition active:scale-95 cursor-pointer"
              >
                🚨 자가진단기 {showDebugPanel ? '닫기' : '켜기'}
              </button>
            )}
          </div>

          {/* 메인 데이터 입력 그리드 레이아웃 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">회사명 *</label>
              <input type="text" placeholder="회사명 입력" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-semibold outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/5 transition-all duration-300" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">대표자명 *</label>
              <input type="text" placeholder="대표자명 입력" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-semibold outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/5 transition-all duration-300" value={ceoName} onChange={e => setCeoName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">사업자 등록 번호</label>
              <input type="text" placeholder="숫자만 입력" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-bold font-mono outline-none focus:bg-white focus:border-blue-400 transition-all" value={formatBizNumber(bizNumber)} onChange={e => setBizNumber(e.target.value.replace(/\D/g, ''))} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">대표 전화번호</label>
              <input type="text" placeholder="숫자만 입력" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-bold font-mono outline-none focus:bg-white focus:border-blue-400 transition-all" value={formatPhone(phone)} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">공식 이메일 주소</label>
              <input type="text" placeholder="ex) info@daoncne.com" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 transition-all" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">팩스 번호 (FAX)</label>
              <input type="text" placeholder="숫자만 입력" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium font-mono outline-none focus:bg-white focus:border-blue-400 transition-all" value={faxNumber} onChange={e => setFaxNumber(e.target.value)} />
            </div>

            {/* 주소 로케이터 검색 블록 */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">기본 본사 주소 *</label>
              <div className="flex gap-3">
                <input type="text" readOnly placeholder="주소 검색 버튼을 클릭하세요" className="flex-1 bg-slate-100/50 border border-slate-200/30 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none select-none" value={address} />
                <button 
                  type="button"
                  onClick={handleAddressSearch} 
                  className="px-5 bg-slate-900 text-white hover:bg-blue-400 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
                >
                  주소 검색
                </button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">상세 주소 입력</label>
              <input type="text" placeholder="나머지 상세 건물명 및 호수를 기입하세요" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 transition-all" value={addressDetail} onChange={e => setAddressDetail(e.target.value)} />
            </div>

            {/* 🗺️ 카카오맵 컨테이너 테두리 라운딩 스무딩 처리 */}
            <div className="md:col-span-2 pt-2 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">지도 위치 동기화 프리뷰</label>
              <div className="rounded-2xl overflow-hidden border border-slate-200/60 p-1 bg-slate-50 shadow-inner">
                <div id="admin-map" className="w-full h-64 bg-slate-100 rounded-xl relative z-10" />
              </div>
            </div>

          </div>

          {/* 하단 최종 제출 바 구역: 테마에 맞는 bg-blue-400 및 은은한 가우시안 글로우그림자 연동 */}
          <div className="flex justify-end border-t border-slate-100/60 pt-5">
            <button 
              onClick={handleSaveCompanyInfo} 
              className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-blue-400/20 transition-all active:scale-95 cursor-pointer"
            >
              회사 정보 수정하기
            </button>
          </div>

        </div>
      </div>

      {/* 🚨 최고 관리자 전용 디버그 체크 패널 정밀 리스킨 (소프트 블러 투명 스퀘어 수용) */}
      {isSuperAdmin && showDebugPanel && (
        <div className="w-80 bg-slate-900/95 backdrop-blur-xl text-slate-100 h-screen fixed top-0 right-0 p-6 flex flex-col justify-between z-[150] shadow-[0_0_50px_rgba(0,0,0,0.15)] border-l border-slate-800 animate-fadeIn">
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-black text-xs text-blue-400 tracking-wider">// HARDWARE DIAGNOSTICS</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Kakao Maps SDK Integration Cache</p>
            </div>
            
            <div className="space-y-3 text-[11px] font-mono">
              {[
                { label: 'API Key Detection', val: diagnosticReport.envKeyExist },
                { label: 'Script Injected', val: diagnosticReport.scriptInjected },
                { label: 'window.kakao Global Object', val: diagnosticReport.windowKakaoExist },
                { label: 'SDK Engine Initialized', val: diagnosticReport.sdkLoadComplete },
                { label: 'Geocoder Module Library', val: diagnosticReport.geocoderLibraryExist },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-slate-400">{item.label}:</span>
                  <span className={`font-bold text-[10px] px-2 py-0.5 rounded-md ${item.val === '통과' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setShowDebugPanel(false)} 
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 text-xs rounded-xl font-bold transition cursor-pointer"
          >
            대시보드 패널 닫기
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCompanyAdmin;