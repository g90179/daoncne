// daon-frontend/src/components/AdminPostEditor.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setCategory(editingPost.category);
      setContent(editingPost.content);
      setSelectedFiles([]);
      setExistingFiles(editingPost.files?.filter(f => f.name !== 'editor_thumbnail') || []);
      setDeletedFileIds([]);
    } else {
      setTitle(''); setContent(''); setSelectedFiles([]); setExistingFiles([]); setDeletedFileIds([]);
    }
  }, [editingPost]);

  const handleFileChange = (e) => { setSelectedFiles(Array.from(e.target.files)); };

  const handleRemoveExistingFile = (fileId) => {
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
    setDeletedFileIds(prev => [...prev, fileId]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { alert('제목을 입력해주세요.'); return; }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('deletedFileIds', JSON.stringify(deletedFileIds));
    selectedFiles.forEach(f => formData.append('files', f));

    try {
      if (editingPost) await axios.patch(`${API_URL}/posts/${editingPost.id}`, formData);
      else await axios.post(`${API_URL}/posts`, formData);
      alert('저장 완료');
      onSuccess();
    } catch (err) { alert('실패'); }
  };

  return (
    // 🔑 기존의 탁하고 무거웠던 대형 카드를 흐르는 듯한 투명 폼 쉘 구조로 변환
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* 🎛️ 최상단 컨트롤 바 구역 */}
      <div className="border-b border-slate-100 pb-4 flex justify-between items-center gap-4">
        {/* 미니멀 캡슐형 카테고리 셀렉터 */}
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

        {/* 제어 버튼 바 */}
        <div className="flex gap-2">
          {editingPost && (
            <button 
              onClick={onCancel} 
              className="text-slate-400 hover:text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition active:scale-95 cursor-pointer"
            >
              취소
            </button>
          )}
          {/* 🔑 활성화 메인 컬러 테마인 bg-blue-400 및 네온 소프트 섀도우 탑재 */}
          <button 
            onClick={handleSubmit} 
            className="bg-blue-400 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-400/20 transition-all active:scale-95 cursor-pointer"
          >
            {editingPost ? 'Update Post' : 'Publish'}
          </button>
        </div>
      </div>
      
      {/* ✍️ 타이틀 인풋 존: 지정해주신 oklch 고급 네이비 색상을 글자색으로 적용 */}
      <div className="px-1">
        <input 
          className="w-full text-3xl font-bold pb-2 text-[oklch(0.38_0.07_259.56)] placeholder-slate-300 outline-none border-b border-slate-50 focus:border-blue-400/30 transition-all" 
          placeholder="Untitled" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
      </div>

      {/* 📝 CKEditor 5 본문 영역: 외곽을 둥글게 스무딩 처리하여 일체감 형성 */}
      <div className="min-h-[480px] rounded-2xl overflow-hidden border border-slate-200/50 bg-slate-50/40 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-400/5 transition-all duration-300 ckeditor-custom-wrapper">
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
            placeholder: '내용을 입력하세요. 표 삽입, 이미지 및 유튜브 동영상 연동을 지원합니다.'
          } }
          data={ editingPost ? editingPost.content : '' }
          onChange={ ( event, editor ) => {
            const data = editor.getData();
            setContent( data );
          } }
        />
      </div>

      {/* 📎 파일 스토리지 / 업로더 조작부 */}
      <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-100/70 space-y-4">
        
        {/* 현재 유지 중인 서버 파일 리스트 */}
        {editingPost && existingFiles.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">📁 현재 게시글에 유지 중인 파일</label>
            <div className="flex flex-wrap gap-2">
              {existingFiles.map(file => (
                // 🔑 세련된 파스텔톤 블루 배지 칩으로 전면 재정돈
                <div key={file.id} className="flex items-center gap-2 text-xs font-bold bg-blue-50/80 border border-blue-100 text-blue-600 px-3 py-1.5 rounded-xl shadow-sm">
                  <span className="font-medium">{file.type === 'video' || file.url?.toLowerCase().endsWith('.mp4') ? '🎬' : '📎'} {file.name}</span>
                  <button type="button" onClick={() => handleRemoveExistingFile(file.id)} className="text-blue-400 hover:text-rose-500 font-black ml-1 bg-white/80 hover:bg-rose-50 w-4 h-4 rounded-full flex items-center justify-center shadow-sm transition cursor-pointer">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 신규 파일 업로드 라인 */}
        <div className="space-y-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">➕ 신규 동영상 및 일반 파일 추가</label>
            <p className="text-[10px] text-slate-400 font-medium">새로 추가할 파일이 있을 때만 버튼을 이용하세요.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 🔑 인풋 파일 버튼 인터페이스를 모던한 미니멀 다크 스킨 스타일로 이펙트 튜닝 */}
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              className="block w-full text-xs text-slate-400 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white file:hover:bg-blue-400 file:transition-all file:cursor-pointer" 
            />
          </div>

          {/* 대기 순번 리스트 칩 */}
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