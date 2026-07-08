// daon-frontend/src/pages/admin/AdminPolicyAdmin.jsx
import React, { useState, useEffect } from 'react';
import axiosOriginal from 'axios';
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
  GeneralHtmlSupport // 🔑 [품질 보존] 인라인 스타일과 모든 HTML 커스텀 태그 유실을 원천 차단하는 구원투수 플러그인
} from 'ckeditor5';
import Pagination from '../../components/Pagination';
import { API_URL } from '../../config';

const AdminPolicyAdmin = () => {
  const [policies, setPolicies] = useState([]);
  const [filterType, setFilterType] = useState('ALL'); // ALL, PRIVACY, TERMS
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6; 

  // 인프라 입력 폼 빌더 상태값들
  const [title, setTitle] = useState('');
  const [type, setType] = useState('PRIVACY');
  const [content, setContent] = useState('');
  const [isExposed, setIsExposed] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(''); 
  const [editingId, setEditingId] = useState(null);

  const axiosInstance = axiosOriginal.create({ baseURL: API_URL });
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchPolicies = async () => {
    try {
      const targetQuery = filterType === 'ALL' ? '' : `?type=${filterType}`;
      const res = await axiosInstance.get(`/policies${targetQuery}`);
      setPolicies(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchPolicies();
    setPage(1);
  }, [filterType]);

  const handleSavePolicy = async () => {
    if (!title || !content || !effectiveDate) { alert('문서 제목, 시행일자, 약관 본문 내용을 입력하세요.'); return; }
    try {
      if (editingId) {
        await axiosInstance.patch(`/policies/${editingId}`, { title, type, content, isExposed, effectiveDate });
        alert('공시 문서가 수정 완료되었습니다.');
      } else {
        await axiosInstance.post('/policies', { title, type, content, isExposed, effectiveDate });
        alert('새로운 약관 규격이 대기열에 등록되었습니다.');
      }
      handleClearForm();
      fetchPolicies();
    } catch (e) { alert('약관 데이터 처리 실패'); }
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
        
        {/* 👈 좌측 컬럼: 공시 자원 목록 카드 플레이트 */}
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.02)] border border-white/70 flex flex-col justify-between h-[850px] transition-all duration-500">
          
          <div>
            <div className="mb-6 flex justify-center sm:justify-start">
              <div className="bg-slate-200/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60 flex gap-1 shadow-inner w-full sm:w-auto">
                {[ ['ALL', '전체'], ['PRIVACY', '개인정보'], ['TERMS', '이용약관'] ].map(([key, label]) => {
                  const isTabActive = filterType === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterType(key)}
                      className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                        isTabActive
                          ? 'bg-blue-400 text-white shadow-lg shadow-blue-400/20 scale-[1.02]'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-white/40'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
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
                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded-md animate-pulse">
                              공식 노출중
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 truncate">{p.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                          <span>등록일: {new Date(p.createdAt).toLocaleDateString()}</span>
                          {p.effectiveDate && (
                            <span className="text-blue-500 font-semibold">시행일: {p.effectiveDate.slice(0, 10)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleEditSetup(p)} className="cursor-pointer text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all active:scale-95 whitespace-nowrap">수정</button>
                        <button onClick={async () => { if(confirm('삭제하시겠습니까?')) { await axiosInstance.delete(`/policies/${p.id}`); fetchPolicies(); } }} className="cursor-pointer text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all active:scale-95 whitespace-nowrap">삭제</button>
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

        {/* 👉 우측 컬럼: 스타일 유실 가드가 탑재된 에디터 캔버스 */}
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.02)] border border-white/70 h-[850px] flex flex-col justify-between text-left transition-all duration-500">
          
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 shrink-0">
              <h3 className="text-base font-bold text-[oklch(0.38_0.07_259.56)] tracking-tight">
                {editingId ? '🛠️ 약관 에디팅 모드 활성화' : '📝 신규 공시 문서 작성 컴포지션'}
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
                    <option value="PRIVACY">개인정보처리방침 (Privacy Policy)</option>
                    <option value="TERMS">이용약관 (Terms of Service)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">법적 효력 시행일자 *</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-4 py-[9px] text-sm text-[oklch(0.38_0.07_259.56)] font-semibold outline-none focus:bg-white focus:border-blue-400 transition cursor-pointer"
                    value={effectiveDate}
                    onChange={e => setEffectiveDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">공식 서비스 표출 제어</label>
                  <div className="flex items-center h-[46px] bg-slate-50/60 border border-slate-200/50 rounded-2xl px-4">
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                      <input type="checkbox" checked={isExposed} onChange={e => setIsExposed(e.target.checked)} className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400 cursor-pointer" />
                      이 버전을 공식 약관으로 즉시 노출 활성화
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">관리용 약관 타이틀 명칭 *</label>
                <input type="text" placeholder="예: 개인정보처리방침 v1.3 (2026년 개정판)" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 transition" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              {/* 📝 CKEditor 5 HTML 소스 코드 편집 파이프라인 탑재 에어리어 */}
              <div className="space-y-1.5 flex-1 flex flex-col min-h-[380px] cked-custom-stretch">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">약관 세부 조항 본문 명세 *</label>
                <div className="flex-1 min-h-0 overflow-hidden border border-slate-200/50 rounded-2xl bg-slate-50/40 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-400/5 transition-all duration-300 ckeditor-custom-wrapper">
                  <CKEditor
                    editor={ ClassicEditor }
                    config={ {
                      licenseKey: 'GPL',
                      plugins: [ 
                        Essentials, Paragraph, Bold, Italic, Strikethrough, Heading, List, Undo,
                        Table, TableToolbar, TableProperties, TableCellProperties,
                        SourceEditing,
                        GeneralHtmlSupport // 🔑 플러그인 로드
                      ], 
                      toolbar: [
                        'undo', 'redo', '|', 
                        'sourceEditing', '|', 
                        'heading', '|', 'bold', 'italic', 'strikethrough', '|', 
                        'bulletedList', 'numberedList', '|', 'insertTable'
                      ],
                      table: { 
                        contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', '|', 'tableProperties', 'tableCellProperties' ] 
                      },
                      // 🔑 [핵심 마감 가드] 에디터 내부의 모든 태그명, 클래스명, 인라인 스타일 필터링 해제 선언
                      htmlSupport: {
                        allow: [
                          {
                            name: /.*/,
                            attributes: true,
                            classes: true,
                            styles: true
                          }
                        ]
                      },
                      placeholder: '법적 공시에 적합한 약관 상세 조항들을 구조화하여 기입하세요. 소스 편집 모드를 통해 외부 HTML 태그 주입을 지원합니다.'
                    } }
                    data={ editingId ? content : '' } 
                    onChange={ ( event, editor ) => {
                      const data = editor.getData();
                      setContent( data );
                    } }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100/60 shrink-0">
            <button onClick={handleSavePolicy} className={`w-full text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer ${
              editingId ? 'bg-amber-500 shadow-amber-500/20 hover:bg-amber-600' : 'bg-blue-400 shadow-blue-400/20 hover:bg-blue-500'
            }`}>
              {editingId ? '공시 문서 변경 조항 저장하기' : '작성 완료된 약관 공식 발행'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPolicyAdmin;