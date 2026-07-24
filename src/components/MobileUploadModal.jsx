// daon-frontend/src/components/MobileUploadModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Bold,
  Italic,
  Strikethrough,
  Heading,
  Essentials,
  Paragraph,
  List,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  Undo,
  SourceEditing,
  GeneralHtmlSupport,
  Image,
  ImageBlock,
  ImageInline
} from 'ckeditor5';
import api from '../api/axios';
import { API_URL } from '../config';

const MobileUploadModal = ({ isOpen, onClose, onUpload, editingPost }) => {
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); 
  
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
  const editorInstanceRef = useRef(null);

  // ✨ [신규] 본문에 처음 삽입된 이미지의 절대 URL을 명확히 기억 (썸네일 결정용)
  const firstImageUrlRef = useRef(null);

  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const albumRef = useRef(null);
  const generalFileRef = useRef(null);

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setContent('');
    setUploadedFiles([]);
    setClientName('');
    const currentDate = new Date();
    setWorkYear(String(currentDate.getFullYear()));
    setWorkMonth(String(currentDate.getMonth() + 1));
    setWorkAddress('');
    setWorkLat(null);
    setWorkLng(null);
    setKeywords([]);
    setKeywordInput('');
    setAdditionalFiles([]);
    firstImageUrlRef.current = null; // ✨ 초기화
    if (cameraRef.current) cameraRef.current.value = '';
    if (videoRef.current) videoRef.current.value = '';
    if (albumRef.current) albumRef.current.value = '';
    if (generalFileRef.current) generalFileRef.current.value = '';
  };

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setContent(editingPost.content || '');
      setClientName(editingPost.clientName || '');
      setWorkYear(editingPost.workYear ? String(editingPost.workYear) : String(now.getFullYear()));
      setWorkMonth(editingPost.workMonth ? String(editingPost.workMonth) : String(now.getMonth() + 1));
      setWorkAddress(editingPost.workAddress || '');
      setWorkLat(editingPost.workLat ?? null);
      setWorkLng(editingPost.workLng ?? null);
      
      if (editingPost.keywords && Array.isArray(editingPost.keywords)) {
        setKeywords(editingPost.keywords.map(k => k.keyword?.name || k.name).filter(Boolean));
      } else {
        setKeywords([]);
      }
      setUploadedFiles([]);
      // ✨ 수정 모드일 땐 기존 썸네일이 이미 서버에 있으므로 새로 강제하지 않음
      firstImageUrlRef.current = null;
    } else {
      resetForm();
    }
  }, [editingPost, isOpen]);

  if (!isOpen) return null;

  // 🚀 이미지 업로드 시 절대 URL을 그대로 유지하여 에디터에 삽입 (도메인 다른 환경에서도 정상 표시)
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    setIsUploading(true);

    try {
      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        let fileToUpload = file;

        if (!isVideo) {
          try {
            fileToUpload = await imageCompression(file, options);
          } catch (err) {
            console.error('이미지 압축 실패:', err);
          }
        }

        setUploadedFiles(prev => {
          const combined = [...prev, fileToUpload];
          return combined.sort((a, b) => {
            const isAImg = a.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(a.name || '');
            const isBImg = b.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(b.name || '');
            if (isAImg && !isBImg) return -1;
            if (!isAImg && isBImg) return 1;
            return 0;
          });
        });

        const tempFormData = new FormData();
        tempFormData.append('files', fileToUpload, fileToUpload.name || 'mobile-media.jpg');

        let imageUrl = '';
        try {
          const response = await api.post('/posts/upload', tempFormData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const rawUrl = response.data?.url || (Array.isArray(response.data) ? response.data[0]?.url : response.data);
          // ✨ 절대 URL 그대로 사용 (도메인이 다른 운영 환경에서도 정상 표시되도록)
          if (rawUrl) {
            imageUrl = rawUrl;
          }
        } catch (uploadErr) {
          console.warn('서버 업로드 실패, 로컬 미리보기로 대체합니다.', uploadErr);
          imageUrl = URL.createObjectURL(fileToUpload);
        }

        // ✨ [신규] 이미지 타입이고, 서버 업로드에 성공한(blob이 아닌) 첫 번째 이미지를 썸네일 후보로 기억
        if (!isVideo && imageUrl && !imageUrl.startsWith('blob:') && !firstImageUrlRef.current) {
          firstImageUrlRef.current = imageUrl;
        }

        if (editorInstanceRef.current && imageUrl) {
          const editor = editorInstanceRef.current;
          editor.model.change(writer => {
            const imageElement = writer.createElement('imageBlock', { src: imageUrl });
            const selection = editor.model.document.selection;
            const insertPosition = selection.focus || editor.model.createPositionAt(editor.model.document.getRoot(), 'end');
            
            editor.model.insertContent(imageElement, insertPosition);

            const paragraph = writer.createElement('paragraph');
            writer.insert(paragraph, writer.createPositionAfter(imageElement));
            writer.setSelection(paragraph, 'in');
          });
        }
      }
    } catch (error) {
      console.error('미디어 처리 실패:', error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
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
    if (!title.trim() && !content.trim()) {
      alert('글 제목이나 본문 내용을 입력해 주세요.');
      return;
    }

    const finalKeywords = keywordInput.trim()
      ? [...keywords, keywordInput.trim().replace(/^#/, '')]
      : keywords;

    setIsUploading(true);
    await onUpload({
      files: uploadedFiles,
      title,
      content,
      clientName,
      workYear,
      workMonth,
      workAddress,
      workLat,
      workLng,
      keywords: finalKeywords,
      additionalFiles,
      thumbnailUrl: firstImageUrlRef.current, // ✨ [신규] 첫 이미지 URL을 명시적으로 전달
    });
    
    setIsUploading(false);
    resetForm();
    onClose();
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
          <h2 className="text-base font-bold text-slate-900">
            {editingPost ? '포트폴리오 수정' : '새 포트폴리오 등록'}
          </h2>
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
              {isUploading ? '처리 중...' : (editingPost ? '수정 완료' : '공유')}
            </button>
          )}
        </div>

        {/* 단계 진행 표시 */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${step === 1 ? 'text-blue-500' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step === 1 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
            제목 · 현장 정보
          </div>
          <div className="flex-1 h-[2px] bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full bg-blue-400 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${step === 2 ? 'text-blue-500' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step === 2 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            미디어 · 본문
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-4 space-y-4 custom-scrollbar text-left flex flex-col">

        {step === 1 && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 animate-fadeIn flex-1">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">포트폴리오 정보 입력</h3>
                <p className="text-[11px] text-slate-400">제목과 현장 정보를 입력해 주세요.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">글 제목 *</label>
                <input
                  type="text"
                  placeholder="제목을 입력해 주세요..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-200/50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 transition font-bold text-slate-800"
                />
              </div>
              
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

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer shrink-0 mt-2"
            >
              다음 단계 →
            </button>
          </>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fadeIn flex-1 flex flex-col justify-between">
            <div className="space-y-3 flex-1 flex flex-col">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer shrink-0"
              >
                ← 이전 단계 (정보 수정) 다시 보기
              </button>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-1.5 flex-1 flex flex-col min-h-[280px]">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">포트폴리오 본문 내용 *</label>
                
                <style>{`
                  .mobile-ckeditor .ck-editor { display: flex; flex-direction: column; height: 100%; flex: 1; }
                  .mobile-ckeditor .ck-editor__main { flex: 1; overflow-y: auto; }
                  .mobile-ckeditor .ck-content { min-height: 200px !important; }
                `}</style>

                <div className="flex-1 flex flex-col overflow-hidden border border-slate-200/50 rounded-xl bg-slate-50/40 mobile-ckeditor">
                  <CKEditor
                    editor={ ClassicEditor }
                    onReady={ ( editor ) => {
                      editorInstanceRef.current = editor;
                    } }
                    config={ {
                      licenseKey: 'GPL',
                      plugins: [ Essentials, Paragraph, Bold, Italic, Strikethrough, Heading, List, Undo, Table, TableToolbar, TableProperties, TableCellProperties, SourceEditing, GeneralHtmlSupport, Image, ImageBlock, ImageInline ], 
                      toolbar: [ 'undo', 'redo', '|', 'sourceEditing', '|', 'heading', '|', 'bold', 'italic', 'strikethrough', '|', 'bulletedList', 'numberedList', '|', 'insertTable' ],
                      table: { contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', '|', 'tableProperties', 'tableCellProperties' ] },
                      htmlSupport: { allow: [{ name: /.*/, attributes: true, classes: true, styles: true }] }
                    } }
                    data={ content } 
                    onChange={ ( event, editor ) => setContent(editor.getData()) }
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-lg space-y-2 shrink-0 sticky bottom-0 z-20">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-700">미디어 바로 삽입</span>
                <span className="text-[10px] text-blue-500 font-medium">촬영 시 아래에 바로 추가됩니다 ✨</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => cameraRef.current.click()}
                  className="flex-1 bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <span className="text-base">📸</span> 사진 촬영
                </button>
                <button 
                  type="button"
                  onClick={() => videoRef.current.click()}
                  className="flex-1 bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <span className="text-base">🎥</span> 영상 촬영
                </button>
                <button 
                  type="button"
                  onClick={() => albumRef.current.click()}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border border-slate-200"
                >
                  <span className="text-base">🖼️</span> 앨범 선택
                </button>
              </div>

              <input type="file" ref={cameraRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              <input type="file" ref={videoRef} accept="video/*" capture="environment" className="hidden" onChange={handleFileChange} />
              <input type="file" ref={albumRef} accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MobileUploadModal;