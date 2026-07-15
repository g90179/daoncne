// daon-frontend/src/components/KoreaArchiveMap.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import KoreaMap from "../assets/Map_of_South_Korea-blank.svg?react";

// ✨ 위경도 → 커스텀 SVG 캔버스 투영 (로우폴리 지도 맵핑용 수치 재조정)
const LNG_MIN = 124.5;
const LNG_MAX = 131.5;
const LAT_MIN = 33.0; 
const LAT_MAX = 39.0; 
const VIEW_W = 550;
const VIEW_H = 700;

const project = (lat, lng) => {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VIEW_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VIEW_H;
  return { x, y };
};

// ✨ 로우폴리곤(Low-Poly) 지역 패스 데이터 (첨부 이미지 완벽 구현)
const REGIONS = [
  { id: 'gw', name: '강원도', path: 'M230,110 L280,110 L330,70 L370,160 L400,240 L350,260 L320,200 L270,220 L240,170 Z', fill: '#d8e7cb' },
  { id: 'gg', name: '경기도', path: 'M160,110 L230,110 L240,170 L270,220 L230,260 L180,260 L140,230 L120,180 L120,140 Z', fill: '#e2eed4' },
  { id: 'cb', name: '충청북도', path: 'M270,220 L320,200 L350,260 L340,300 L280,360 L240,310 L220,280 L230,260 Z', fill: '#a8a0ce' },
  { id: 'cn', name: '충청남도', path: 'M140,230 L180,260 L230,260 L220,280 L240,310 L190,360 L120,330 L80,260 L100,240 Z', fill: '#fae3ce' },
  { id: 'gb', name: '경상북도', path: 'M350,260 L400,240 L430,350 L420,390 L360,420 L310,410 L280,360 L340,300 Z', fill: '#c2d468' },
  { id: 'jb', name: '전라북도', path: 'M120,330 L190,360 L240,310 L280,360 L310,410 L260,440 L180,440 L120,410 L80,360 Z', fill: '#a89f97' },
  { id: 'jn', name: '전라남도', path: 'M80,360 L120,410 L180,440 L260,440 L280,500 L220,550 L140,560 L70,510 L50,440 Z', fill: '#fcefd1' },
  { id: 'gn', name: '경상남도', path: 'M310,410 L360,420 L420,390 L400,480 L350,510 L320,530 L280,500 L260,440 Z', fill: '#a4d9ef' },
];

// ✨ 주요 광역시 및 특별시 오버레이
const CITIES = [
  { id: 'seoul', name: '서울특별시', path: 'M160,150 L190,140 L200,180 L170,190 Z', fill: '#fff6ef' },
  { id: 'incheon', name: '인천광역시', path: 'M80,150 L120,140 L120,180 L90,170 Z', fill: '#dcf1fd' },
  { id: 'daejeon', name: '대전광역시', path: 'M200,280 L230,270 L240,300 L210,310 Z', fill: '#fff6ef' },
  { id: 'daegu', name: '대구광역시', path: 'M330,340 L370,330 L380,370 L340,380 Z', fill: '#bec8e1' },
  { id: 'ulsan', name: '울산광역시', path: 'M380,380 L415,380 L410,410 L370,410 Z', fill: '#fbcdb4' },
  { id: 'busan', name: '부산광역시', path: 'M360,430 L405,420 L410,470 L370,480 Z', fill: '#eaf4d5' },
  { id: 'gwangju', name: '광주광역시', path: 'M120,440 L160,440 L170,480 L130,480 Z', fill: '#fff6ef' },
];

// ✨ 섬 지역
const ISLANDS = [
  { id: 'jeju', name: '제주도', path: 'M100,620 L150,590 L220,620 L180,660 L120,650 Z', fill: '#fff5ec' },
  { id: 'ulleung', name: '울릉도', path: 'M440,130 L460,120 L480,140 L470,160 L450,160 Z', fill: '#fff5ec' },
  { id: 'dokdo', name: '독도', path: 'M510,150 L520,150 L520,160 L510,160 Z', fill: '#fff5ec' },
];

