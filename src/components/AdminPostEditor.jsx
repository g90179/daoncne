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
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 border-b px-10 py-4 flex justify-between items-center">
        <select className="bg-transparent font-bold outline-none text-slate-600" value={category} onChange={e => setCategory(e.target.value)}>
          <option>현장사진</option><option>공사실적</option><option>보유장비</option>
        </select>
        <div className="flex gap-3">
          {editingPost && <button onClick={onCancel} className="text-gray-400 font-bold px-4">취소</button>}
          <button onClick={handleSubmit} className="bg-slate-900 text-white px-8 py-2 rounded-xl font-bold hover:bg-orange-500 transition">Publish</button>
        </div>
      </div>
      
      <input className="w-full text-5xl font-black px-10 pt-10 outline-none" placeholder="Untitled" value={title} onChange={e => setTitle(e.target.value)} />

      <div className="p-10 min-h-[500px] prose prose-slate max-w-none border-b">
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
            
            // 💡 변경 전: data={ content }
            // ⬇️ 변경 후: 수정 모드일 때는 기존 글 내용을 고정으로 넣고, 새 글일 때는 빈 값을 줍니다.
            data={ editingPost ? editingPost.content : '' }
            
            onChange={ ( event, editor ) => {
            const data = editor.getData();
            setContent( data ); // 💡 타이핑된 내용은 여전히 content 상태에 안전하게 담깁니다.
            } }
        />
      </div>

      <div className="p-8 bg-slate-50/50 border-t flex flex-col gap-4">
        {editingPost && existingFiles.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            <label className="text-xs font-black text-slate-500">📁 현재 게시글에 유지 중인 파일 (삭제하려면 ✕ 클릭)</label>
            <div className="flex flex-wrap gap-2">
              {existingFiles.map(file => (
                <div key={file.id} className="flex items-center gap-2 text-xs font-bold bg-orange-50 border border-orange-200 text-slate-700 px-3 py-1.5 rounded-xl shadow-sm">
                  <span>{file.type === 'video' || file.url?.toLowerCase().endsWith('.mp4') ? '🎬' : '📎'} {file.name}</span>
                  <button type="button" onClick={() => handleRemoveExistingFile(file.id)} className="text-red-500 font-black hover:text-red-700 ml-1 bg-red-100/60 w-4 h-4 rounded-full flex items-center justify-center transition">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-black text-slate-700 flex items-center gap-2">🎬 신규 동영상 및 일반 파일 추가</label>
          <p className="text-xs text-slate-400 font-medium">새로 추가할 파일이 있을 때만 아래 버튼을 이용하세요.</p>
        </div>
        <div className="flex items-center gap-4">
          <input type="file" multiple onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-900 file:text-white file:hover:bg-orange-500 file:transition-all file:cursor-pointer" />
        </div>
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedFiles.map((file, idx) => (
              <span key={idx} className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl shadow-sm">
                📎 신규 추가: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPostEditor;