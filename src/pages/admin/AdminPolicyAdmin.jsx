// daon-frontend/src/pages/admin/AdminPolicyAdmin.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; // 🔑 통합된 API 모듈 불러오기
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
  GeneralHtmlSupport 
} from 'ckeditor5';
import Pagination from '../../components/Pagination';
import { API_URL } from '../../config';

const AdminPolicyAdmin = () => {
  const [policies, setPolicies] = useState([]);
  const [filterType, setFilterType] = useState('ALL'); 
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6; 

  const [title, setTitle] = useState('');
  const [type, setType] = useState('PRIVACY');
  const [content, setContent] = useState('');
  const [isExposed, setIsExposed] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(''); 
  const [editingId, setEditingId] = useState(null);

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

  const fetchPolicies = async () => {
    try {
      const targetQuery = filterType === 'ALL' ? '' : `?type=${filterType}`;
      const res = await api.get(`/policies${targetQuery}`);
      setPolicies(res.data);
    } catch (e) {
      console.error('약관 데이터 로드 실패', e);
    }
  };

  useEffect(() => {
    fetchPolicies();
    setPage(1);
  }, [filterType]);

  const handleSavePolicy = async () => {
    if (!title || !content || !effectiveDate) { alert('문서 제목, 시행일자, 약관 본문 내용을 입력하세요.'); return; }
    try {
      if (editingId) {
        await api.patch(`/policies/${editingId}`, { title, type, content, isExposed, effectiveDate });
        alert('공시 문서가 수정 완료되었습니다.');
      } else {
        await api.post('/policies', { title, type, content, isExposed, effectiveDate });
        alert('새로운 약관 규격이 대기열에 등록되었습니다.');
      }
      handleClearForm();
      fetchPolicies();
    } catch (e) { 
      alert('약관 데이터 처리 실패'); 
    }
  };

  const handleEditSetup = (p) => {
    setEditingId(p.id);
    setTitle(p.title);
    setType(p.type);
    setContent(p.content);
    setIsExposed(p.isExposed);
    setEffectiveDate(p.effectiveDate ? p.effectiveDate.slice(0, 10) : '');
  };

  const handleClearForm = () => {
    setEditingId(null);
    setTitle('');
    setType('PRIVACY');
    setContent('');
    setIsExposed(false);
    setEffectiveDate(''); 
  };

  const totalPages = Math.ceil(policies.length / ITEMS_PER_PAGE);
  const currentPolicies = policies.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="max-w-12xl mx-auto animate-fadeIn">
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* 좌측: 목록 카드 */}
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.02)] border border-white/70 flex flex-col justify-between h-[85vh] transition-all duration-500">
          <div>
            <div className="mb-6 flex justify-center sm:justify-start">
              <div className="bg-slate-200/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60 flex gap-1 shadow-inner w-full sm:w-auto">
                {/* 🚀 [수정됨] 배열 문법 오류 해결 및 이름 변경 */}
                {[
                  ['ALL', '전체'], 
                  ['PRIVACY', '개인정보처리방침'], 
                  ['TERMS', '이용약관']
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilterType(key)}
                    className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                      filterType === key
                        ? 'bg-blue-400 text-white shadow-lg shadow-blue-400/20 scale-[1.02]'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-white/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar max-h-[620px]">
              {currentPolicies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-slate-400 text-xs font-medium space-y-2">
                  <span className="text-2xl">📄</span>
                  <span>등록된 공시 문서 자료가 없습니다.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentPolicies.map(p => (
                    <div key={p.id} className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100/70 hover:bg-slate-50 transition flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                            p.type === 'PRIVACY' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
                          }`}>
                            {p.type === 'PRIVACY' ? '개인정보' : '이용약관'}
                          </span>
                          {p.isExposed && (
                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded-md animate-pulse">공식 노출중</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 truncate">{p.title}</h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleEditSetup(p)} className="cursor-pointer text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all active:scale-95">수정</button>
                        <button onClick={async () => { if(confirm('삭제하시겠습니까?')) { await api.delete(`/policies/${p.id}`); fetchPolicies(); } }} className="cursor-pointer text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all active:scale-95">삭제</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100/60">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>

        {/* 우측: 에디터 */}
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.02)] border border-white/70 h-[85vh] flex flex-col justify-between text-left transition-all duration-500">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 shrink-0">
              <h3 className="text-base font-bold text-[oklch(0.38_0.07_259.56)] tracking-tight">
                {editingId ? '🛠️ 약관 에디팅 모드 활성화' : '📝 신규 공시 문서 작성'}
              </h3>
              {editingId && (
                <button onClick={handleClearForm} className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer transition">
                  새 문서 작성으로 복귀
                </button>
              )}
            </div>

            <div className="space-y-4 flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">문서 분류 선택 *</label>
                  <select className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-4 py-3 text-sm text-[oklch(0.38_0.07_259.56)] font-semibold outline-none focus:bg-white focus:border-blue-400 transition cursor-pointer" value={type} onChange={e => setType(e.target.value)}>
                    <option value="PRIVACY">개인정보처리방침</option>
                    <option value="TERMS">이용약관</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">시행일자 *</label>
                  <input type="date" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-4 py-[9px] text-sm text-[oklch(0.38_0.07_259.56)] font-semibold outline-none focus:bg-white focus:border-blue-400 transition cursor-pointer" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">공식 노출</label>
                  <div className="flex items-center h-[46px] bg-slate-50/60 border border-slate-200/50 rounded-2xl px-4">
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={isExposed} onChange={e => setIsExposed(e.target.checked)} className="w-4 h-4 rounded text-blue-500 cursor-pointer" />
                      활성화
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">관리용 타이틀 *</label>
                <input type="text" placeholder="예: 개인정보처리방침 v1.0" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:bg-white focus:border-blue-400 transition" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              {/* 약관 본문 에디터 및 전체화면 버튼 래퍼 */}
              <div className="space-y-1.5 flex-1 flex flex-col min-h-[380px]">
                <div className="flex justify-between items-end shrink-0">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">약관 본문 *</label>
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    className="text-[11px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition cursor-pointer bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100"
                  >
                    ⛶ 화면 꽉 차게 쓰기
                  </button>
                </div>

                {/* 전체화면일 때 CKEditor 높이를 꽉 채워주는 전용 CSS 주입 */}
                {isFullscreen && (
                  <style>{`
                    .fullscreen-ckeditor .ck-editor { display: flex; flex-direction: column; height: 100%; }
                    .fullscreen-ckeditor .ck-editor__main { flex: 1; overflow-y: auto; }
                    .fullscreen-ckeditor .ck-content { min-height: 100% !important; border: none !important; box-shadow: none !important; }
                  `}</style>
                )}

                {/* 전체화면 모달 컨테이너 */}
                <div className={
                  isFullscreen
                    ? "fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10 transition-all duration-300 animate-fadeIn"
                    : "flex-1 min-h-0 overflow-hidden flex flex-col transition-all duration-300"
                }>
                  <div className={
                    isFullscreen
                      ? "bg-white w-full h-full max-w-[1400px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
                      : "flex-1 min-h-0 overflow-hidden border border-slate-200/50 rounded-2xl bg-slate-50/40 focus-within:bg-white focus-within:border-blue-400 transition-all ckeditor-custom-wrapper flex flex-col"
                  }>
                    
                    {/* 전체화면일 때만 보이는 상단 닫기 헤더 */}
                    {isFullscreen && (
                      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                        <div className="font-bold text-slate-700 text-sm">약관 본문 상세 편집 (전체화면 모드)</div>
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
                          plugins: [ Essentials, Paragraph, Bold, Italic, Strikethrough, Heading, List, Undo, Table, TableToolbar, TableProperties, TableCellProperties, SourceEditing, GeneralHtmlSupport ], 
                          toolbar: [ 'undo', 'redo', '|', 'sourceEditing', '|', 'heading', '|', 'bold', 'italic', 'strikethrough', '|', 'bulletedList', 'numberedList', '|', 'insertTable' ],
                          table: { contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', '|', 'tableProperties', 'tableCellProperties' ] },
                          htmlSupport: { allow: [{ name: /.*/, attributes: true, classes: true, styles: true }] }
                        } }
                        data={ editingId ? content : '' } 
                        onChange={ ( event, editor ) => setContent(editor.getData()) }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100/60 shrink-0">
            <button onClick={handleSavePolicy} className={`w-full text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-400 hover:bg-blue-500'}`}>
              {editingId ? '문서 변경 사항 저장' : '공식 발행'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPolicyAdmin;