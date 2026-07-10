// daon-frontend/src/components/MainVideoBanner.jsx
import React, { useState, useEffect } from 'react';
// 🔑 [수정] 올바른 상대 경로로 api 인스턴스 import
import api from '../api/axios'; 
import { API_URL } from '../config';

const MainVideoBanner = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoBuffering, setIsVideoBuffering] = useState(true);

  useEffect(() => {
    const fetchExposedSlides = async () => {
      try {
        // 🔑 [수정] axios 대신 통일된 api 인스턴스 사용
        const res = await api.get('/main-slides/exposed');
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

    const currentDuration = (slides[currentIndex]?.duration || 5) * 1000;

    const timer = setTimeout(() => {
      setIsVideoBuffering(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [currentIndex, slides]);

  return (
    <div className="relative w-full h-[600px] bg-neutral-950 overflow-hidden select-none flex items-center justify-center">
      
      {/* 1️⃣ 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-4 z-50">
          <div className="w-9 h-9 border-4 border-neutral-800 border-t-white rounded-full animate-spin" />
          <p className="text-white text-xs font-bold uppercase tracking-[0.2em] animate-pulse">LOADING ARCHIVE...</p>
        </div>
      )}

      {/* 2️⃣ 빈 데이터 상태 */}
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

      {/* 3️⃣ 슬라이드 매핑 */}
      {!isLoading && slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {index === currentIndex && (
            <video
              src={`${API_URL}${slide.videoUrl}`} 
              autoPlay
              muted
              playsInline
              loop
              onLoadedData={() => setIsVideoBuffering(false)}
              className={`w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${
                isVideoBuffering ? 'opacity-0' : 'opacity-60'
              }`}
            />
          )}

          {index === currentIndex && isVideoBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/30 z-10">
              <div className="w-6 h-6 border-2 border-neutral-800 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}

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

      {/* 4️⃣ 네비게이션 */}
      {!isLoading && slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (idx !== currentIndex) {
                  setIsVideoBuffering(true);
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