// daon-frontend/src/components/MainVideoBanner.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const MainVideoBanner = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoBuffering, setIsVideoBuffering] = useState(true); // 🔑 영상 데이터 로딩 상태 추적 추가

  useEffect(() => {
    const fetchExposedSlides = async () => {
      try {
        const res = await axios.get(`${API_URL}/main-slides/exposed`);
        setSlides(res.data);
      } catch (err) { 
        console.error('메인 배너 로드 실패', err); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchExposedSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    // ⏱️ 현재 보여지고 있는 슬라이드의 고유 duration(초)을 밀리초 단위로 계산하여 가동
    const currentDuration = (slides[currentIndex]?.duration || 5) * 1000;

    const timer = setTimeout(() => {
      setIsVideoBuffering(true); // 🔑 다음 슬라이드로 넘어갈 때 버퍼링 표시 켜기
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, currentDuration);

    return () => clearTimeout(timer); // 슬라이드 전환 시 타이머 정돈 후 리셋
  }, [currentIndex, slides]);

  return (
    /* 🔑 [핵심 수정] h-[600px]를 고정하고 조기 리턴을 없앰으로써, 어떤 조건에서도 최소 600px의 레이아웃 영역을 보장합니다. */
    <div className="relative w-full h-[600px] bg-neutral-950 overflow-hidden select-none flex items-center justify-center">
      
      {/* 1️⃣ 백엔드에서 최초 슬라이드 배열을 가져오는 전체 로딩 상태일 때 */}
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-4 z-50">
          <div className="w-9 h-9 border-4 border-neutral-800 border-t-white rounded-full animate-spin" />
          <p className="text-white text-xs font-bold uppercase tracking-[0.2em] animate-pulse">LOADING ARCHIVE...</p>
        </div>
      )}

      {/* 2️⃣ 로딩은 끝났으나 노출(isExposed) 상태의 슬라이드가 아예 비어있을 때 (Fallback 플레이스홀더) */}
      {!isLoading && slides.length === 0 && (
        <div className="w-full h-full flex flex-col justify-center items-center text-center p-6 space-y-4 relative z-40 animate-fadeIn">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="space-y-2">
            <div className="text-xl font-light text-neutral-600 tracking-widest uppercase">
              daon<span className="font-bold text-neutral-500">cne</span>
            </div>
            <h2 className="text-white font-black text-xl md:text-2xl tracking-tight">
              최상의 중량물 설비 이전 및 설치 솔루션
            </h2>
            <p className="text-neutral-500 text-xs font-normal max-w-md mx-auto leading-relaxed">
              현재 메인 배너 미디어를 동기화 중이거나 준비 중입니다. 아래 아카이브 필터를 통해 다온씨엔이의 핵심 공사실적을 먼저 확인하실 수 있습니다.
            </p>
          </div>
          <div className="w-1 h-10 bg-gradient-to-b from-white/40 to-transparent rounded-full animate-bounce mt-4" />
        </div>
      )}

      {/* 3️⃣ 정상적으로 표출할 슬라이드 데이터가 존재할 때 매핑 루프 가동 */}
      {!isLoading && slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* 비디오 레이어 (자동재생, 음소거, 플레이스홀더 유기적 연동) */}
          {index === currentIndex && (
            <video
              src={`${API_URL}${slide.videoUrl}`} 
              autoPlay
              muted
              playsInline
              loop
              onLoadedData={() => setIsVideoBuffering(false)} // 🔑 영상 실제 스트리밍 준비 완료 시 스위칭
              className={`w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${
                isVideoBuffering ? 'opacity-0' : 'opacity-60'
              }`}
            />
          )}

          {/* 🔑 특정 개별 영상이 아직 네트워킹 버퍼링 중일 때 띄워줄 로컬 인디케이터 */}
          {index === currentIndex && isVideoBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/30 z-10">
              <div className="w-6 h-6 border-2 border-neutral-800 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}

          {/* 텍스트 내용물 오버레이 단락 */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40 z-20 flex items-center px-6 md:px-16">
            <div className="max-w-4xl space-y-3 mt-12 animate-fadeIn text-white">
              <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium font-mono">
                Engineering & Logistics Archive
              </span>
              <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-[1.2] whitespace-pre-wrap">
                {slide.title}
              </h1>
              {slide.description && (
                <p className="text-xs md:text-sm text-neutral-300 font-normal leading-relaxed tracking-wide max-w-xl pt-1">
                  {slide.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* 🧭 슬라이더 하단 네비게이션 인디케이터 도트 */}
      {!isLoading && slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (idx !== currentIndex) {
                  setIsVideoBuffering(true); // 다른 도트 클릭 시 로딩 애니메이션 리셋
                  setCurrentIndex(idx);
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MainVideoBanner;