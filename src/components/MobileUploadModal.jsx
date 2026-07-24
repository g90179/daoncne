// daon-frontend/src/components/MobileUploadModal.jsx
import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';

const MobileUploadModal = ({ isOpen, onClose, onUpload }) => {
  // ✨ [신규] 단계 관리: 1 = 현장 정보 입력, 2 = 미디어/본문 작성
  const [step, setStep] = useState(1);

  const [previewSrc, setPreviewSrc] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' 또는 'video'
  const [uploadFile, setUploadFile] = useState(null);
  const [content, setContent] = useState('');
  
  // 상세 필드 설정 상태
  const [clientName, setClientName] = useState('');
  const now = new Date();
  const [workYear, setWorkYear] = useState(String(now.getFullYear()));
  const [workMonth, setWorkMonth] = useState(String(now.getMonth() + 1));
  const [workAddress, setWorkAddress] = useState('');
  const [workLat, setWorkLat] = useState(null);
  const [workLng, setWorkLng] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [additionalFiles, setAdditionalFiles] = useState([]);

  const [isUploading, setIsUploading] = useState(false);

  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const albumRef = useRef(null);
  const generalFileRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setFileType(isVideo ? 'video' : 'image');
    
    const previewUrl = URL.createObjectURL(file);
    setPreviewSrc(previewUrl);

    if (isVideo) {
      setUploadFile(file);
    } else {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        const compressed = await imageCompression(file, options);
        setUploadFile(compressed);
      } catch (error) {
        console.error('이미지 압축 실패:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleAdditionalFileChange = (e) => {
    setAdditionalFiles(Array.from(e.target.files));
  };

  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        const fullAddress = data.roadAddress || data.jibunAddress || data.address;
        setWorkAddress(fullAddress);

        if (window.kakao?.maps?.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.addressSearch(fullAddress, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              setWorkLat(parseFloat(result[0].y));
              setWorkLng(parseFloat(result[0].x));
            } else {
              setWorkLat(null);
              setWorkLng(null);
            }
          });
        }
      }
    }).open();
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    } else if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      setKeywords(prev => prev.slice(0, -1));
    }
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!keywords.includes(trimmed)) {
      setKeywords(prev => [...prev, trimmed]);
    }
    setKeywordInput('');
  };

  const removeKeyword = (name) => {
    setKeywords(prev => prev.filter(k => k !== name));
  };

  const handleSubmit = async () => {
    if (!uploadFile && !content.trim()) {
      alert('대표 미디어(사진/영상)나 본문 내용을 입력해 주세요.');
      return;
    }

    const finalKeywords = keywordInput.trim()
      ? [...keywords, keywordInput.trim().replace(/^#/, '')]
      : keywords;

    setIsUploading(true);
    await onUpload({
      file: uploadFile,
      content,
      clientName,
      workYear,
      workMonth,
      workAddress,
      workLat,
      workLng,
      keywords: finalKeywords,
      additionalFiles,
    });
    
    setIsUploading(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setPreviewSrc(null);
    setUploadFile(null);
    setFileType(null);
    setContent('');
    setClientName('');
    const now = new Date();
    setWorkYear(String(now.getFullYear()));
    setWorkMonth(String(now.getMonth() + 1));
    setWorkAddress('');
    setWorkLat(null);
    setWorkLng(null);
    setKeywords([]);
    setKeywordInput('');
    setAdditionalFiles([]);
    if (cameraRef.current) cameraRef.current.value = '';
    if (videoRef.current) videoRef.current.value = '';
    if (albumRef.current) albumRef.current.value = '';
    if (generalFileRef.current) generalFileRef.current.value = '';
  };

  const handleClose = () => { resetForm(); onClose(); };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col md:max-w-xl md:mx-auto md:shadow-2xl overflow-hidden animate-fadeIn">
      
      {/* 헤더 */}
      <div className="flex flex-col shrink-0 bg-white border-b border-slate-200">
        <div className="flex justify-between items-center px-4 h-14">
          <button onClick={handleClose} className="text-slate-900 text-2xl font-light cursor-pointer">
            ✕
          </button>
          <h2 className="text-base font-bold text-slate-900">새 포트폴리오 등록</h2>
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="text-base font-bold text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              다음
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={isUploading}
              className={`text-base font-bold transition-colors cursor-pointer ${isUploading ? 'text-slate-400' : 'text-blue-500 hover:text-blue-600'}`}
            >
              {isUploading ? '업로드 중...' : '공유'}
            </button>
          )}
        </div>

        {/* ✨ [신규] 단계 진행 표시 */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${step === 1 ? 'text-blue-500' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step === 1 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
            현장 정보
          </div>
          <div className="flex-1 h-[2px] bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full bg-blue-400 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${step === 2 ? 'text-blue-500' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step === 2 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            사진 · 본문
          </div>
        </div>
      </div>

      {/* 🚀 [수정됨] min-h-0 추가로 모바일 브라우저 스크롤 영역 정상화 */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-4 space-y-4 custom-scrollbar text-left">

        {/* ── STEP 1: 추가 현장 정보 입력 ── */}
        {step === 1 && (
          <>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">추가 현장 정보 입력</h3>
              <p className="text-[11px] text-slate-400">전부 선택 입력이에요. 없으면 비워두고 다음으로 넘어가도 괜찮아요.</p>
            </div>
            
            {/* 의뢰업체명 */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">의뢰업체명 <span className="normal-case font-medium text-slate-300">(선택)</span></label>
              <input
                type="text"
                placeholder="예: 다온씨엔이"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50/60 border border-slate-200/50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 transition"
              />
            </div>

            {/* 작업년도/월 */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">작업년도/월 <span className="normal-case font-medium text-slate-300">(선택)</span></label>
              <div className="flex gap-2">
                <select
                  value={workYear}
                  onChange={(e) => setWorkYear(e.target.value)}
                  className="flex-1 bg-slate-50/60 border border-slate-200/50 rounded-xl px-3 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 transition cursor-pointer"
                >
                  <option value="">년도 선택</option>
                  {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
                <select
                  value={workMonth}
                  onChange={(e) => setWorkMonth(e.target.value)}
                  className="flex-1 bg-slate-50/60 border border-slate-200/50 rounded-xl px-3 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 transition cursor-pointer"
                >
                  <option value="">월 선택</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}월</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 작업지 주소 */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">작업지 주소 <span className="normal-case font-medium text-slate-300">(선택)</span></label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="주소 검색 버튼을 눌러주세요"
                  value={workAddress}
                  className="flex-1 bg-slate-50/60 border border-slate-200/50 rounded-xl px-4 py-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="shrink-0 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl hover:bg-blue-500 transition cursor-pointer"
                >
                  주소 검색
                </button>
              </div>
              {workLat != null && workLng != null && (
                <p className="text-[10px] text-blue-400 font-mono pl-1">📍 좌표 매칭 완료 ({workLat.toFixed(4)}, {workLng.toFixed(4)})</p>
              )}
            </div>

            {/* 작업 키워드 */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">작업 키워드 <span className="normal-case font-medium text-slate-300">(선택 · 엔터로 추가)</span></label>
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-50/60 border border-slate-200/50 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-blue-400 transition">
                {keywords.map(kw => (
                  <span key={kw} className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-bold pl-2.5 pr-1.5 py-1 rounded-full border border-blue-100">
                    #{kw}
                    <button type="button" onClick={() => removeKeyword(kw)} className="w-3.5 h-3.5 rounded-full bg-white hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-[9px] font-black cursor-pointer">✕</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={keywords.length === 0 ? '예: 크레인작업 (엔터)' : '키워드 추가...'}
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  onBlur={addKeyword}
                  className="flex-1 min-w-[100px] bg-transparent text-sm outline-none py-1"
                />
              </div>
            </div>

            {/* 파일 첨부 */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">추가 첨부파일 <span className="normal-case font-medium text-slate-300">(선택)</span></label>
              <input 
                type="file"
                multiple
                ref={generalFileRef}
                onChange={handleAdditionalFileChange}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white file:hover:bg-blue-400 file:transition file:cursor-pointer"
              />
              {additionalFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {additionalFiles.map((f, idx) => (
                    <span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                      📎 {f.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            
          </div>
          {/* ✨ [신규] 입력 패널 하단 "다음" 버튼 */}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
          >
            다음 단계 →
          </button>
          </>
        )}

        {/* ── STEP 2: 미디어 선택 + 본문 작성 ── */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            {/* 이전 단계로 돌아가는 링크 (오탈자 등 다시 고치고 싶을 때) */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              ← 이전 단계 (현장 정보) 다시 보기
            </button>
            {/* 미디어 선택 영역 */}
            <div className="w-full h-40 bg-slate-100 relative rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-200 shadow-inner shrink-0">
              {previewSrc ? (
                <div className="relative w-full h-full">
                  {fileType === 'video' ? (
                    <video src={previewSrc} controls className="w-full h-full object-contain bg-black" playsInline />
                  ) : (
                    <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <button 
                    onClick={() => { setPreviewSrc(null); setUploadFile(null); setFileType(null); }}
                    className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center text-xs shadow-lg hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 w-full px-4">
                  <button 
                    onClick={() => cameraRef.current.click()}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="text-2xl">📸</span>
                    <span className="font-bold text-slate-700 text-xs">사진 촬영</span>
                  </button>

                  <button 
                    onClick={() => videoRef.current.click()}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="text-2xl">🎥</span>
                    <span className="font-bold text-slate-700 text-xs">영상 촬영</span>
                  </button>

                  <button 
                    onClick={() => albumRef.current.click()}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="text-2xl">🖼️</span>
                    <span className="font-bold text-slate-700 text-xs">앨범 선택</span>
                  </button>
                </div>
              )}

              <input type="file" ref={cameraRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              <input type="file" ref={videoRef} accept="video/*" capture="environment" className="hidden" onChange={handleFileChange} />
              <input type="file" ref={albumRef} accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* 메인 텍스트 내용 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">포트폴리오 본문 내용 *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="현장의 생생한 소식이나 설명을 작성해 주세요..."
                className="w-full h-40 p-3 text-sm resize-none outline-none bg-slate-50/50 rounded-xl border border-slate-100 text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MobileUploadModal;