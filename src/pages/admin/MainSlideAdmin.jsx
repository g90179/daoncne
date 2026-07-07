// daon-frontend/src/pages/admin/MainSlideAdmin.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const MainSlideAdmin = () => {
  const [slides, setSlides] = useState([]);
  const [isWriteMode, setIsWriteMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // 🎬 파일 처리 및 프로그레스 상태 관리 변수 선언
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
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

  // 🎬 파일 선택 시 상태값 캐싱 처리
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // 파일을 직접 업로드하면 기존 직접 작성 중이던 URL 텍스트 칸을 초기화하고 우선순위 적용 알림 명시
      setFormData(prev => ({ ...prev, videoUrl: `[선택된 파일]: ${file.name}` }));
    }
  };

  // 🎯 등록 / 수정 통합 서브밋 가속 파이프라인
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalVideoUrl = formData.videoUrl;

    // 🎬 컴퓨터에서 업로드할 비디오 파일이 선택된 경우, 백엔드 바이너리 디스크 스토리지 선점 실행
    if (selectedFile) {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append('video', selectedFile);

      try {
        const uploadRes = await axios.post(`${API_URL}/main-slides/upload`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalVideoUrl = uploadRes.data.videoUrl; // 백엔드가 수락한 정적 접근 주소 매핑 전환
      } catch (uploadErr) {
        alert(uploadErr.response?.data?.message || '비디오 서버 파일 업로드 실패. 용량이나 형식을 확인하세요.');
        setIsUploading(false);
        return;
      }
    }

    // 파일 업로드 검증 단계 정상 통과 시 최종 주소 갱신 조치
    const payload = {
      ...formData,
      videoUrl: finalVideoUrl
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/main-slides/${editingId}`, payload);
        alert('슬라이드가 수정되었습니다.');
      } else {
        await axios.post(`${API_URL}/main-slides`, payload);
        alert('새 슬라이드가 등록되었습니다.');
      }
      resetForm();
      fetchSlides();
    } catch (err) { 
      alert('데이터베이스 슬라이드 정보 저장 실패'); 
    } finally {
      setIsUploading(false);
    }
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
    setSelectedFile(null);
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
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
              
              {/* 🎬 영상 소스 멀티플 바인딩 제어 단락 */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-neutral-400">영상 소스 선택 *</label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  {/* 파일 업로드 숨김 인풋 브릿지 */}
                  <input 
                    type="file" 
                    accept="video/*" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 px-4 py-3 rounded-xl transition whitespace-nowrap"
                  >
                    🎬 영상 파일 선택
                  </button>
                  <input 
                    type="text" 
                    name="videoUrl" 
                    required 
                    value={formData.videoUrl} 
                    onChange={handleInputChange} 
                    placeholder="파일을 선택하시거나 직접 외부 영상 주소(/videos/main.mp4 등)를 기입하세요." 
                    className="flex-1 text-sm border border-neutral-200 rounded-xl px-4 py-3 text-neutral-600 font-mono text-xs" 
                  />
                </div>
                {selectedFile && (
                  <p className="text-[11px] text-blue-600 font-semibold animate-fadeIn">
                    ✓ 저장 시 서버로 전송 및 인코딩 배치가 가동됩니다: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
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
              <button type="button" disabled={isUploading} onClick={resetForm} className="text-xs text-neutral-500 border bg-white px-4 py-2.5 rounded-xl disabled:opacity-50">취소</button>
              <button type="submit" disabled={isUploading} className="text-xs font-bold text-white bg-neutral-950 px-5 py-2.5 rounded-xl shadow-sm hover:bg-neutral-800 transition-all disabled:bg-neutral-400 flex items-center gap-1.5">
                {isUploading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    서버로 대용량 전송 중...
                  </>
                ) : editingId ? '수정 완료하기' : '저장 완료하기'}
              </button>
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