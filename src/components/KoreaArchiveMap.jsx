// daon-frontend/src/components/KoreaArchiveMap.jsx
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { API_URL } from '../config'; 
import koreaMapSrc from '../assets/Map_of_South_Korea-blank.svg';

const LAT_MAX = 38.9;
const LAT_MIN = 33.0;
const LNG_MIN = 124.5;
const LNG_MAX = 132.0;

const projectToPercent = (lat, lng) => ({
  leftPct: ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100,
  topPct: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100,
});

const INSET_LAT_MAX = 37.7;
const INSET_LAT_MIN = 37.0;
const INSET_LNG_MIN = 130.7;
const INSET_LNG_MAX = 132.0;

const isUlleungdoOrDokdo = (lat, lng, address) => {
  if (address && (address.includes('울릉') || address.includes('독도'))) return true;
  return lat >= 36.9 && lat <= 37.8 && lng >= 130.6 && lng <= 132.1;
};

const projectToInsetPercent = (lat, lng) => ({
  leftPct: ((lng - INSET_LNG_MIN) / (INSET_LNG_MAX - INSET_LNG_MIN)) * 100,
  topPct: ((INSET_LAT_MAX - lat) / (INSET_LAT_MAX - INSET_LAT_MIN)) * 100,
});

const MIN_ANGLE_GAP = 0.10;

