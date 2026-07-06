// daon-frontend/src/pages/admin/MainSlideAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const MainSlideAdmin = () => {
  const [slides, setSlides] = useState([]);
  const [isWriteMode, setIsWriteMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', videoUrl: '', isExposed: true, duration: 5
  });

  const fetchSlides = async () => {
    try {
      const res = await axios.get(`${API_URL}/main-slides`);
      setSlides(res.data);
    } catch (err) { console.error('슬라이드 로드 실패', err); }
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/main-slides/${editingId}`, formData);
        alert('슬라이드가 수정되었습니다.');
      } else {
        await axios.post(`${API_URL}/main-slides`, formData);
        alert('새 슬라이드가 등록되었습니다.');
      }
      resetForm();
      fetchSlides();
    } catch (err) { alert('저장에 실패했습니다.'); }
  };

  const handleEdit = (slide) => {
    setEditingId(slide.id);
    setFormData({
      title: slide.title,
      description: slide.description || '',
      videoUrl: slide.videoUrl,
      isExposed: slide.isExposed,
      duration: slide.duration
    });
    setIsWriteMode(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_URL}/main-slides/${id}`);
      fetchSlides();
    } catch (err) { alert('삭제 실패'); }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', videoUrl: '', isExposed: true, duration: 5 });
    setEditingId(null);
    setIsWriteMode(false);
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 pt-24 pb-20 px-6 md:px-12 text-neutral-900">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-light tracking-tight">메인 슬라이드 관리</h1>
            <p className="text-xs text-neutral-400 mt-1">홈페이지 최상단 영상 배너 리스트와 롤링 시간을 제어합니다.</p>
          </div>
          {!isWriteMode && (
            <button onClick={() => setIsWriteMode(true)} className="text-xs font-bold text-white bg-neutral-950 px-4 py-2.5 rounded-xl shadow-sm hover:bg-neutral-800 transition-all">
              + 새 슬라이드 등록
            </button>
          )}
        </div>

        {isWriteMode ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200/60 p-6 md:p-8 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold text-neutral-500 border-b pb-2">{editingId ? '슬라이드 수정하기' : '신규 슬라이드 작성'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-400 mb-2">배너 제목 *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="대온씨엔이가 설계하고 완수한 프로젝트" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-400 mb-2">간단 설명</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="정밀 공학적 시뮬레이션과 안전 표준을 준수합니다." className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-400 mb-2">영상 URL / 경로 *</label>
                <input type="text" name="videoUrl" required value={formData.videoUrl} onChange={handleInputChange} placeholder="/videos/main_banner_01.mp4 또는 스트리밍 링크" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 font-mono text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">슬라이드 노출 시간 (초 단위) *</label>
                <input type="number" name="duration" min="1" required value={formData.duration} onChange={handleInputChange} className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 font-bold" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="isExposed" name="isExposed" checked={formData.isExposed} onChange={handleInputChange} className="w-4 h-4 accent-neutral-950 cursor-pointer" />
                <label htmlFor="isExposed" className="text-xs font-medium text-neutral-700 cursor-pointer select-none">메인 화면 배너 자리에 즉시 노출</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
              <button type="button" onClick={resetForm} className="text-xs text-neutral-500 border bg-white px-4 py-2.5 rounded-xl">취소</button>
              <button type="submit" className="text-xs font-bold text-white bg-neutral-950 px-5 py-2.5 rounded-xl shadow-sm">{editingId ? '수정 완료하기' : '저장 완료하기'}</button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-400 font-medium text-xs border-b border-neutral-200">
                  <th className="py-4 px-4 w-16 text-center">번호</th>
                  <th className="py-4 px-4">배너 제목</th>
                  <th className="py-4 px-4 w-24 text-center">노출 시간</th>
                  <th className="py-4 px-4 w-24 text-center">노출 여부</th>
                  <th className="py-4 px-4 w-32 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {slides.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-neutral-400 text-xs">등록된 슬라이드 내역이 없습니다.</td></tr>
                ) : (
                  slides.map((slide, idx) => (
                    <tr key={slide.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-4 px-4 text-center text-neutral-400 text-xs">{slides.length - idx}</td>
                      <td className="py-4 px-4 font-medium text-neutral-900">
                        <div className="truncate max-w-[300px]">{slide.title}</div>
                        <div className="text-[11px] text-neutral-400 truncate max-w-[300px] font-mono">{slide.videoUrl}</div>
                      </td>
                      <td className="py-4 px-4 text-center text-xs font-bold">{slide.duration}초</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${slide.isExposed ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                          {slide.isExposed ? '노출중' : '숨김'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center space-x-1 whitespace-nowrap">
                        <button onClick={() => handleEdit(slide)} className="text-[11px] border border-neutral-200 bg-white px-2.5 py-1 rounded-lg hover:bg-neutral-50">수정</button>
                        <button onClick={() => handleDelete(slide.id)} className="text-[11px] border border-red-100 bg-red-50/30 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-50">삭제</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainSlideAdmin;