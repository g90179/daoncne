// daon-frontend/src/pages/about/CompanyCredentials.jsx
import React, { useState } from 'react';

const CompanyCredentials = () => {
  const [activeTab, setActiveTab] = useState('INTRO'); // INTRO, EQUIPMENT, HISTORY

  // 1. 회사소개 데이터 [cite: 2, 3]
  const companyInfo = {
    name: '주식회사 다온씨엔이 (DAON C&E)',
    ceo: '정 성 안',
    established: '2024년 12월 04일 (다온특수중량물 개업: 2022년 11월 17일)',
    bizNumber: '633-87-03472',
    address: '인천광역시 서구 백범로 926, 에이동 1층 (가좌동)',
    bizType: '산업용 기계 및 장비 도매업 / 건설업 (산업용기계설치, 냉동기 유지보수)',
  };

  const careers = [
    { id: 1, period: '2014.04 ~ 2018.05', company: '㈜에스아이이', role: '현장 작업 및 엔지니어링' },
    { id: 2, period: '2018.06 ~ 2022.04', company: '㈜케이원엔터테크', role: '현장 총괄 소장' },
    { id: 3, period: '2022.11.17 ~ 현재', company: '다온특수중량물', role: '대표' },
    { id: 4, period: '2024.12.04 ~ 현재', company: '㈜다온CNE (다온씨엔이)', role: '대표이사 법인 전환', isHighlight: true },
  ];

  // 2. 장비보유현황 데이터 [cite: 3, 4, 5]
  const equipments = [
    { no: 1, name: '전동 윈치', spec: '3마력 강력 유닛', qty: '1 ea', year: '2024.04', status: '최상' },
    { no: 2, name: '전동 윈치', spec: '1.5마력 최적 유닛', qty: '2 ea', year: '2022.10', status: '양호' },
    { no: 3, name: '라운드 실링 벨트 (Sling Belt)', spec: '4톤 / 10톤 / 20톤 / 30톤 컴플리트팩', qty: '30 set', year: '개별상이', status: '정밀검사필' },
    { no: 4, name: '와이어 수동 윈치 (티플러)', spec: '1.6 톤 재원', qty: '6 ea', year: '2023', status: '양호' },
    { no: 5, name: '초고압 유압잭 (Hydraulic Jack)', spec: '10톤 / 12톤 / 20톤 / 30톤', qty: '30 ea', year: '2024', status: '정밀양호' },
    { no: 6, name: '습식 코아 드릴 (Core Drill)', spec: 'KEYANG CD150', qty: '2 ea', year: '2023.05', status: '양호' },
    { no: 7, name: '핸드 자키 (Hand Pallet Truck)', spec: '2톤 / 2.5톤 중량물 핸드카', qty: '3 ea', year: '2022', status: '양호' },
    { no: 8, name: '알곤 (티그) 용접기', spec: 'SQ+ TIG-301DPS 전문 기종', qty: '1 ea', year: '2023', status: '양호' },
    { no: 9, name: '인버터 아크 용접기', spec: 'HST-200A 고성능형', qty: '2 ea', year: '2023', status: '양호' },
    { no: 10, name: '초고중량 이동 대차 바퀴', spec: '20톤 / 30톤 특수 사양', qty: '12 ea', year: '2023', status: '지정검사필' },
    { no: 11, name: '중량물 이동 대차 바퀴', spec: '10톤 스탠다드 사양', qty: '12 ea', year: '2022, 2023', status: '양호' },
    { no: 12, name: '수동 체인 블록 (Chain Block)', spec: '3톤 / 5톤 체인 호이스트', qty: '24 ea', year: '2023, 2024', status: '양호' },
    { no: 13, name: '전동 트롤리 호이스트', spec: '2톤 기종 (트롤리 5톤)', qty: '2 ea', year: '2024', status: '최상' },
  ];

  // 3. 연도별 실적 데이터 [cite: 5, 6, 7, 8]
  const projectHistory = [
    { year: '2025', items: [
      { id: 1, name: '서울대 연건 캠퍼스 냉온수기 반입', client: '월드에너지' },
      { id: 2, name: '상암 DMC힐스테이트 터보냉동기', client: '서울냉열' },
      { id: 3, name: '한화 포레나 천안아산역', client: '월드에너지' },
      { id: 4, name: '일산 킨텍스 터보냉동기 반입 및 반출', client: '서울냉열' },
      { id: 5, name: '의성요양원 냉온수기 반입 설치', client: '월드에너지' },
      { id: 6, name: '송도국제도서관 냉동기 반입', client: '월드에너지' },
    ]},
    { year: '2024', items: [
      { id: 7, name: '천안 이편한세상 냉동기 납품', client: 'DL 건설' },
      { id: 8, name: '가산동 데이타센타 공조기/냉동기 대량 반입', client: 'DL E&C' },
      { id: 9, name: '대구 동구 소방서 및 소방학교 냉동기 반입', client: '월드에너지' },
      { id: 10, name: '일산 동구 보건소 냉동기 반입', client: '월드에너지' },
      { id: 11, name: '서울 교통건설 냉동기 철거 공사', client: '한국플랜트' },
      { id: 12, name: '용인 죽전 데이터센타 냉동기 양중 반입', client: '월드에너지' },
      { id: 13, name: '고덕 디어반 냉동기 반입', client: '월드에너지' },
      { id: 14, name: '덕은지식산업센터 냉동기 반입', client: '월드에너지' },
      { id: 15, name: '서울 도시개발공사 냉동기 반입', client: '우영' },
    ]},
    { year: '2023', items: [
      { id: 16, name: '부산 서부 우체국 냉동기 철거 및 반입 수립', client: '현대공조' },
      { id: 17, name: '수원스타필드 대형 열교환기 반입', client: '㈜태봉' },
      { id: 18, name: '용산구청 냉동기 철거 및 반입 공정', client: '현대공조' },
    ]},
    { year: '2022', items: [
      { id: 19, name: '현대자동차 본사 냉동기 대규모 철거', client: '대동' },
    ]},
    { year: '2019 ~ 2021', items: [
      { id: 20, name: '판교 알파돔 냉동기 납품 시공', client: '삼중테크' },
      { id: 21, name: '파주 LG디스플레이 냉동기 양중 납품', client: 'LG' },
      { id: 22, name: '세종 KT&G / 제천 청풍리조트 냉동기 납품', client: 'LG' },
      { id: 23, name: '삼성 포승공장 현대위아 공냉식냉동기 납품', client: 'LG' },
      { id: 24, name: '수원 삼성 R4 냉동기 납품', client: '삼중테크' },
      { id: 25, name: '익산 미원(반도체) 및 광주 KGB 냉동기 납품', client: 'LG' },
      { id: 26, name: '김제 마리오 아울렛 LG냉동기 반입', client: 'LG' },
      { id: 27, name: '고덕평택삼성 P3 터보냉동기 반입 납품', client: 'TRANE' },
    ]}
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen text-neutral-900 font-sans antialiased selection:bg-blue-500/10 selection:text-blue-600">
      
      {/* 🌌 상단 프리미엄 미니멀 헤더 플레이트  */}
      <header className="bg-white border-b border-neutral-200/60 pt-32 pb-16 px-4 md:px-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-12 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <div className="text-[10px] tracking-widest font-black text-blue-500 uppercase font-mono bg-blue-50 px-3 py-1 rounded-full inline-block">
            Daon C&E Credentials
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[oklch(0.38_0.07_259.56)] tracking-tight">
            공사지명원 명세 자격
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 font-medium tracking-wide">
            축적된 특수중량물 인프라 핸들링 기술력과 기계설비 설치 공사의 단호한 전문성을 증명합니다. 
          </p>
        </div>

        {/* 🎛️ 중앙 세그먼트 스위치 멀티 탭  */}
        <div className="max-w-md mx-auto mt-10 p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200/40 flex gap-1 shadow-inner">
          {[
            ['INTRO', '회사소개'],
            ['EQUIPMENT', '장비보유현황'],
            ['HISTORY', '연도별 공실적']
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 text-xs font-bold py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === key
                  ? 'bg-white text-[oklch(0.38_0.07_259.56)] shadow-md font-black scale-[1.01]'
                  : 'text-neutral-400 hover:text-neutral-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* 📄 본문 메인 캔버스 보드 플레이트  */}
      <main className="max-w-6xl mx-auto py-12 md:py-16 px-4 md:px-10 animate-fadeIn">
        
        {/* =========================================================
            TAB 1: 회사소개 컴포지션 [cite: 2, 3]
            ========================================================= */}
        {activeTab === 'INTRO' && (
          <div className="space-y-12 text-left">
            {/* 기업 일반 개요 타일  */}
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-neutral-200/50 shadow-sm space-y-6">
              <h3 className="border-left-custom border-l-4 border-blue-500 pl-3 text-base font-black text-neutral-800">
                기업 개요 명세 
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                {[
                  ['회사명', companyInfo.name],
                  ['대표자', companyInfo.ceo],
                  ['설립일자', companyInfo.established],
                  ['사업자번호', companyInfo.bizNumber],
                  ['소재지', companyInfo.address],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between border-b border-neutral-100 pb-2">
                    <span className="text-neutral-400 font-medium">{label}</span>
                    <span className="text-neutral-800 font-bold max-w-xs text-right truncate" title={val}>{val}</span>
                  </div>
                ))}
                <div className="col-span-1 md:col-span-2 flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-400 font-medium">사업종류</span>
                  <span className="text-neutral-800 font-bold text-right">{companyInfo.bizType}</span>
                </div>
              </div>
            </div>

            {/* 대표이사 경력 수직 타임라인 플레이트 [cite: 3] */}
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-neutral-200/50 shadow-sm space-y-6">
              <h3 className="border-left-custom border-l-4 border-blue-500 pl-3 text-base font-black text-neutral-800">
                대표이사 실무 경력 배정 현황 [cite: 3]
              </h3>
              <div className="relative border-l border-neutral-200 ml-2 pl-6 space-y-6">
                {careers.map((c) => (
                  <div key={c.id} className="relative group">
                    <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 bg-white transition-all ${
                      c.isHighlight ? 'border-rose-500 scale-125 bg-rose-500 animate-pulse' : 'border-blue-500'
                    }`} />
                    <div className="space-y-1">
                      <span className={`text-[10px] font-mono font-bold ${c.isHighlight ? 'text-rose-500' : 'text-neutral-400'}`}>
                        {c.period}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-800">{c.company}</h4>
                      <p className="text-xs text-neutral-500 font-medium">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 미니멀 조직 아키텍처 트리 트리거 [cite: 3] */}
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-neutral-200/50 shadow-sm space-y-6 text-center">
              <h3 className="border-left-custom border-l-4 border-blue-500 pl-3 text-base font-black text-neutral-800 text-left">
                조직 기구 구성도 [cite: 3]
              </h3>
              <div className="pt-4 max-w-xl mx-auto space-y-4">
                <div className="bg-neutral-900 text-white font-bold text-xs py-3 px-6 rounded-xl inline-block shadow-md">대표이사 (CEO)</div>
                <div className="text-neutral-300 font-mono text-sm">↓</div>
                <div className="bg-slate-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl inline-block shadow-sm">임원 부서장</div>
                <div className="text-neutral-300 font-mono text-sm">↓</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['공무부', '견적산출 / 예산운용 / 실적계약 관리'],
                    ['공사부', '현장 안전 관리 / 시공 총괄 지휘'],
                    ['관리부', '인사총무 / 자금 집행 / 파너십 영업']
                  ].map(([dept, desc]) => (
                    <div key={dept} className="bg-neutral-50 border border-neutral-200/60 p-4 rounded-2xl text-left space-y-1">
                      <div className="text-xs font-black text-blue-600 border-b border-neutral-200/60 pb-1">{dept}</div>
                      <p className="text-[10px] text-neutral-400 leading-normal font-medium">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: 장비보유현황 캔버스 [cite: 2, 3, 4, 5]
            ========================================================= */}
        {activeTab === 'EQUIPMENT' && (
          <div className="bg-white rounded-[2.5rem] border border-neutral-200/50 shadow-sm overflow-hidden text-left">
            <div className="p-6 md:p-8 border-b border-neutral-100 flex justify-between items-center bg-white">
              <h3 className="border-left-custom border-l-4 border-blue-500 pl-3 text-base font-black text-neutral-800">
                특수 전용 보유 장비 인벤토리 명세 [cite: 3]
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full border border-emerald-200/40">
                100% 가동 최상 상태 유지
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200/60 text-neutral-500 font-bold">
                    <th className="py-3.5 px-4 w-12">No</th>
                    <th className="py-3.5 px-4 text-left">특수 공구명</th>
                    <th className="py-3.5 px-4 text-left">규격 및 엔지니어링 재원</th>
                    <th className="py-3.5 px-4">보유량</th>
                    <th className="py-3.5 px-4">매핑 년도</th>
                    <th className="py-3.5 px-4">관리 등급</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                  {equipments.map((e) => (
                    <tr key={e.no} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 text-neutral-400 font-mono">{e.no}</td>
                      <td className="py-3.5 px-4 text-left font-bold text-neutral-900">{e.name}</td>
                      <td className="py-3.5 px-4 text-left text-neutral-500">{e.spec}</td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900 font-mono">{e.qty}</td>
                      <td className="py-3.5 px-4 text-neutral-400 font-mono">{e.year}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          e.status.includes('최상') ? 'bg-blue-50 text-blue-500' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: 연도별 실적 아카이브 [cite: 2, 5, 6, 7, 8]
            ========================================================= */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-8 text-left">
            {projectHistory.map((group) => (
              <div key={group.year} className="space-y-4">
                {/* 연도 인덱서 마크 */}
                <div className="inline-block bg-neutral-900 text-white font-mono font-black text-xs px-4 py-1.5 rounded-xl shadow-sm">
                  {group.year} PERFORMANCE
                </div>
                
                {/* 실적 카드 그리드 아키텍처 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-5 rounded-2xl border border-neutral-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.005)] hover:border-blue-400 transition-all duration-300 flex justify-between items-center gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-neutral-800 truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-semibold">
                          <span>발주/시공사:</span>
                          <span className="text-neutral-600 font-bold">{item.client}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black tracking-wider bg-slate-50 border border-neutral-200/60 text-neutral-400 uppercase px-2 py-1 rounded-md shrink-0">
                        SUCCESS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default CompanyCredentials;