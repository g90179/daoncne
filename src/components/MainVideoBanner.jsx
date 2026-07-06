// daon-frontend/src/components/MainVideoBanner.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const MainVideoBanner = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExposedSlides = async () => {
      try {
        const res = await axios.get(`${API_URL}/main-slides/exposed`);
        setSlides(res.data);
      } catch (err) { console.error('메인 배너 로드 실패', err); }
      finally { setIsLoading(false); }
    };
    fetchExposedSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    // ⏱️ 현재 보여지고 있는 슬라이드의 고유 duration(초)을 밀리초 단위로 계산하여 가동
    const currentDuration = (slides[currentIndex]?.duration || 5) * 1000;

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, currentDuration);

    return () => clearTimeout(timer); // 슬라이드 전환 시 타이머 정돈 후 리셋
  }, [currentIndex, slides]);

  if (isLoading) return <div className="w-full h-screen bg-neutral-900 flex items-center justify-center text-white text-xs tracking-wider">LOADING ARCHIVE...</div>;
  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[70vh] md:h-screen bg-neutral-950 overflow-hidden select-none">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* 비디오 레이어 (자동재생, 음소거, 반복없음 정책 설정으로 부드러운 핸들셰이크 유도) */}
          {index === currentIndex && (
            <video
              src={slide.videoUrl}
              autoPlay
              muted
              playsInline
              loop
              className="w-full h-full object-cover opacity-60 pointer-events-none"
            />
          )}

          {/* 텍스트 내용물 오버레이 단락 (Neutrals Typography 매핑) */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40 z-20 flex items-center px-6 md:px-16">
            <div className="max-w-4xl space-y-3 mt-12 animate-fadeIn text-white">
              <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium font-mono">Engineering & Logistics Archive</span>
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
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MainVideoBanner;