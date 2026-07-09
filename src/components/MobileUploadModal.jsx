// daon-frontend/src/components/MobileUploadModal.jsx
import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';

const MobileUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [previewSrc, setPreviewSrc] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // 📸 이미지 선택 및 초고속 압축 로직
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 선택 즉시 미리보기 생성 (사용자 경험 향상)
    const previewUrl = URL.createObjectURL(file);
    setPreviewSrc(previewUrl);

    // 이미지 압축 옵션 설정 (최대 1MB, 가로세로 최대 1920px)
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressed = await imageCompression(file, options);
      setCompressedFile(compressed);
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
    }
  };

  // 🚀 업로드 실행 함수
  const handleSubmit = async () => {
    if (!compressedFile && !content) {
      alert('사진이나 내용을 입력해 주세요.');
      return;
    }

    setIsUploading(true);
    
    // 부모 컴포넌트(대시보드)로 압축된 파일과 텍스트를 전달합니다.
    await onUpload({ file: compressedFile, content });
    
    // 초기화 및 닫기
    setIsUploading(false);
    setPreviewSrc(null);
    setCompressedFile(null);
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col md:max-w-md md:mx-auto md:shadow-2xl overflow-hidden">
      
      {/* 📱 인스타그램 스타일 헤더 */}
      <div className="flex justify-between items-center px-4 h-14 border-b border-gray-200 bg-white shrink-0">
        <button onClick={onClose} className="text-gray-900 text-lg">
          ✕
        </button>
        <h2 className="text-base font-bold text-gray-900">새 포트폴리오</h2>
        <button 
          onClick={handleSubmit} 
          disabled={isUploading}
          className={`text-base font-bold ${isUploading ? 'text-gray-400' : 'text-blue-500'}`}
        >
          {isUploading ? '업로드 중...' : '공유'}
        </button>
      </div>

      {/* 📝 콘텐츠 작성 영역 */}
      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        
        {/* 사진 영역 (정사각형 비율 유지) */}
        <div 
          className="w-full aspect-square bg-gray-200 flex flex-col justify-center items-center cursor-pointer relative overflow-hidden"
          onClick={() => !previewSrc && fileInputRef.current.click()}
        >
          {previewSrc ? (
            <>
              <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewSrc(null);
                  setCompressedFile(null);
                  fileInputRef.current.value = '';
                }}
                className="absolute top-4 right-4 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📸</div>
              <span className="font-medium">탭하여 사진 찍기 또는 선택</span>
            </div>
          )}
          
          {/* 💡 핵심: capture="environment" 속성으로 스마트폰 후면 카메라 우선 호출 지원 */}
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*,video/*" 
            capture="environment"
            className="hidden" 
            onChange={handleImageChange}
          />
        </div>

        {/* 텍스트 입력 영역 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="현장의 생생한 소식이나 설명을 작성해 주세요..."
          className="w-full flex-1 p-4 text-base resize-none outline-none bg-white text-gray-900"
        />
      </div>
    </div>
  );
};

export default MobileUploadModal;