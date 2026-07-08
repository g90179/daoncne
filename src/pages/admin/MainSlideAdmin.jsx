// daon-frontend/src/pages/admin/MainSlideAdmin.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import Pagination from '../../components/Pagination';

const MainSlideAdmin = () => {
  const [slides, setSlides] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // 🔑 슬라이드 독립 페이징 상태값 (한 페이지당 5개 노출로 세로 밸런스 최적화)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
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

  // 파일 선택 시 상태값 캐싱 처리
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, videoUrl: `[선택된 파일]: ${file.name}` }));
    }
  };

  // 등록 / 수정 통합 서브밋 가속 파이프라인
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('배너 제목을 입력해 주세요.');
    
    let finalVideoUrl = formData.videoUrl;

    if (selectedFile) {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append('video', selectedFile);

      try {
        const uploadRes = await axios.post(`${API_URL}/main-slides/upload`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalVideoUrl = uploadRes.data.videoUrl;
      } catch (uploadErr) {
        alert(uploadErr.response?.data?.message || '비디오 서버 파일 업로드 실패. 용량이나 형식을 확인하세요.');
        setIsUploading(false);
        return;
      }
    }

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
        setCurrentPage(1); // 신규 추가 시 첫 페이지로 복귀
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_URL}/main-slides/${id}`);
      if (currentSlides.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      fetchSlides();
    } catch (err) { alert('삭제 실패'); }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', videoUrl: '', isExposed: true, duration: 5 });
    setEditingId(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 페이징 연산공식 대입
  const totalPages = Math.ceil(slides.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentSlides = slides.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-12xl mx-auto animate-fadeIn">
      
      {/* 🔄 [1:1 매칭 구조] 콘텐츠 관리와 완벽 대칭 구조 형성 (너비 반반 및 높이 h-[760px] 고정) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* 👈 좌측: 메인 슬라이드 리스트 보드 */}
        <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.02)] border border-white/70 flex flex-col justify-between h-[760px] transition-all">
          
          {/* 플랫 헤더 */}
          <div className="border-b border-slate-100 pb-3 mb-2 px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              슬라이드 대기열목록 ({slides.length})
            </h3>
          </div>

          {/* 슬라이드 아이템 피드 본문 (테이블 제거 후 플랫 타임라인화) */}
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 mb-4">
            {slides.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs font-medium space-y-2 py-20">
                <span className="text-2xl">🎬</span>
                <span>등록된 메인 배너 슬라이드가 없습니다.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {currentSlides.map((slide, idx) => (
                  <div key={slide.id} className="group flex items-center justify-between py-4 px-1 hover:bg-slate-50/60 transition-all duration-200">
                    
                    {/* 정보 결합단 */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* 가상 비디오 사각 썸네일 플레이스홀더 */}
                      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200/40 flex flex-col items-center justify-center shrink-0 shadow-inner text-slate-400 font-mono text-[10px] font-bold">
                        <span>▶</span>
                        <span className="mt-0.5 text-[9px] text-slate-400/80">{slide.duration}s</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* 🔑 제목 색상 oklch 명품 블루 계열 주입 */}
                        <h4 className="text-sm font-bold text-[oklch(0.38_0.07_259.56)] truncate group-hover:text-blue-500 transition-colors">
                          {slide.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-1 font-mono">
                          {slide.videoUrl}
                        </p>
                      </div>
                    </div>

                    {/* 상태 및 액션 제어단 */}
                    <div className="flex items-center shrink-0 pl-4 gap-4">
                      {/* 노출 여부 배지: bg-blue-400 테마 조율 */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition shadow-sm ${
                        slide.isExposed 
                          ? 'bg-blue-50 text-blue-500 border border-blue-100' 
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {slide.isExposed ? '노출중' : '숨김'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(slide)} className="cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all active:scale-95 whitespace-nowrap">수정</button>
                        <button onClick={() => handleDelete(slide.id)} className="cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all active:scale-95 whitespace-nowrap">삭제</button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 투명 페이징 인덱서 */}
          <div className="pt-4 border-t border-slate-100/60">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>

        {/* 👉 우측: 슬라이드 정보 빌더 에디터 폼 */}
        <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.02)] border border-white/70 h-[760px] overflow-y-auto custom-scrollbar transition-all">
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-[oklch(0.38_0.07_259.56)] tracking-tight">
                {editingId ? '✨ 슬라이드 배너 수정' : '✍️ 신규 슬라이드 빌드'}
              </h3>
              {editingId && (
                <span className="text-[10px] bg-blue-50 text-blue-500 px-2.5 py-1 rounded-md font-bold font-mono">
                  EDIT MODE
                </span>
              )}
            </div>

            {/* 1. 배너 제목 인풋 */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">배너 대제목 *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="ex) 대온씨엔이가 설계하고 완수한 정밀 공학 프로젝트" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/5 transition-all duration-300" />
            </div>

            {/* 2. 배너 소설명 인풋 */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">간단 서브 설명</label>
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="ex) 정밀 공학적 시뮬레이션과 안전 표준을 철저히 준수합니다." className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/5 transition-all duration-300" />
            </div>

            {/* 3. 비디오 소스 멀티플 바인딩 제어 존 */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">영상 배너 소스 지정 *</label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold bg-slate-500 text-white hover:bg-blue-400 px-4 py-3.5 rounded-xl transition whitespace-nowrap cursor-pointer shadow-sm"
                >
                  🎬 파일 찾기
                </button>
                <input type="text" name="videoUrl" required value={formData.videoUrl} onChange={handleInputChange} placeholder="직접 외부 영상 주소(/videos/main.mp4 등)를 기입하셔도 됩니다." className="flex-1 bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-xs text-slate-600 font-mono outline-none focus:bg-white focus:border-blue-400 transition-all duration-300" />
              </div>
              {selectedFile && (
                <p className="text-[11px] text-blue-500 font-semibold pl-1 animate-fadeIn">
                  ✓ 컴파일 대기 중: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>

            {/* 4. 시간 노출 및 노출 토글 인라인 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">롤링 노출 시간 (초)</label>
                <input type="number" name="duration" min="1" required value={formData.duration} onChange={handleInputChange} className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-bold outline-none focus:bg-white focus:border-blue-400 transition-all" />
              </div>
              <div className="flex items-center gap-2.5 sm:pt-6 pl-1">
                <input type="checkbox" id="isExposed" name="isExposed" checked={formData.isExposed} onChange={handleInputChange} className="w-4 h-4 accent-blue-400 rounded cursor-pointer" />
                <label htmlFor="isExposed" className="text-xs font-bold text-slate-600 cursor-pointer select-none">메인 배너 자리에 즉시 표출</label>
              </div>
            </div>

            {/* 하단 액션 버튼바 */}
            <div className="flex justify-end gap-2 pt-6 border-t border-slate-100/60">
              <button type="button" disabled={isUploading} onClick={resetForm} className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold transition-all cursor-pointer disabled:opacity-50">
                작업 취소
              </button>
              <button type="submit" disabled={isUploading} className="px-6 py-3 rounded-xl bg-blue-400 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-400/20 transition-all disabled:bg-slate-400 flex items-center gap-1.5 cursor-pointer">
                {isUploading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    서버 바이너리 전송 중...
                  </>
                ) : editingId ? '변경사항 저장하기' : '새 슬라이드 등록완료'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default MainSlideAdmin;