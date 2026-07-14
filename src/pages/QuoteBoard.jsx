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

  // ✨ 비밀번호 모달 통합 관리: 'view' | 'edit' | 'delete'
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingQuoteId, setPendingQuoteId] = useState(null);
  const [verifiedPassword, setVerifiedPassword] = useState(''); // ✨ 비로그인 작성자 수정 시 재사용

  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    company: '', name: '', phone: '', email: '', title: '', content: ''
  });

  const [serverTid, setServerTid] = useState('');
  const [captchaInfo, setCaptchaInfo] = useState({ question: '', cid: '' });
  const [captchaInput, setCaptchaInput] = useState('');
  const [isCaptchaRequired, setIsCaptchaRequired] = useState(false);

  const [replyInput, setReplyInput] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);

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

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBackToList = () => {
    setSelectedQuote(null);
    setIsEditMode(false);
    setPasswordInput('');
    setVerifiedPassword('');
    setReplyInput('');
  };

  // ✨ 비밀번호 모달 열기 (view / edit / delete 공용)
  const openPasswordModal = (mode, id) => {
    setModalMode(mode);
    setPendingQuoteId(id);
    setPasswordInput('');
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPendingQuoteId(null);
    setPasswordInput('');
  };

  const handleRowClick = async (post) => {
    try {
      if (post.isSecret && !isLoggedIn) {
        openPasswordModal('view', post.id);
      } else {
        const res = await api.get(`/quotes/${post.id}`);
        setSelectedQuote(res.data);
        setReplyInput(res.data.reply || '');
      }
    } catch (err) {
      alert('데이터를 불러오지 못했습니다.');
    }
  };

  // ✨ 비밀번호 모달 확인 버튼: 모드에 따라 분기 처리
  const handlePasswordModalConfirm = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return alert('비밀번호를 입력해주세요.');

    if (modalMode === 'view') {
      try {
        const res = await api.post(`/quotes/${pendingQuoteId}/verify`, { password: passwordInput });
        setSelectedQuote(res.data);
        setReplyInput(res.data.reply || '');
        closePasswordModal();
      } catch (err) {
        alert('비밀번호가 올바르지 않습니다.');
      }
      return;
    }

    if (modalMode === 'edit') {
      try {
        const res = await api.post(`/quotes/${pendingQuoteId}/verify`, { password: passwordInput });
        setSelectedQuote(res.data);
        setVerifiedPassword(passwordInput); // ✨ 저장 시 재사용
        setEditFormData({
          company: res.data.company || '',
          name: res.data.name || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          title: res.data.title || '',
          content: res.data.content || '',
        });
        setIsEditMode(true);
        closePasswordModal();
      } catch (err) {
        alert('비밀번호가 올바르지 않습니다.');
      }
      return;
    }

    if (modalMode === 'delete') {
      if (!window.confirm('정말 이 견적 문의를 완전 삭제하시겠습니까? 삭제한 내용은 복구할 수 없습니다.')) return;
      try {
        await api.delete(`/quotes/${pendingQuoteId}`, { data: { password: passwordInput } });
        alert('견적글이 정상적으로 삭제되었습니다.');
        closePasswordModal();
        handleBackToList();
        fetchQuotes();
      } catch (err) {
        alert('삭제 권한이 없거나 비밀번호가 틀렸습니다.');
      }
    }
  };

  // ✨ 삭제 버튼 클릭: 관리자는 바로 확인창, 비로그인은 비밀번호 모달
  const handleDeleteClick = async () => {
    if (isLoggedIn) {
      if (!window.confirm('정말 이 견적 문의를 완전 삭제하시겠습니까? 삭제한 내용은 복구할 수 없습니다.')) return;
      try {
        await api.delete(`/quotes/${selectedQuote.id}`, { data: {} });
        alert('견적글이 정상적으로 삭제되었습니다.');
        handleBackToList();
        fetchQuotes();
      } catch (err) {
        alert('삭제 권한이 없거나 비밀번호가 틀렸습니다.');
      }
    } else {
      openPasswordModal('delete', selectedQuote.id);
    }
  };

  // ✨ 수정 버튼 클릭: 관리자는 바로 수정 폼, 비로그인은 비밀번호 모달
  const handleEditClick = () => {
    if (isLoggedIn) {
      setEditFormData({
        company: selectedQuote.company || '',
        name: selectedQuote.name || '',
        phone: selectedQuote.phone || '',
        email: selectedQuote.email || '',
        title: selectedQuote.title || '',
        content: selectedQuote.content || '',
      });
      setIsEditMode(true);
    } else {
      openPasswordModal('edit', selectedQuote.id);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      return alert('제목과 내용을 입력해주세요.');
    }
    try {
      const payload = { ...editFormData };
      if (!isLoggedIn) payload.password = verifiedPassword; // ✨ 비로그인 작성자 본인 확인
      const res = await api.put(`/quotes/${selectedQuote.id}`, payload);
      setSelectedQuote(res.data);
      setIsEditMode(false);
      alert('수정이 완료되었습니다.');
      fetchQuotes();
    } catch (err) {
      alert('수정에 실패했습니다.');
    }
  };

  const handleReplySubmit = async () => {
    if (!replyInput.trim()) return alert('답변 내용을 입력해주세요.');
    setIsReplySubmitting(true);
    try {
      const res = await api.put(`/quotes/${selectedQuote.id}/reply`, { reply: replyInput });
      setSelectedQuote(res.data);
      alert(
        selectedQuote.email
          ? '답변이 등록되었고, 작성자 이메일로 발송되었습니다.'
          : '답변이 등록되었습니다. (작성자가 이메일을 남기지 않아 메일은 발송되지 않았습니다)'
      );
      fetchQuotes();
    } catch (err) {
      alert('답변 등록에 실패했습니다.');
    } finally {
      setIsReplySubmitting(false);
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

  // 🔒 회사명 마스킹: 앞쪽 절반은 노출, 뒤쪽 절반은 * 처리
  const maskCompanyName = (name) => {
    if (!name) return '-';
    const len = name.length;
    const visibleCount = Math.ceil(len / 2); // 앞쪽 절반(홀수면 한 글자 더 노출)
    const maskedCount = len - visibleCount;
    return name.slice(0, visibleCount) + '*'.repeat(maskedCount);
  };

  const totalPages = Math.ceil(boardList.length / ITEMS_PER_PAGE);
  const currentQuotes = boardList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const passwordModalConfig = {
    view: { title: '비밀번호 확인', confirmLabel: '확인' },
    edit: { title: '수정을 위한 비밀번호 확인', confirmLabel: '확인' },
    delete: { title: '삭제를 위한 비밀번호 확인', confirmLabel: '확인' },
  }[modalMode];

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
                    <th className="py-4 px-6 text-center">회사명</th>
                    <th className="py-4 px-6 text-center">접수 날짜</th>
                    <th className="py-4 px-6 text-center">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentQuotes.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 cursor-pointer transition" onClick={() => handleRowClick(post)}>
                      <td className="py-4 px-6 text-center text-xs text-slate-400 font-mono">{post.id}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-900">{post.title}</td>
                      <td className="py-4 px-6 text-center text-xs text-slate-500">{maskCompanyName(post.company) || '-'}</td>
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

            {/* ✏️ 수정 모드 */}
            {isEditMode ? (
              <div className="space-y-5 text-left">
                <h2 className="text-lg font-bold text-slate-900">문의 내용 수정</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">회사명</label><input name="company" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleEditInputChange} value={editFormData.company} /></div>
                  <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">담당자명</label><input name="name" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleEditInputChange} value={editFormData.name} /></div>
                  <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">연락처</label><input name="phone" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleEditInputChange} value={editFormData.phone} /></div>
                  <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">이메일</label><input name="email" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleEditInputChange} value={editFormData.email} /></div>
                </div>

                <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">문의 제목</label><input name="title" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleEditInputChange} value={editFormData.title} /></div>
                <div className="space-y-1.5"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">문의 내용</label><textarea name="content" rows={6} className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition" onChange={handleEditInputChange} value={editFormData.content} /></div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button onClick={handleSaveEdit} className="text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl transition">저장</button>
                  <button onClick={handleCancelEdit} className="text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-xl transition">취소</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-slate-900">{selectedQuote.title}</h2>
                  <span className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full ${selectedQuote.status === '답변완료' ? 'bg-blue-50 text-blue-500 border border-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                    {selectedQuote.status}
                  </span>
                </div>

                {/* ✨ 관리자 전용: 작성자 정보 패널 */}
                {isLoggedIn && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
                    <div className="space-y-1">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">회사명</p>
                      <p className="text-slate-800 font-semibold">{selectedQuote.company || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">작성자명</p>
                      <p className="text-slate-800 font-semibold">{selectedQuote.name || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">연락처</p>
                      <p className="text-slate-800 font-semibold">{selectedQuote.phone || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">이메일</p>
                      <p className="text-slate-800 font-semibold truncate">{selectedQuote.email || '-'}</p>
                    </div>
                  </div>
                )}

                <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedQuote.content}</div>

                {/* ✨ 관리자 전용: 답변 작성 영역 */}
                {isLoggedIn && (
                  <div className="pt-6 border-t border-slate-100 space-y-3">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      답변 작성 {selectedQuote.email && <span className="text-blue-500 normal-case font-medium">· 등록 시 {selectedQuote.email} 로 메일이 발송됩니다</span>}
                    </label>
                    <textarea
                      rows={5}
                      className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 transition"
                      placeholder="답변 내용을 입력하세요"
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                    />
                    <button
                      onClick={handleReplySubmit}
                      disabled={isReplySubmitting}
                      className="bg-slate-900 hover:bg-blue-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isReplySubmitting ? '등록 중...' : selectedQuote.reply ? '답변 수정 및 재발송' : '답변 등록 및 메일 발송'}
                    </button>
                  </div>
                )}

                {/* 비로그인(작성자) 뷰: 답변이 있으면 표시만 */}
                {!isLoggedIn && selectedQuote.reply && (
                  <div className="pt-6 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">답변</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-blue-50/40 p-5 rounded-2xl">{selectedQuote.reply}</p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-6 border-t border-slate-100">
                  <button onClick={handleEditClick} className="text-sm font-bold text-blue-500 border border-blue-500 px-6 py-3 rounded-xl">수정</button>
                  <button onClick={handleDeleteClick} className="text-sm font-bold text-rose-500 border border-rose-500 px-6 py-3 rounded-xl">삭제</button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handlePasswordModalConfirm} className="bg-white p-8 rounded-[2rem] max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-700">{passwordModalConfig.title}</h3>
            <input
              type="password"
              autoFocus
              className="w-full border border-slate-200 p-4 rounded-2xl"
              placeholder="비밀번호"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold">{passwordModalConfig.confirmLabel}</button>
              <button type="button" onClick={closePasswordModal} className="flex-1 bg-slate-200 py-4 rounded-2xl font-bold">취소</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default QuoteBoard;