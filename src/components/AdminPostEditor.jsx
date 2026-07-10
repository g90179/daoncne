// daon-frontend/src/components/AdminPostEditor.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // 🔑 표준 api 인스턴스 사용
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
      // 🔑 api 인스턴스를 사용하여 토큰 자동 주입 및 요청 발송
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
            placeholder: '내용을 입력하세요.'
          } }
          data={ editingPost ? editingPost.content : '' }
          onChange={ ( event, editor ) => {
            const data = editor.getData();
            setContent( data );
          } }
        />
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