// ✨ 굵은 외곽선을 위한 실루엣 패스 (완벽하게 맞물리는 최외곽 좌표선)
const OUTER_PATH = 'M230,110 L280,110 L330,70 L370,160 L400,240 L430,350 L420,390 L400,480 L350,510 L320,530 L280,500 L220,550 L140,560 L70,510 L50,440 L80,360 L120,330 L80,260 L100,240 L140,230 L120,180 L90,170 L80,150 L120,140 L160,110 Z';

// ✨ 라벨 및 주황색 도트 위치 지정
const LABELS = [
  { text: '서울특별시', tX: 185, tY: 175, dX: 175, dY: 171, align: 'start' },
  { text: '인천광역시', tX: 115, tY: 180, dX: 125, dY: 176, align: 'end' },
  { text: '경기도', tX: 180, tY: 220, dX: 155, dY: 216, align: 'middle' },
  { text: '강원도', tX: 320, tY: 140, dX: 290, dY: 136, align: 'start' },
  { text: '충청북도', tX: 290, tY: 260, dX: 255, dY: 256, align: 'start' },
  { text: '충청남도', tX: 140, tY: 275, dX: 175, dY: 271, align: 'end' },
  { text: '대전광역시', tX: 205, tY: 294, dX: 220, dY: 290, align: 'end' },
  { text: '경상북도', tX: 330, tY: 310, dX: 300, dY: 306, align: 'start' },
  { text: '대구광역시', tX: 360, tY: 360, dX: 345, dY: 356, align: 'start' },
  { text: '전라북도', tX: 180, tY: 380, dX: 150, dY: 376, align: 'start' },
  { text: '전라남도', tX: 160, tY: 500, dX: 130, dY: 496, align: 'start' },
  { text: '광주광역시', tX: 165, tY: 460, dX: 145, dY: 456, align: 'start' },
  { text: '경상남도', tX: 310, tY: 460, dX: 280, dY: 456, align: 'start' },
  { text: '울산광역시', tX: 420, tY: 400, dX: 405, dY: 396, align: 'start' },
  { text: '부산광역시', tX: 410, tY: 450, dX: 385, dY: 446, align: 'start' },
  { text: '제주도', tX: 180, tY: 620, dX: 160, dY: 616, align: 'start' },
  { text: '울릉도', tX: 470, tY: 130, dX: 455, dY: 126, align: 'start' },
  { text: '독도', tX: 530, tY: 155, dX: 515, dY: 151, align: 'start' },
];

