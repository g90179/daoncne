// daon-frontend/src/components/KoreaArchiveMap.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import koreaMapSrc from '../assets/Map_of_South_Korea-blank.svg';

// ✨ 위경도 → 퍼센트 좌표 투영 (대한민국 등장방형 지도 관례 좌표 범위)
const LAT_MAX = 38.9;
const LAT_MIN = 33.0;
const LNG_MIN = 124.5;
const LNG_MAX = 132.0;

const projectToPercent = (lat, lng) => ({
  leftPct: ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100,
  topPct: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100,
});

const KoreaArchiveMap = ({ posts = [] }) => {
  const navigate = useNavigate();
  const [openKey, setOpenKey] = useState(null);

  // 말풍선 위치 상태 (드래그용)
  const [tooltipPositions, setTooltipPositions] = useState({});
  const draggingRef = useRef({ key: null, startX: 0, startY: 0, initialX: 0, initialY: 0 });

  // ✨ 좌표가 있는 게시물만 추려서, 같은 주소끼리 그룹핑
  const locations = useMemo(() => {
    const groups = new Map();

    posts
      .filter(p => p.workLat != null && p.workLng != null)
      .forEach(post => {
        const key = post.workAddress?.trim()
          || `${post.workLat.toFixed(2)},${post.workLng.toFixed(2)}`;

        if (!groups.has(key)) {
          const { leftPct, topPct } = projectToPercent(post.workLat, post.workLng);
          groups.set(key, {
            key,
            address: post.workAddress || '',
            leftPct,
            topPct,
            posts: [],
          });
        }
        groups.get(key).posts.push(post);
      });

    return Array.from(groups.values());
  }, [posts]);

  // 초기 위치 설정 (마운트 시 적용 - 겹침 방지 분산 배치)
  useEffect(() => {
    const initialPositions = {};
    locations.forEach((loc, index) => {
      const quadrantX = loc.leftPct < 50 ? 1 : -1;
      const quadrantY = loc.topPct < 50 ? 1 : -1;
      const stagger = (index % 4) * 35;
      initialPositions[loc.key] = { 
        x: quadrantX === 1 ? (20 + stagger) : (-140 - stagger), 
        y: quadrantY === 1 ? (20 + (index % 2) * 40) : (-100 - (index % 2) * 40) 
      };
    });
    setTooltipPositions(initialPositions);
  }, [locations]);

  // 드래그 핸들러
  const handleMouseDown = (key, e) => {
    draggingRef.current = {
      key,
      startX: e.clientX,
      startY: e.clientY,
      initialX: tooltipPositions[key]?.x || 0,
      initialY: tooltipPositions[key]?.y || 0,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const { key, startX, startY, initialX, initialY } = draggingRef.current;
    if (!key) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const newX = initialX + dx;
    const newY = initialY + dy;

    // ✨ 말풍선 간 물리적 충돌 및 밀어내기 로직 (Magnetic Repulsion)
    const nextPositions = { ...tooltipPositions, [key]: { x: newX, y: newY } };
    
    Object.keys(nextPositions).forEach(otherKey => {
      if (key === otherKey) return;
      
      const other = nextPositions[otherKey];
      const distX = Math.abs(newX - other.x);
      const distY = Math.abs(newY - other.y);
      
      // 말풍선 크기 기준 (약 180px 너비, 50px 높이)
      if (distX < 190 && distY < 60) {
        // 겹치면 상대방을 살짝 밀어냄 (repulsion)
        const pushX = newX > other.x ? 10 : -10;
        const pushY = newY > other.y ? 10 : -10;
        nextPositions[otherKey] = { x: other.x + pushX, y: other.y + pushY };
      }
    });

    setTooltipPositions(nextPositions);
  };

  const handleMouseUp = () => {
    draggingRef.current.key = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  if (locations.length === 0) return null;

  const handleMarkerClick = (loc) => {
    if (loc.posts.length === 1) {
      navigate(`/portfolio/${loc.posts[0].id}`);
    } else {
      setOpenKey(prev => (prev === loc.key ? null : loc.key));
    }
  };

  return (
    <section className="py-16 px-4 md:px-10 w-full">
      <div className="w-full mx-auto text-center space-y-10 overflow-hidden">
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

        <div className="relative mx-auto w-full max-w-sm sm:max-w-md aspect-[2/3] bg-white rounded-3xl p-4">
          <img
            src={koreaMapSrc}
            alt="대한민국 지도"
            className="absolute inset-0 w-full h-full object-contain p-4 pointer-events-none select-none"
            draggable={false}
          />

          {locations.map(loc => {
            const isOpen = openKey === loc.key;
            const count = loc.posts.length;
            const pos = tooltipPositions[loc.key] || { x: 0, y: -60 };

            return (
              <div
                key={loc.key}
                className="group absolute z-20"
                style={{
                  left: `${loc.leftPct}%`,
                  top: `${loc.topPct}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {!isOpen && (
                  <>
                    {/* <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-10">
                      <line 
                        x1="0" y1="0" 
                        x2={pos.x} y2={pos.y} 
                        stroke="#2bb4e8" strokeWidth="1" 
                      />
                    </svg>

                    <div 
                      className="absolute cursor-move w-max break-words"
                      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                      onMouseDown={(e) => handleMouseDown(loc.key, e)}
                    >
                      <div className="bg-neutral-900 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg max-w-[180px] text-center leading-snug">
                        {loc.posts[0]?.title}
                        {loc.posts.length > 1 && <span className="block text-[10px] text-neutral-300 font-medium mt-0.5">외 {loc.posts.length - 1}건</span>}
                      </div>
                    </div> */}
                  </>
                )}

                <button
                  onClick={() => handleMarkerClick(loc)}
                  className={`relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer group ${
                    count > 1
                      ? 'w-7 h-7 bg-[#2bb4e8] shadow-lg hover:bg-blue-600 text-white text-[11px] font-black'
                      : 'w-8 h-8 hover:scale-125'
                  }`}
                >
                  {count > 1 ? count : (
                    <>
                      <span 
                        className="absolute inset-0 block rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(43, 180, 232, 0.5) 0%, transparent 90%)' }}
                      />
                      <span className="absolute inset-2 rounded-full bg-[#2bb4e8] animate-ping opacity-40" />
                      <span className="relative w-3 h-3 bg-[#2bb4e8] rounded-full z-10 shadow-sm border border-[#d2e7ef]" />
                    </>
                  )}
                </button>

                {isOpen && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/70 shadow-2xl p-3 text-left z-30 animate-fadeIn">
                    {loc.address && (
                      <p className="text-[11px] text-neutral-500 font-bold truncate px-2 pb-2 mb-2 border-b border-neutral-100">
                        {loc.address}
                      </p>
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