// daon-frontend/src/pages/about/CompanyCredentials.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../api/axios';
import { API_URL } from '../../config';

const CompanyCredentials = () => {
  const [activeTab, setActiveTab] = useState('INTRO'); // INTRO, EQUIPMENT, HISTORY

  // ✨ API 데이터를 저장할 상태들
  const [dynamicEquipments, setDynamicEquipments] = useState([]);
  const [isLoadingEquipments, setIsLoadingEquipments] = useState(false);
  
  const [dynamicHistory, setDynamicHistory] = useState([]); // ✨ 연도별 공실적 데이터 상태
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [fetchedCompany, setFetchedCompany] = useState(null); // 관리자 회사 정보

  // ✨ 컴포넌트 마운트 시 관리자 '회사 정보' 불러오기
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await api.get('/company');
        setFetchedCompany(response.data);
      } catch (error) {
        console.error('회사 정보를 불러오는데 실패했습니다.', error);
      }
    };
    fetchCompanyInfo();
  }, []);

  // ✨ 탭 활성화에 따른 API 호출 분기
  useEffect(() => {
    if (activeTab === 'EQUIPMENT') {
      fetchEquipments();
    } else if (activeTab === 'HISTORY') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchEquipments = async () => {
    setIsLoadingEquipments(true);
    try {
      const response = await api.get('/posts?category=보유장비');
      setDynamicEquipments(response.data || []);
    } catch (error) {
      console.error('보유장비 데이터를 불러오는데 실패했습니다.', error);
    } finally {
      setIsLoadingEquipments(false);
    }
  };

  // ✨ 공사실적 데이터를 불러와 연도별로 그룹화하는 함수
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await api.get('/posts?category=공사실적');
      const posts = response.data || [];

      // workYear 기준 그룹화 맵 생성
      const groupedMap = {};
      posts.forEach(post => {
        const year = post.workYear ? String(post.workYear) : '기타';
        if (!groupedMap[year]) {
          groupedMap[year] = [];
        }
        groupedMap[year].push({
          id: post.id,
          name: post.title,
          client: post.clientName || '미지정',
        });
      });

      // 연도 내림차순 정렬 변환
      const groupedArray = Object.keys(groupedMap)
        .sort((a, b) => b.localeCompare(a))
        .map(year => ({
          year,
          items: groupedMap[year]
        }));

      setDynamicHistory(groupedArray);
    } catch (error) {
      console.error('공사실적 데이터를 불러오는데 실패했습니다.', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 1. 회사소개 데이터 (관리자 데이터가 있으면 덮어쓰고, 없으면 기본값 유지)
  const companyInfo = {
    name: fetchedCompany?.name || '주식회사 다온씨엔이 (DAON C&E)',
    ceo: fetchedCompany?.ceo || '정 성 안',
    established: '2024년 12월 04일 (다온특수중량물 개업: 2022년 11월 17일)',
    bizNumber: fetchedCompany?.bizNumber || '633-87-03472',
    address: fetchedCompany?.address 
      ? `${fetchedCompany.address} ${fetchedCompany.addressDetail || ''}`.trim() 
      : '인천광역시 서구 백범로 926, 에이동 1층 (가좌동)',
    bizType: '산업용 기계 및 장비 도매업 / 건설업 (산업용기계설치, 냉동기 유지보수)',
  };

  const careers = [
    { id: 1, period: '2014.04 ~ 2018.05', company: '㈜에스아이이', role: '현장 작업 및 엔지니어링' },
    { id: 2, period: '2018.06 ~ 2022.04', company: '㈜케이원엔터테크', role: '현장 총괄 소장' },
    { id: 3, period: '2022.11.17 ~ 현재', company: '다온특수중량물', role: '대표' },
    { id: 4, period: '2024.12.04 ~ 현재', company: '㈜다온CNE (다온씨엔이)', role: '대표이사 법인 전환', isHighlight: true },
  ];

  return (
    <>
      <Helmet>
        <title>회사소개 | 다온씨엔이(DAON C&E)</title>
        <meta name="description" content="다온씨엔이의 기업 비전과 연혁, 오시는 길을 안내해 드립니다." />
        <meta property="og:title" content="회사소개 | 다온씨엔이" />
        <meta property="og:description" content="다온씨엔이의 기업 비전과 연혁을 확인해 보세요." />
      </Helmet>
    
      <div className="w-full bg-slate-50 min-h-screen text-neutral-900 font-sans antialiased selection:bg-blue-500/10 selection:text-blue-600">
        
        {/* 🌌 상단 프리미엄 미니멀 헤더 플레이트  */}
        <header className="bg-white border-b border-neutral-200/60 pt-32 pb-16 px-4 md:px-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
            <div className="absolute top-12 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          </div>
          
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <div className="text-[10px] tracking-widest font-black text-blue-500 uppercase font-mono bg-blue-50 px-3 py-1 rounded-full inline-block">
              Daon C&E Introduction
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[oklch(0.38_0.07_259.56)] tracking-tight">
              회사소개
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
              TAB 1: 회사소개 컴포지션
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

              {/* 대표이사 경력 수직 타임라인 플레이트 */}
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-neutral-200/50 shadow-sm space-y-6">
                <h3 className="border-left-custom border-l-4 border-blue-500 pl-3 text-base font-black text-neutral-800">
                  대표이사 실무 경력 배정 현황
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

              {/* 미니멀 조직 아키텍처 트리 트리거 */}
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-neutral-200/50 shadow-sm space-y-6 text-center">
                <h3 className="border-left-custom border-l-4 border-blue-500 pl-3 text-base font-black text-neutral-800 text-left">
                  조직 기구 구성도
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
              TAB 2: 장비보유현황 캔버스
              ========================================================= */}
          {activeTab === 'EQUIPMENT' && (
            <div className="bg-white rounded-[2.5rem] border border-neutral-200/50 shadow-sm overflow-hidden text-left animate-fadeIn">
              <div className="p-6 md:p-8 border-b border-neutral-100 flex justify-between items-center bg-white">
                <h3 className="border-left-custom border-l-4 border-blue-500 pl-3 text-base font-black text-neutral-800">
                  특수 전용 보유 장비 인벤토리 명세
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full border border-emerald-200/40">
                  100% 가동 최상 상태 유지
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200/60 text-neutral-500 font-bold">
                      <th className="py-3.5 px-4 w-14">No</th>
                      <th className="py-3.5 px-4 w-18">사진</th>
                      <th className="py-3.5 px-4 text-left">특수 공구명</th>
                      <th className="py-3.5 px-4 text-left">규격 및 엔지니어링 재원</th>
                      <th className="py-3.5 px-4">보유량</th>
                      <th className="py-3.5 px-4">매핑 년도</th>
                      <th className="py-3.5 px-4">관리 등급</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                    
                    {isLoadingEquipments ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-neutral-400 font-bold animate-pulse text-sm">
                          데이터를 불러오는 중입니다...
                        </td>
                      </tr>
                    ) : dynamicEquipments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-neutral-400 text-sm">
                          등록된 보유 장비가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      dynamicEquipments.map((e, index) => {
                        const thumbFile = e.files?.find(f => f.type === 'image' || f.name === 'editor_thumbnail');
                        const thumbUrl = thumbFile ? `${API_URL}${thumbFile.url}` : null;

                        return (
                          <tr key={e.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-4 text-neutral-400 font-mono align-middle">{index + 1}</td>
                            
                            <td className="py-2 px-4 align-middle">
                              <div className="flex justify-center items-center">
                                {thumbUrl ? (
                                  <img 
                                    src={thumbUrl} 
                                    alt={e.title} 
                                    className="w-10 h-10 rounded-full opacity-80 object-cover shadow-sm" 
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-300 text-[9px] shadow-sm font-bold tracking-tighter opacity-80">
                                    IMG
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-left font-bold text-neutral-900 align-middle">{e.title}</td>
                            <td className="py-3 px-4 text-left text-neutral-500 align-middle">{e.specifications || '-'}</td>
                            <td className="py-3 px-4 font-bold text-neutral-900 font-mono align-middle">{e.quantity || '-'}</td>
                            <td className="py-3 px-4 text-neutral-400 font-mono align-middle">{e.mappingYear || '-'}</td>
                            <td className="py-3 px-4 align-middle">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                e.managementGrade?.includes('최상') ? 'bg-blue-50 text-blue-500' : 'bg-neutral-100 text-neutral-600'
                              }`}>
                                {e.managementGrade || '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 3: 연도별 실적 아카이브 (API 연동)
              ========================================================= */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-8 text-left animate-fadeIn">
              {isLoadingHistory ? (
                <div className="bg-white p-12 rounded-[2.5rem] border border-neutral-200/50 text-center text-neutral-400 font-bold animate-pulse">
                  공사실적 데이터를 불러오는 중입니다...
                </div>
              ) : dynamicHistory.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] border border-neutral-200/50 text-center text-neutral-400 text-sm">
                  등록된 공사실적이 없습니다.
                </div>
              ) : (
                dynamicHistory.map((group) => (
                  <div key={group.year} className="space-y-4">
                    <div className="inline-block bg-neutral-900 text-white font-mono font-black text-xs px-4 py-1.5 rounded-xl shadow-sm">
                      {group.year} PERFORMANCE
                    </div>
                    
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
                ))
              )}
            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default CompanyCredentials;