const KoreaArchiveMap = ({ posts = [] }) => {
  const navigate = useNavigate();
  const [openKey, setOpenKey] = useState(null);

  // ✨ 좌표가 있는 게시물만 추려서, 같은 주소끼리 그룹핑
  const locations = useMemo(() => {
    const groups = new Map();

    posts
      .filter(p => p.workLat != null && p.workLng != null)
      .forEach(post => {
        const key = post.workAddress?.trim() 
          || `${post.workLat.toFixed(2)},${post.workLng.toFixed(2)}`;

        if (!groups.has(key)) {
          const { x, y } = project(post.workLat, post.workLng);
          groups.set(key, {
            key,
            address: post.workAddress || '',
            x, y,
            leftPct: (x / VIEW_W) * 100,
            topPct: (y / VIEW_H) * 100,
            posts: [],
          });
        }
        groups.get(key).posts.push(post);
      });

    return Array.from(groups.values());
  }, [posts]);

  if (locations.length === 0) return null;

  const handleMarkerClick = (loc) => {
    if (loc.posts.length === 1) {
      navigate(`/portfolio/${loc.posts[0].id}`);
    } else {
      setOpenKey(prev => (prev === loc.key ? null : loc.key));
    }
  };

  return (
    <section className="py-16 bg-[#fcfcfc] px-4 md:px-10 w-full border-b border-neutral-100">
      <div className="max-w-5xl mx-auto text-center space-y-10">
        <div className="space-y-3">
          <div className="text-[11px] tracking-widest font-black text-[#2bb4e8] uppercase font-mono bg-blue-50/70 px-4 py-1.5 rounded-full inline-block">
            Project Map
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
            다온씨엔이 전국 시공 현장
          </h2>
          <p className="text-sm text-neutral-500 font-medium">
            전국 곳곳에서 진행된 프로젝트 위치를 확인해보세요.
          </p>
        </div>

        {/* 지도 컨테이너: 첨부 이미지 기반 흰색 바탕 */}
        <div className="relative mx-auto w-full max-w-lg aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200/60 p-4">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            
            {/* 바다 텍스트 배경 라벨 */}
            <text x="420" y="230" fontSize="22" fill="#7a7a7a" fontWeight="800" textAnchor="middle" opacity="0.6">동해</text>
            <text x="70" y="380" fontSize="22" fill="#7a7a7a" fontWeight="800" textAnchor="middle" opacity="0.6">서해</text>

            {/* 1. 지역별 색상 및 얇은 내부 선 */}
            {[...REGIONS, ...CITIES, ...ISLANDS].map(region => (
              <path 
                key={region.id}
                d={region.path} 
                fill={region.fill} 
                stroke="#111111" 
                strokeWidth="1.5" 
                strokeLinejoin="round" 
              />
            ))}

            {/* 2. 두꺼운 외곽선 (내부 선 위에 덮어씌워 퀄리티 업그레이드) */}
            <path d={OUTER_PATH} stroke="#111111" strokeWidth="4.5" fill="none" strokeLinejoin="round" pointerEvents="none" />
            <path d={ISLANDS.find(i => i.id === 'jeju').path} stroke="#111111" strokeWidth="4.5" fill="none" strokeLinejoin="round" pointerEvents="none" />
            <path d={ISLANDS.find(i => i.id === 'ulleung').path} stroke="#111111" strokeWidth="3" fill="none" strokeLinejoin="round" pointerEvents="none" />
            <path d={ISLANDS.find(i => i.id === 'dokdo').path} stroke="#111111" strokeWidth="3" fill="none" strokeLinejoin="round" pointerEvents="none" />

            {/* 3. 텍스트 라벨 및 주황색 도트 표시 */}
            <g fill="#555555" fontSize="12" fontWeight="700">
              {LABELS.map((label, idx) => (
                <React.Fragment key={idx}>
                  <circle cx={label.dX} cy={label.dY} r="3.5" fill="#e68b44" stroke="#ffffff" strokeWidth="1" />
                  <text x={label.tX} y={label.tY} textAnchor={label.align}>{label.text}</text>
                </React.Fragment>
              ))}
            </g>
          </svg>

          {/* 실제 시공 현장 (데이터 마커) 렌더링 부분 */}
          {locations.map(loc => {
            const isOpen = openKey === loc.key;
            const count = loc.posts.length;
            return (
              <div
                key={loc.key}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${loc.leftPct}%`, top: `${loc.topPct}%` }}
              >
                <button
                  onClick={() => handleMarkerClick(loc)}
                  className={`relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer shadow-lg group ${
                    count > 1
                      ? 'w-7 h-7 bg-[#2bb4e8] hover:bg-blue-600 text-white text-[11px] font-black'
                      : 'w-4 h-4 bg-white border-[4px] border-[#2bb4e8] hover:scale-125'
                  }`}
                >
                  {count > 1 && count}
                  {/* 단일 마커 애니메이션 효과 */}
                  {count === 1 && <span className="absolute inset-0 rounded-full bg-[#2bb4e8] animate-ping opacity-40" />}
                </button>

                {/* 다건 그룹 패널 */}
                {isOpen && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/70 shadow-2xl p-3 text-left z-30 animate-fadeIn">
                    {loc.address && (
                      <div className="flex items-center gap-1.5 px-2 pb-2 mb-2 border-b border-neutral-100">
                        {/* 지도 배경 렌더링 */}
                        <KoreaMap className="w-full h-auto text-neutral-300" fill="currentColor" />
                        <p className="text-[11px] text-neutral-500 font-bold truncate">
                          {loc.address}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {loc.posts.map(post => (
                        <button
                          key={post.id}
                          onClick={() => navigate(`/portfolio/${post.id}`)}
                          className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-[#2bb4e8] px-2 py-2 rounded-lg hover:bg-blue-50 transition truncate cursor-pointer"
                        >
                          {post.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default KoreaArchiveMap;