const distributeAngles = (items) => {
  const arr = items.map(i => ({ ...i })).sort((a, b) => a.angle - b.angle);
  const n = arr.length;
  if (n < 2) return arr;
  for (let iter = 0; iter < 12; iter++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      const a = arr[i];
      const b = arr[(i + 1) % n];
      let diff = b.angle - a.angle;
      if (i === n - 1) diff += Math.PI * 2;
      if (diff < MIN_ANGLE_GAP) {
        const shift = (MIN_ANGLE_GAP - diff) / 2;
        a.angle -= shift;
        b.angle += shift;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return arr;
};

const getThumbnailUrl = (post) => {
  if (!post) return null;
  const imageFile = post.files?.find(f => f.type === 'image');
  if (imageFile && imageFile.url) {
    return `${API_URL}${imageFile.url}`;
  }
  return null;
};

const MarkerButton = ({ count, onClick, compact = false }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer group ${
      count > 1
        ? `${compact ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[11px]'} bg-[#2bb4e8] shadow-lg hover:bg-blue-600 text-white font-black`
        : `${compact ? 'w-5 h-5' : 'w-8 h-8'} hover:scale-125`
    }`}
  >
    {count > 1 ? count : (
      <>
        <span
          className="absolute inset-0 block rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(43, 180, 232, 0.5) 0%, transparent 90%)' }}
        />
        <span className={`absolute rounded-full bg-[#2bb4e8] animate-ping opacity-40 ${compact ? 'inset-1' : 'inset-2'}`} />
        <span className={`relative rounded-full bg-[#2bb4e8] z-10 shadow-sm border border-[#d2e7ef] ${compact ? 'w-2 h-2' : 'w-3 h-3'}`} />
      </>
    )}
  </button>
);

const LocationListPanel = ({ loc, navigate }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/70 shadow-2xl p-3 text-left z-30 animate-fadeIn">
    {loc.address && (
      <p className="text-[11px] text-neutral-500 font-bold truncate px-2 pb-2 mb-2 border-b border-neutral-100">
        {loc.address}
      </p>
    )}
    <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
      {loc.posts.map(post => {
        const thumbUrl = getThumbnailUrl(post);
        return (
          <button
            key={post.id}
            onClick={() => navigate(`/portfolio/${post.id}`)}
            className="w-full flex items-center gap-2 text-left text-xs font-semibold text-neutral-700 hover:text-[#2bb4e8] p-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"
          >
            {thumbUrl && (
              <img 
                src={thumbUrl} 
                alt={post.title} 
                className="w-8 h-8 object-cover rounded-md flex-shrink-0 bg-neutral-100"
              />
            )}
            <span className="truncate flex-1">{post.title}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const KoreaArchiveMap = ({ posts = [], isLoggedIn = false }) => {
  const navigate = useNavigate();
  const [openKey, setOpenKey] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const sectionRef = useRef(null);
  const mapNodeRef = useRef(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const resizeObserverRef = useRef(null);

  const containerRef = useCallback((node) => {
    mapNodeRef.current = node; 
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    if (node !== null) {
      const update = () => {
        setContainerSize({ width: node.offsetWidth, height: node.offsetHeight });
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(node);
      resizeObserverRef.current = ro;
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [tooltipPositions, setTooltipPositions] = useState({});
  const [draggingKey, setDraggingKey] = useState(null);
  const draggingRef = useRef({ key: null, startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const [savedPositions, setSavedPositions] = useState({});
  const [savedPositionsLoaded, setSavedPositionsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setTooltipPositions({}); }, [isMobile]);

  useEffect(() => {
    let mounted = true;
    api.get('/map-positions')
      .then(res => {
        if (mounted) {
          const rawData = res.data || [];
          const positionMap = {};
          if (Array.isArray(rawData)) {
            rawData.forEach(item => {
              positionMap[item.locationKey] = {
                xPct: item.xPct !== undefined ? item.xPct : item.offsetXPct,
                yPct: item.yPct !== undefined ? item.yPct : item.offsetYPct,
              };
            });
          } else {
            Object.assign(positionMap, rawData);
          }
          setSavedPositions(positionMap);
        }
      })
      .catch((err) => console.error('❌ 지도 위치 데이터 로드 실패:', err))
      .finally(() => { if (mounted) setSavedPositionsLoaded(true); });
    return () => { mounted = false; };
  }, []);

  const { mainLocations, insetLocations } = useMemo(() => {
    const mainGroups = new Map();
    const insetGroups = new Map();
    posts
      .filter(p => p.workLat != null && p.workLng != null)
      .forEach(post => {
        const toInset = isUlleungdoOrDokdo(post.workLat, post.workLng, post.workAddress);
        const groups = toInset ? insetGroups : mainGroups;
        const key = post.workAddress?.trim() || `${post.workLat.toFixed(2)},${post.workLng.toFixed(2)}`;
        if (!groups.has(key)) {
          const { leftPct, topPct } = toInset
            ? projectToInsetPercent(post.workLat, post.workLng)
            : projectToPercent(post.workLat, post.workLng);
          groups.set(key, { key, address: post.workAddress || '', leftPct, topPct, posts: [] });
        }
        groups.get(key).posts.push(post);
      });
    return { mainLocations: Array.from(mainGroups.values()), insetLocations: Array.from(insetGroups.values()) };
  }, [posts]);

  const mainLocationKeys = useMemo(() => mainLocations.map(l => l.key).join(','), [mainLocations]);
  const markerPixelPos = useCallback((loc) => ({
    x: (loc.leftPct / 100) * containerSize.width,
    y: (loc.topPct / 100) * containerSize.height,
  }), [containerSize]);

  const clampOffset = useCallback((markerPos, offset, width, height, isMobileState) => {
    const boundX = isMobileState ? 30 : 110; 
    const boundY = isMobileState ? 30 : 35;
    const padding = 15; 
    
    let bleedLeft = 0, bleedRight = 0, bleedTop = 0, bleedBottom = 0;
    
    if (sectionRef.current && mapNodeRef.current) {
      const sRect = sectionRef.current.getBoundingClientRect();
      const mRect = mapNodeRef.current.getBoundingClientRect();
      bleedLeft = mRect.left - sRect.left;
      bleedRight = sRect.right - mRect.right;
      bleedTop = mRect.top - sRect.top;
      bleedBottom = sRect.bottom - mRect.bottom;
    }

    const minX = -bleedLeft + boundX + padding;
    const maxX = width + bleedRight - boundX - padding;
    const minY = -bleedTop + boundY + padding;
    const maxY = height + bleedBottom - boundY - padding;

    let absX = markerPos.x + offset.x;
    let absY = markerPos.y + offset.y;

    if (absX < minX) absX = minX;
    if (absX > maxX) absX = maxX;
    if (absY < minY) absY = minY;
    if (absY > maxY) absY = maxY;

    return { x: absX - markerPos.x, y: absY - markerPos.y };
  }, []);

  useEffect(() => {
    if (!savedPositionsLoaded || !containerSize.width || !containerSize.height || mainLocations.length === 0) return;
    const { width, height } = containerSize;
    const cx = width / 2;
    const cy = height / 2;
    const rx = width / 2 + 76;
    const ry = height / 2 + 56;

    setTooltipPositions(prev => {
      const next = {};
      const needsAutoPlacement = [];

      mainLocations.forEach(loc => {
        const lookupKey = isMobile ? `${loc.key}_mobile` : loc.key;
        const markerPos = markerPixelPos(loc);
        
        let currentOffset = prev[loc.key];
        
        if (!currentOffset && savedPositions[lookupKey]) {
          const saved = savedPositions[lookupKey];
          currentOffset = { x: (saved.xPct / 100) * width, y: (saved.yPct / 100) * height };
        }

        if (currentOffset) {
          next[loc.key] = clampOffset(markerPos, currentOffset, width, height, isMobile);
        } else {
          const angle = Math.atan2(markerPos.y - cy, markerPos.x - cx);
          needsAutoPlacement.push({ key: loc.key, angle, markerX: markerPos.x, markerY: markerPos.y });
        }
      });

      if (needsAutoPlacement.length > 0) {
        distributeAngles(needsAutoPlacement).forEach(({ key, angle, markerX, markerY }) => {
          const tipAbsX = cx + rx * Math.cos(angle);
          const tipAbsY = cy + ry * Math.sin(angle);
          next[key] = clampOffset(
            { x: markerX, y: markerY }, 
            { x: tipAbsX - markerX, y: tipAbsY - markerY }, 
            width, 
            height, 
            isMobile
          );
        });
      }
      return next;
    });
  }, [containerSize.width, containerSize.height, mainLocationKeys, savedPositionsLoaded, savedPositions, markerPixelPos, isMobile, clampOffset]);

  const handleDragStart = (key, clientX, clientY, e) => {
    e.stopPropagation();
    const current = tooltipPositions[key] || { x: 0, y: -60 };
    draggingRef.current = { key, startX: clientX, startY: clientY, initialX: current.x, initialY: current.y };
    setDraggingKey(key);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
  };

  const handleMove = (clientX, clientY) => {
    const { key, startX, startY, initialX, initialY } = draggingRef.current;
    if (!key) return;
    
    const draggedLoc = mainLocations.find(l => l.key === key);
    if (!draggedLoc) return;
    const draggedMarker = markerPixelPos(draggedLoc);

    let newOffset = { x: initialX + (clientX - startX), y: initialY + (clientY - startY) };
    newOffset = clampOffset(draggedMarker, newOffset, containerSize.width, containerSize.height, isMobile);
    
    setTooltipPositions(prev => {
      const next = { ...prev, [key]: newOffset };
      const draggedAbs = { x: draggedMarker.x + newOffset.x, y: draggedMarker.y + newOffset.y };
      
      const MIN_DX = isMobile ? 65 : 176;
      const MIN_DY = isMobile ? 65 : 56;

      mainLocations.forEach(otherLoc => {
        if (otherLoc.key === key) return;
        const otherOffset = next[otherLoc.key];
        if (!otherOffset) return;
        
        const otherMarker = markerPixelPos(otherLoc);
        const otherAbs = { x: otherMarker.x + otherOffset.x, y: otherMarker.y + otherOffset.y };
        const distX = otherAbs.x - draggedAbs.x;
        const distY = otherAbs.y - draggedAbs.y;

        if (Math.abs(distX) < MIN_DX && Math.abs(distY) < MIN_DY) {
          const dirX = distX === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(distX);
          const dirY = distY === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(distY);
          
          next[otherLoc.key] = clampOffset(
            otherMarker,
            { x: otherOffset.x + dirX * 6, y: otherOffset.y + dirY * 6 },
            containerSize.width,
            containerSize.height,
            isMobile
          );
        }
      });
      return next;
    });
  };

  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleTouchMove = (e) => {
    if (e.cancelable) e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleDragEnd = () => {
    draggingRef.current.key = null;
    setDraggingKey(null);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleDragEnd);
  };

  const handleSavePositions = async () => {
    if (!containerSize.width || !containerSize.height) {
      alert('지도 크기가 계산되지 않았습니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }
    const payload = mainLocations
      .filter(loc => tooltipPositions[loc.key])
      .map(loc => ({
        locationKey: isMobile ? `${loc.key}_mobile` : loc.key,
        offsetXPct: (tooltipPositions[loc.key].x / containerSize.width) * 100,
        offsetYPct: (tooltipPositions[loc.key].y / containerSize.height) * 100,
      }));

    if (payload.length === 0) {
      alert('저장할 말풍선 위치 정보가 존재하지 않습니다. 말풍선을 조금 드래그한 후 시도해 보세요.');
      return;
    }
    setIsSaving(true);
    try {
      await api.put('/map-positions', { positions: payload });
      setSavedPositions(prev => {
        const next = { ...prev };
        payload.forEach(p => { next[p.locationKey] = { xPct: p.offsetXPct, yPct: p.offsetYPct }; });
        return next;
      });
      alert(`말풍선 위치가 성공적으로 저장되었습니다! (${isMobile ? '📱 모바일 화면 기준' : '💻 PC 화면 기준'})`);
    } catch (err) {
      alert(`저장에 실패했습니다. 원인: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (mainLocations.length === 0 && insetLocations.length === 0) return null;

  const handleMarkerClick = (loc) => {
    if (loc.posts.length === 1) {
      navigate(`/portfolio/${loc.posts[0].id}`);
    } else {
      setOpenKey(prev => (prev === loc.key ? null : loc.key));
    }
  };

  return (
    <section ref={sectionRef} className="py-16 px-4 md:px-10 w-full overflow-hidden">
      <div className="w-full mx-auto text-center space-y-10">
        <div className="space-y-3">
          <div className="text-[11px] tracking-widest font-black text-[#2bb4e8] uppercase font-mono bg-blue-50/70 px-4 py-1.5 rounded-full inline-block">
            Project Map
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
            다온씨엔이 전국 시공 현장
          </h2>
          <p className="text-sm text-neutral-500 font-medium">
            전국 곳곳에서 진행된 프로젝트 위치를 확인해보세요. 말풍선은 드래그로 옮길 수 있어요.
          </p>
          {isLoggedIn && (
            <button
              onClick={handleSavePositions}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? '저장 중...' : `📍 현재 말풍선 위치 저장 (${isMobile ? '모바일용' : 'PC용'})`}
            </button>
          )}
        </div>

        <div ref={containerRef} className="relative mx-auto w-full max-w-sm sm:max-w-md aspect-[2/3] bg-white rounded-3xl p-4">
          <img
            src={koreaMapSrc}
            alt="대한민국 지도"
            className="absolute inset-0 w-full h-full object-contain p-4 pointer-events-none select-none"
            draggable={false}
          />

          {mainLocations.map(loc => {
            const isOpen = openKey === loc.key;
            const pos = tooltipPositions[loc.key] || { x: 0, y: -60 };
            const isDraggingThis = draggingKey === loc.key;
            const thumbUrl = getThumbnailUrl(loc.posts[0]); 

            return (
              <React.Fragment key={loc.key}>
                <div
                  className="absolute z-20"
                  style={{ left: `${loc.leftPct}%`, top: `${loc.topPct}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <MarkerButton count={loc.posts.length} onClick={() => handleMarkerClick(loc)} />
                  {isOpen && <LocationListPanel loc={loc} navigate={navigate} />}
                </div>

                {!isOpen && (
                  <div
                    className="absolute z-10 pointer-events-none"
                    style={{ left: `${loc.leftPct}%`, top: `${loc.topPct}%` }}
                  >
                    <svg className="absolute top-0 left-0 overflow-visible pointer-events-none">
                      <line x1="0" y1="0" x2={pos.x} y2={pos.y} stroke="#2bb4e8" strokeWidth="1" />
                    </svg>

                    <div
                      className={`absolute pointer-events-auto cursor-move w-max ${isDraggingThis ? '' : 'transition-transform duration-150 ease-out'}`}
                      style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)` }}
                      onMouseDown={(e) => handleDragStart(loc.key, e.clientX, e.clientY, e)}
                      onTouchStart={(e) => handleDragStart(loc.key, e.touches[0].clientX, e.touches[0].clientY, e)}
                    >
                      {/* 🚀 [변경됨] 모바일에서 썸네일 존재 시 말풍선을 동그란 원형(rounded-full)으로 만듭니다 */}
                      <div className={`bg-[#fffffff5] ${isMobile && thumbUrl ? 'p-1 rounded-full' : 'p-2 rounded-sm'} border border-neutral-200/70 shadow-lg max-w-[200px] flex items-center ${isMobile && thumbUrl ? 'gap-0' : 'gap-2'} select-none`}
                      style={{ wordBreak : 'auto-phrase' }}>
                        
                        {thumbUrl && (
                          <img 
                            src={thumbUrl} 
                            alt="" 
                            // 🚀 [변경됨] 이미지 역시 완벽한 원형(rounded-full)으로 조정
                            className={`${isMobile ? 'w-10 h-10 rounded-full' : 'w-8 h-8 rounded-md'} object-cover flex-shrink-0 bg-white/20 shadow-sm`}
                          />
                        )}
                        
                        <div className={`flex-col items-start text-left flex-1 min-w-0 ${isMobile && thumbUrl ? 'hidden' : 'flex'}`}>
                          <div className="text-[11px] font-bold truncate w-full leading-snug">
                            {loc.posts[0]?.title}
                          </div>
                          {loc.posts.length > 1 && (
                            <span className="block text-[10px] text-neutral-500 font-medium mt-0.5">외 {loc.posts.length - 1}건</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          <div className="absolute top-3 right-0 w-[20%] h-[70px] bg-blue-50/40 border border-dashed border-blue-200 rounded-xl overflow-visible">
            <span className="absolute -top-2 left-1.5 bg-[#fcfcfc] px-1 text-[9px] font-bold text-neutral-400 whitespace-nowrap">
              울릉도·독도
            </span>
            <div className="absolute w-[34%] h-[34%] bg-neutral-200 rounded-full" style={{ left: '10%', top: '20%' }} />
            <div className="absolute w-[12%] h-[12%] bg-neutral-200 rounded-full" style={{ left: '82%', top: '58%' }} />

            {insetLocations.map(loc => {
              const isOpen = openKey === loc.key;
              const thumbUrl = getThumbnailUrl(loc.posts[0]); 

              return (
                <div
                  key={loc.key}
                  className="group absolute z-20"
                  style={{ left: `${loc.leftPct}%`, top: `${loc.topPct}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {!isOpen && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-30">
                      
                      {/* 🚀 [변경됨] 울릉도/독도 영역 말풍선도 모바일 시 원형(rounded-full) 적용 */}
                      <div className={`bg-neutral-900 text-white ${isMobile && thumbUrl ? 'p-1 rounded-full' : 'p-1.5 rounded-lg'} shadow-lg max-w-[150px] flex items-center ${isMobile && thumbUrl ? 'gap-0' : 'gap-1.5'} select-none`}>
                        
                        {thumbUrl && (
                          <img 
                            src={thumbUrl} 
                            alt="" 
                            // 🚀 [변경됨] 내부 이미지 원형 적용
                            className={`${isMobile ? 'w-8 h-8 rounded-full' : 'w-6 h-6 rounded-md'} object-cover flex-shrink-0 bg-neutral-800`}
                          />
                        )}

                        <div className={`flex-col items-start text-left flex-1 min-w-0 ${isMobile && thumbUrl ? 'hidden' : 'flex'}`}>
                          <div className="text-[10px] font-bold truncate w-full leading-snug">
                            {loc.posts[0]?.title}
                          </div>
                          {loc.posts.length > 1 && (
                            <span className="block text-[9px] text-neutral-300 font-medium">외 {loc.posts.length - 1}건</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <MarkerButton count={loc.posts.length} onClick={() => handleMarkerClick(loc)} compact />
                  {isOpen && <LocationListPanel loc={loc} navigate={navigate} />}
                </div>
              );
            })}

            {insetLocations.length === 0 && (
              <p className="absolute inset-0 flex items-center justify-center text-[9px] text-neutral-300 font-medium text-center px-2">
                등록된 현장 없음
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KoreaArchiveMap;