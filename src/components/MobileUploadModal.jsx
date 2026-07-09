// daon-frontend/src/components/MobileUploadModal.jsx
import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';

const MobileUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [previewSrc, setPreviewSrc] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' 또는 'video'
  const [uploadFile, setUploadFile] = useState(null);
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 📸 세 가지 액션을 위한 개별 Ref 생성
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const albumRef = useRef(null);

  if (!isOpen) return null;

  // 파일 선택 및 압축(이미지만) 처리 로직
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setFileType(isVideo ? 'video' : 'image');
    
    // 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file);
    setPreviewSrc(previewUrl);

    if (isVideo) {
      // 🎥 비디오는 브라우저 이미지 압축을 거치지 않고 원본을 전달합니다.
      setUploadFile(file);
    } else {
      // 📸 이미지는 초고속 리사이징/압축 진행
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

  const handleSubmit = async () => {
    if (!uploadFile && !content) {
      alert('사진(영상)이나 내용을 입력해 주세요.');
      return;
    }

    setIsUploading(true);
    await onUpload({ file: uploadFile, content });
    
    // 초기화 및 닫기
    setIsUploading(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setPreviewSrc(null);
    setUploadFile(null);
    setFileType(null);
    setContent('');
    if (cameraRef.current) cameraRef.current.value = '';
    if (videoRef.current) videoRef.current.value = '';
    if (albumRef.current) albumRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col md:max-w-md md:mx-auto md:shadow-2xl overflow-hidden">
      
      {/* 📱 인스타그램 스타일 헤더 */}
      <div className="flex justify-between items-center px-4 h-14 border-b border-slate-200 bg-white shrink-0">
        <button onClick={() => { resetForm(); onClose(); }} className="text-slate-900 text-2xl font-light">
          ✕
        </button>
        <h2 className="text-base font-bold text-slate-900">새 포트폴리오</h2>
        <button 
          onClick={handleSubmit} 
          disabled={isUploading}
          className={`text-base font-bold transition-colors ${isUploading ? 'text-slate-400' : 'text-blue-500 hover:text-blue-600'}`}
        >
          {isUploading ? '업로드 중...' : '공유'}
        </button>
      </div>

      {/* 📝 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
        
        {/* 미디어 표시 또는 버튼 영역 */}
        <div className="w-full aspect-square bg-slate-100 relative overflow-hidden flex flex-col items-center justify-center">
          
          {previewSrc ? (
            /* 미리보기 화면 */
            <div className="relative w-full h-full">
              {fileType === 'video' ? (
                <video src={previewSrc} controls className="w-full h-full object-contain bg-black" playsInline />
              ) : (
                <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
              )}
              <button 
                onClick={resetForm}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white rounded-full w-9 h-9 flex items-center justify-center text-sm shadow-lg hover:bg-black/80 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            /* 3분할 선택 버튼 화면 */
            <div className="flex flex-col gap-4 w-full px-8">
              <button 
                onClick={() => cameraRef.current.click()}
                className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
              >
                <span className="text-3xl">📸</span>
                <span className="font-bold text-slate-700 text-lg">사진 바로 찍기</span>
              </button>

              <button 
                onClick={() => videoRef.current.click()}
                className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
              >
                <span className="text-3xl">🎥</span>
                <span className="font-bold text-slate-700 text-lg">영상 바로 찍기</span>
              </button>

              <button 
                onClick={() => albumRef.current.click()}
                className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
              >
                <span className="text-3xl">🖼️</span>
                <span className="font-bold text-slate-700 text-lg">기기 앨범 열기</span>
              </button>
            </div>
          )}

          {/* 💡 핵심: 3개의 분리된 숨김 input 속성 */}
          <input 
            type="file" 
            ref={cameraRef}
            accept="image/*" 
            capture="environment" // 사진용 카메라 강제
            className="hidden" 
            onChange={handleFileChange}
          />
          <input 
            type="file" 
            ref={videoRef}
            accept="video/*" 
            capture="environment" // 비디오용 카메라 강제
            className="hidden" 
            onChange={handleFileChange}
          />
          <input 
            type="file" 
            ref={albumRef}
            accept="image/*,video/*" // 캡처 속성 없음 (앨범 팝업 유도)
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>

        {/* 텍스트 입력 영역 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="현장의 생생한 소식이나 설명을 작성해 주세요..."
          className="w-full flex-1 p-5 text-base resize-none outline-none bg-white text-slate-700 placeholder-slate-400"
        />
      </div>
    </div>
  );
};

export default MobileUploadModal;