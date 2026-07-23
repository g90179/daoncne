// daon-frontend/src/components/AdminPostEditor.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
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
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageUpload,
  SimpleUploadAdapter,
  MediaEmbed,
  MediaEmbedToolbar
} from 'ckeditor5';
import { API_URL } from '../config';

const AdminPostEditor = ({ editingPost, onCancel, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('현장사진');
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [workYear, setWorkYear] = useState('');
  const [workMonth, setWorkMonth] = useState('');

  // 의뢰업체명 / 작업지 주소 / 키워드
  const [clientName, setClientName] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [workLat, setWorkLat] = useState(null);
  const [workLng, setWorkLng] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');

  // ✨ [신규] 에디터 전체화면 상태 관리
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ✨ [신규] 전체화면일 때 배경 스크롤 방지
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isFullscreen]);

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setCategory(editingPost.category);
      setContent(editingPost.content);
      setSelectedFiles([]);
      setExistingFiles(editingPost.files?.filter(f => f.name !== 'editor_thumbnail') || []);
      setDeletedFileIds([]);

      setClientName(editingPost.clientName || '');
      setWorkAddress(editingPost.workAddress || '');
      setWorkLat(editingPost.workLat ?? null);
      setWorkLng(editingPost.workLng ?? null);
      setKeywords(editingPost.keywords?.map(pk => pk.keyword?.name).filter(Boolean) || []);
      setWorkYear(editingPost.workYear != null ? String(editingPost.workYear) : '');
      setWorkMonth(editingPost.workMonth != null ? String(editingPost.workMonth) : '');
      setKeywordInput('');
    } else {
      setTitle(''); setContent(''); setSelectedFiles([]); setExistingFiles([]); setDeletedFileIds([]);
      setClientName(''); setWorkAddress(''); setWorkLat(null); setWorkLng(null);
      setKeywords([]); setKeywordInput('');
      setWorkYear(''); setWorkMonth('');
    }
  }, [editingPost]);

  const handleFileChange = (e) => { setSelectedFiles(Array.from(e.target.files)); };

  const handleRemoveExistingFile = (fileId) => {
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
    setDeletedFileIds(prev => [...prev, fileId]);
  };

  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 스크립트를 아직 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
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
              console.warn('주소 좌표 변환 실패:', fullAddress);
            }
          });
        }
      }
    }).open();
  };

  const handleClearAddress = () => {
    setWorkAddress('');
    setWorkLat(null);
    setWorkLng(null);
  };

  const handleKeywordInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeywordFromInput();
    } else if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      setKeywords(prev => prev.slice(0, -1));
    }
  };

  const addKeywordFromInput = () => {
    const trimmed = keywordInput.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!keywords.includes(trimmed)) {
      setKeywords(prev => [...prev, trimmed]);
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (name) => {
    setKeywords(prev => prev.filter(k => k !== name));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { alert('제목을 입력해주세요.'); return; }

    const finalKeywords = keywordInput.trim()
      ? [...keywords, keywordInput.trim().replace(/^#/, '')]
      : keywords;
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('deletedFileIds', JSON.stringify(deletedFileIds));

    formData.append('clientName', clientName);
    formData.append('workAddress', workAddress);
    if (workLat != null) formData.append('workLat', String(workLat));
    if (workLng != null) formData.append('workLng', String(workLng));
    formData.append('keywords', JSON.stringify(finalKeywords));

    if (workYear) formData.append('workYear', workYear);
    if (workMonth) formData.append('workMonth', workMonth);

    selectedFiles.forEach(f => formData.append('files', f));

    try {
      if (editingPost) {
        await api.patch(`/posts/${editingPost.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      alert('저장 완료');
      onSuccess();
    } catch (err) { 
      console.error(err);
      alert('저장 실패: ' + (err.response?.data?.message || '권한이나 네트워크를 확인하세요.')); 
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* 상단 툴바 (카테고리, 취소, 저장 버튼) */}
      <div className="border-b border-slate-100 pb-4 flex justify-between items-center gap-4">
        <div className="bg-slate-100/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/40 shadow-inner flex items-center">
          <select 
            className="bg-transparent font-bold text-xs outline-none text-[oklch(0.38_0.07_259.56)] cursor-pointer" 
            value={category} 
            onChange={e => setCategory(e.target.value)}
          >
            <option>현장사진</option>
            <option>공사실적</option>
            <option>보유장비</option>
          </select>
        </div>

        <div className="flex gap-2">
          {editingPost && (
            <button 
              onClick={onCancel} 
              className="text-slate-400 hover:text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition active:scale-95 cursor-pointer"
            >
              취소
            </button>
          )}
          <button 
            onClick={handleSubmit} 
            className="bg-blue-400 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-400/20 transition-all active:scale-95 cursor-pointer"
          >
            {editingPost ? 'Update Post' : 'Publish'}
          </button>
        </div>
      </div>
      
      <div className="px-1">
        <input 
          className="w-full text-3xl font-bold pb-2 text-[oklch(0.38_0.07_259.56)] placeholder-slate-300 outline-none border-b border-slate-50 focus:border-blue-400/30 transition-all" 
          placeholder="Untitled" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">의뢰업체명 <span className="normal-case font-medium text-slate-300">(선택)</span></label>
          <input
            className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 transition"
            placeholder="예: 다온씨엔이"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">작업년도/월 <span className="normal-case font-medium text-slate-300">(선택)</span></label>
          <div className="flex items-center gap-2">
            <select
              className="flex-1 bg-slate-50/60 border border-slate-200/50 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 transition cursor-pointer"
              value={workYear}
              onChange={e => setWorkYear(e.target.value)}
            >
              <option value="">년도</option>
              {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
            <select
              className="flex-1 bg-slate-50/60 border border-slate-200/50 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 transition cursor-pointer"
              value={workMonth}
              onChange={e => setWorkMonth(e.target.value)}
            >
              <option value="">월</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">작업지 주소 <span className="normal-case font-medium text-slate-300">(선택)</span></label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 transition"
              placeholder="주소 검색 버튼을 눌러주세요"
              value={workAddress}
              readOnly
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              className="shrink-0 bg-slate-900 hover:bg-blue-500 text-white text-xs font-bold px-4 py-3 rounded-2xl transition cursor-pointer"
            >
              주소 검색
            </button>
            {workAddress && (
              <button
                type="button"
                onClick={handleClearAddress}
                className="shrink-0 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-400 text-xs font-bold px-3 py-3 rounded-2xl transition cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          {workLat != null && workLng != null && (
            <p className="text-[10px] text-blue-400 font-mono pl-1">📍 {workLat.toFixed(6)}, {workLng.toFixed(6)}</p>
          )}
        </div>
      </div>

      <div className="px-1 space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">작업 키워드 <span className="normal-case font-medium text-slate-300">(선택 · 복수 등록 가능)</span></label>
        <div className="flex flex-wrap items-center gap-2 bg-slate-50/60 border border-slate-200/50 rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-blue-400 transition">
          {keywords.map((kw) => (
            <span key={kw} className="flex items-center gap-1.5 bg-blue-50 text-blue-500 text-xs font-bold pl-3 pr-2 py-1.5 rounded-full border border-blue-100">
              #{kw}
              <button
                type="button"
                onClick={() => handleRemoveKeyword(kw)}
                className="w-4 h-4 rounded-full bg-white/70 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-[10px] font-black transition cursor-pointer"
              >
                ✕
              </button>
            </span>
          ))}
          <input
            className="flex-1 min-w-[120px] bg-transparent text-sm outline-none py-1"
            placeholder={keywords.length === 0 ? '키워드 입력 후 Enter (예: 크레인이동)' : '키워드 추가...'}
            value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordInputKeyDown}
            onBlur={addKeywordFromInput}
          />
        </div>
      </div>

      {/* ✨ [신규] 에디터 및 전체화면 버튼 래퍼 */}
      <div className="px-1">
        <div className="flex justify-between items-end pb-2">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">본문 편집</label>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="text-[11px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition cursor-pointer bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100"
          >
            ⛶ 화면 꽉 차게 쓰기
          </button>
        </div>

        {/* 🚀 전체화면 상태일 때 CKEditor 높이를 꽉 채워주는 전용 CSS 주입 */}
        {isFullscreen && (
          <style>{`
            .fullscreen-ckeditor .ck-editor { display: flex; flex-direction: column; height: 100%; }
            .fullscreen-ckeditor .ck-editor__main { flex: 1; overflow-y: auto; }
            .fullscreen-ckeditor .ck-content { min-height: 100% !important; border: none !important; box-shadow: none !important; }
          `}</style>
        )}

        {/* 🚀 isFullscreen 상태에 따라 모달 창으로 변환되는 마법의 컨테이너 */}
        <div className={
          isFullscreen
            ? "fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10 transition-all duration-300 animate-fadeIn"
            : "transition-all duration-300"
        }>
          <div className={
            isFullscreen
              ? "bg-white w-full h-full max-w-[1400px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
              : "min-h-[480px] rounded-2xl overflow-hidden border border-slate-200/50 bg-slate-50/40 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-400/5 transition-all duration-300 ckeditor-custom-wrapper"
          }>
            
            {/* 전체화면일 때만 보이는 상단 닫기 헤더 */}
            {isFullscreen && (
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className="font-bold text-slate-700 text-sm">본문 상세 편집 (전체화면 모드)</div>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-500 hover:shadow-lg transition cursor-pointer"
                >
                  ✕ 원래 크기로 축소
                </button>
              </div>
            )}

            <div className={`flex-1 flex flex-col overflow-hidden ${isFullscreen ? 'fullscreen-ckeditor' : ''}`}>
              <CKEditor
                editor={ ClassicEditor }
                config={ {
                  licenseKey: 'GPL',
                  plugins: [ 
                    Essentials, Paragraph, Bold, Italic, Strikethrough, Heading, List, Undo,
                    Table, TableToolbar, TableProperties, TableCellProperties,
                    Image, ImageToolbar, ImageCaption, ImageStyle, ImageUpload, SimpleUploadAdapter,
                    MediaEmbed, MediaEmbedToolbar
                  ],
                  toolbar: [
                    'undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'strikethrough', '|', 
                    'bulletedList', 'numberedList', '|', 'insertTable', 'uploadImage', 'mediaEmbed'
                  ],
                  table: { contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', '|', 'tableProperties', 'tableCellProperties' ] },
                  simpleUpload: {
                    uploadUrl: `${API_URL}/posts/upload`,
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  },
                  placeholder: '내용을 입력하세요.'
                } }
                data={ editingPost ? editingPost.content : '' }
                onChange={ ( event, editor ) => {
                  const data = editor.getData();
                  setContent( data );
                } }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-100/70 space-y-4">
        {editingPost && existingFiles.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">📁 현재 게시글에 유지 중인 파일</label>
            <div className="flex flex-wrap gap-2">
              {existingFiles.map(file => (
                <div key={file.id} className="flex items-center gap-2 text-xs font-bold bg-blue-50/80 border border-blue-100 text-blue-600 px-3 py-1.5 rounded-xl shadow-sm">
                  <span className="font-medium">{file.type === 'video' || file.url?.toLowerCase().endsWith('.mp4') ? '🎬' : '📎'} {file.name}</span>
                  <button type="button" onClick={() => handleRemoveExistingFile(file.id)} className="text-blue-400 hover:text-rose-500 font-black ml-1 bg-white/80 hover:bg-rose-50 w-4 h-4 rounded-full flex items-center justify-center shadow-sm transition cursor-pointer">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">➕ 신규 동영상 및 일반 파일 추가</label>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              className="block w-full text-xs text-slate-400 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white file:hover:bg-blue-400 file:transition-all file:cursor-pointer" 
            />
          </div>
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedFiles.map((file, idx) => (
                <span key={idx} className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl shadow-sm animate-fadeIn">
                  📎 대기중: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPostEditor;