// daon-frontend/src/pages/QuoteBoard.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import Pagination from '../components/Pagination';

const QuoteBoard = ({ initialTab = 'list', isLoggedIn = false }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [boardList, setBoardList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingQuoteId, setPendingQuoteId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [serverTid, setServerTid] = useState('');
  const [captchaInfo, setCaptchaInfo] = useState({ question: '', cid: '' });
  const [captchaInput, setCaptchaInput] = useState('');
  const [isCaptchaRequired, setIsCaptchaRequired] = useState(false);

  const [formData, setFormData] = useState({
    company: '', name: '', phone: '', email: '', title: '', content: '', isSecret: true, password: '', privacyAgreement: false
  });

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/quotes');
      setBoardList(Array.isArray(response.data) ? response.data : (response.data.data || []));
    } catch (error) {
      console.error('견적 목록 로드 실패:', error);
      setBoardList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { setActiveTab(initialTab); handleBackToList(); }, [initialTab]);
  useEffect(() => { if (activeTab === 'list') fetchQuotes(); }, [activeTab]);

  useEffect(() => {
    const fetchInitToken = async () => {
      if (activeTab === 'write') {
        try {
          const res = await api.get('/quotes/init');
          setServerTid(res.data.tid);
          setIsCaptchaRequired(false);
        } catch (err) { console.error('세션 초기화 실패', err); }
      }
    };
    fetchInitToken();
  }, [activeTab]);

  const fetchCaptcha = async () => {
    try {
      const res = await api.get('/quotes/quiz');
      setCaptchaInfo({ question: res.data.question, cid: res.data.cid });
      setIsCaptchaRequired(true);
    } catch (err) { console.error('퀴즈 로드 실패', err); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBackToList = () => {
    setSelectedQuote(null);
    setIsEditMode(false);
    setPasswordInput('');
  };

  const handleRowClick = async (post) => {
    try {
      if (post.isSecret && !isLoggedIn) {
        setPendingQuoteId(post.id);
        setShowPasswordModal(true);
      } else {
        const res = await api.get(`/quotes/${post.id}`);
        setSelectedQuote(res.data);
      }
    } catch (err) {
      alert('데이터를 불러오지 못했습니다.');
    }
  };

  const handlePasswordVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/quotes/${pendingQuoteId}/verify`, { password: passwordInput });
      setSelectedQuote(res.data);
      setShowPasswordModal(false);
      setPasswordInput('');
    } catch (err) {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleDeleteQuote = async () => {
    if (!window.confirm('정말 이 견적 문의를 완전 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/quotes/${selectedQuote.id}`, { data: { password: passwordInput } });
      alert('견적글이 정상적으로 삭제되었습니다.');
      handleBackToList();
      fetchQuotes();
    } catch (err) {
      alert('삭제 권한이 없거나 비밀번호가 틀렸습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.privacyAgreement) return alert('개인정보 수집 및 이용에 동의해주세요.');
    try {
      const payload = { ...formData, tid: serverTid, cid: captchaInfo.cid || undefined, ans: captchaInput || undefined };
      const res = await api.post('/quotes/', payload);
      
      if (res.data?.success === false && res.data.code === 'CAPTCHA_REQUIRED') {
        alert('보안 검증이 필요합니다.');
        fetchCaptcha();
        return;
      }
      alert('견적 문의가 정상적으로 접수되었습니다.');
      setFormData({ company: '', name: '', phone: '', email: '', title: '', content: '', isSecret: true, password: '', privacyAgreement: false });
      setActiveTab('list');
    } catch (error) { alert('접수 실패'); }
  };

  const totalPages = Math.ceil(boardList.length / ITEMS_PER_PAGE);
  const currentQuotes = boardList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-neutral-900 font-sans antialiased selection:bg-blue-500/10 selection:text-blue-600">
      
      {/* 🌌 회사소개 스타일 헤더 디자인 */}
      <header className="bg-white border-b border-neutral-200/60 pt-32 pb-16 px-4 md:px-10 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <div className="text-[10px] tracking-widest font-black text-blue-500 uppercase font-mono bg-blue-50 px-3 py-1 rounded-full inline-block">
            DAON C&E QUOTE
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[oklch(0.38_0.07_259.56)] tracking-tight">
            견적문의
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 font-medium tracking-wide">
            다온씨엔이의 신속한 응답을 약속드립니다.
          </p>
        </div>

        {/* 🎛️ 중앙 세그먼트 스위치 탭 */}
        {!selectedQuote && (
          <div className="max-w-md mx-auto mt-10 p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200/40 flex gap-1 shadow-inner">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 text-xs font-bold py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-[oklch(0.38_0.07_259.56)] shadow-md font-black scale-[1.01]'
                  : 'text-neutral-400 hover:text-neutral-800'
              }`}
            >
              문의 목록
            </button>
            <button
              onClick={() => setActiveTab('write')}
              className={`flex-1 text-xs font-bold py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-white text-[oklch(0.38_0.07_259.56)] shadow-md font-black scale-[1.01]'
                  : 'text-neutral-400 hover:text-neutral-800'
              }`}
            >
              문의하기
            </button>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto py-12 md:py-16 px-4 md:px-10 animate-fadeIn">
        {/* 1. 리스트 뷰 */}
        {!selectedQuote && activeTab === 'list' && (
          <>
            <div className="bg-white rounded-[2.5rem] border border-neutral-200/50 shadow-sm overflow-hidden text-left">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6 text-center">번호</th>
                    <th className="py-4 px-6">제목</th>
                    <th className="py-4 px-6 text-center">작성자</th>
                    <th className="py-4 px-6 text-center">접수 날짜</th>
                    <th className="py-4 px-6 text-center">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentQuotes.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 cursor-pointer transition" onClick={() => handleRowClick(post)}>
                      <td className="py-4 px-6 text-center text-xs text-slate-400 font-mono">{post.id}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-900">{post.title}</td>
                      <td className="py-4 px-6 text-center text-xs text-slate-500">{post.name}</td>
                      <td className="py-4 px-6 text-center text-xs text-slate-400 font-mono">{post.createdAt?.split('T')[0]}</td>
                      <td className="py-4 px-6 text-center"><span className={`text-[10px] font-bold px-3 py-1 rounded-full ${post.status === '답변완료' ? 'bg-blue-50 text-blue-500 border border-blue-100' : 'bg-slate-100 text-slate-500'}`}>{post.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
          </>
        )}

        {/* 2. 작성 폼 */}
        {!selectedQuote && activeTab === 'write' && (
          <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.02)] border border-slate-200/60 space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">회사명</label><input name="company" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleInputChange} value={formData.company} /></div>
              <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">담당자명</label><input name="name" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleInputChange} value={formData.name} /></div>
              <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">연락처</label><input name="phone" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleInputChange} value={formData.phone} /></div>
              <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">이메일</label><input name="email" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleInputChange} value={formData.email} /></div>
            </div>
            
            <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">문의 제목</label><input name="title" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleInputChange} value={formData.title} required /></div>
            <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">문의 내용</label><textarea name="content" rows={6} className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleInputChange} value={formData.content} required /></div>
            
            <div className="flex items-center gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" name="isSecret" checked={formData.isSecret} onChange={handleInputChange} /> 비밀글</label>
              {formData.isSecret && <input type="password" name="password" placeholder="비밀번호" className="border border-slate-200 rounded-xl px-4 py-2 text-sm" onChange={handleInputChange} value={formData.password} />}
            </div>

            {isCaptchaRequired && (
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm">
                <p className="text-xs font-bold text-blue-500 mb-2">{captchaInfo.question}</p>
                <input className="w-full border border-blue-200 p-3 rounded-xl" onChange={(e) => setCaptchaInput(e.target.value)} value={captchaInput} placeholder="정답을 입력하세요" />
              </div>
            )}

            <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <input type="checkbox" name="privacyAgreement" checked={formData.privacyAgreement} onChange={handleInputChange} required />
              개인정보 수집 및 이용에 동의합니다.
            </label>
            
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition">문의 접수하기</button>
          </form>
        )}

        {/* 3. 상세 뷰 */}
        {selectedQuote && (
          <div className="bg-white/95 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
            <button onClick={handleBackToList} className="text-xs font-bold text-slate-400 hover:text-blue-500 transition">← 목록으로</button>
            <h2 className="text-xl font-bold text-slate-900">{selectedQuote.title}</h2>
            <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedQuote.content}</div>
            
            <div className="flex gap-2 pt-6 border-t border-slate-100">
              <button onClick={() => setIsEditMode(true)} className="text-sm font-bold text-blue-500 border border-blue-500 px-6 py-3 rounded-xl">수정</button>
              <button onClick={() => { setPendingQuoteId(selectedQuote.id); setShowPasswordModal(true); }} className="text-sm font-bold text-rose-500 border border-rose-500 px-6 py-3 rounded-xl">삭제</button>
            </div>
          </div>
        )}
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-700">비밀번호 확인</h3>
            <input type="password" className="w-full border border-slate-200 p-4 rounded-2xl" placeholder="비밀번호" onChange={(e) => setPasswordInput(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={pendingQuoteId ? handlePasswordVerify : handleDeleteQuote} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold">확인</button>
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 bg-slate-200 py-4 rounded-2xl font-bold">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteBoard;