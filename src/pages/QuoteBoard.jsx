import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const QuoteBoard = ({ initialTab = 'list', isLoggedIn = false }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [boardList, setBoardList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔎 상세 보기 및 제어 상태들
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingQuoteId, setPendingQuoteId] = useState(null);
  const [adminReplyInput, setAdminReplyInput] = useState('');

  // 1. 상태 변수 구조 우회 포맷으로 변경
  // 1. 상태 변수 스텔스 구조로 변경
  const [captchaInfo, setCaptchaInfo] = useState({ question: '', cc: '', exp: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [isCaptchaRequired, setIsCaptchaRequired] = useState(false);
  const [pageLoadedAt, setPageLoadedAt] = useState(0);

  // src/pages/QuoteBoard.jsx 상단 state 정의 부분
  const [formData, setFormData] = useState({
    company: '', 
    name: '', 
    phone: '', 
    email: '', 
    title: '', 
    content: '', 
    isSecret: true, 
    password: '',
    privacyAgreement: false, // 🔥 [추가] 초기값은 체크 해제 상태
    email_confirm: '' // honeyPot 대신 email_confirm 선언
  });

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/quotes`);
      setBoardList(response.data);
    } catch (error) {
      console.error('견적 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { setActiveTab(initialTab); handleBackToList(); }, [initialTab]);
  useEffect(() => { if (activeTab === 'list') fetchQuotes(); }, [activeTab]);
  // 글쓰기 탭 진입 순간 타임스탬프 찍기
  // 탭 진입 시 시간 기록
  useEffect(() => {
    if (activeTab === 'write') {
      setPageLoadedAt(Date.now());
      setIsCaptchaRequired(false);
      setCaptchaInput('');
    }
  }, [activeTab]);

  // 2. API 호출 함수 수정
  const fetchCaptcha = async () => {
    try {
      const res = await axios.get(`${API_URL}/quotes/captcha`);
      setCaptchaInfo({ 
        question: res.data.question, 
        cc: res.data.cc, 
        exp: res.data.exp 
      });
      setIsCaptchaRequired(true);
    } catch (err) {
      console.error('인증 코드 로드 실패', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBackToList = () => {
    setSelectedQuote(null);
    setIsEditMode(false);
    setAdminReplyInput('');
    setPasswordInput('');
  };

  // 🎯 글 클릭 시 이벤트 처리 핸들러
  const handleRowClick = async (post) => {
    if (isLoggedIn) {
      // 👑 관리자는 암호 무시하고 바로 디테일 호출
      try {
        const res = await axios.get(`${API_URL}/quotes/${post.id}`);
        setSelectedQuote(res.data);
        setAdminReplyInput(res.data.reply || '');
      } catch (err) { alert('데이터를 불러오지 못했습니다.'); }
    } else if (post.isSecret) {
      // 🔒 비밀글인 경우 암호 검증 모달 오픈
      setPendingQuoteId(post.id);
      setShowPasswordModal(true);
    } else {
      // 🔓 공개글은 바로 상세 오픈
      try {
        const res = await axios.get(`${API_URL}/quotes/${post.id}`);
        setSelectedQuote(res.data);
      } catch (err) { alert('데이터를 불러오지 못했습니다.'); }
    }
  };

  // 🔑 비밀번호 검증 요청
  const handlePasswordVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/quotes/${pendingQuoteId}/verify`, { password: passwordInput });
      setSelectedQuote(res.data);
      setShowPasswordModal(false);
    } catch (err) {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  // 3. handleSubmit 전송 부분 데이터 매핑 수정
  // 3. handleSubmit 전송 및 에러 처리부 매핑 수정
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.privacyAgreement) {
      alert('개인정보 수집 및 이용에 동의하셔야 견적 문의 접수가 가능합니다.');
      return;
    }

    try {
      const payload = {
        ...formData,
        plt: pageLoadedAt, // pageLoadedAt -> plt
        ans: captchaInput, // captchaAnswer -> ans
        cc: captchaInfo.cc, // captchaHash -> cc
        exp: captchaInfo.exp // captchaExpiry -> exp
      };

      await axios.post(`${API_URL}/quotes`, payload);
      alert('견적 문의가 정상적으로 접수되었습니다.');
      setFormData({ company: '', name: '', phone: '', email: '', title: '', content: '', isSecret: true, password: '', privacyAgreement: false, email_confirm: '' });
      setActiveTab('list');
    } catch (error) {
      // 백엔드 시그널 매칭
      if (error.response && error.response.status === 403 && error.response.data.message === 'CAPTCHA_REQUIRED') {
        alert('보안 검증이 필요합니다. 아래에 나타난 자동 등록 방지 코드를 입력해 주세요.');
        fetchCaptcha();
      } else {
        alert(error.response?.data?.message || '접수 실패');
      }
    }
  };

  // ✍️ 작성자 글 수정 제출
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/quotes/${selectedQuote.id}`, selectedQuote);
      alert('문의 내용이 수정되었습니다.');
      setSelectedQuote(res.data);
      setIsEditMode(false);
    } catch (err) {
      alert('수정에 실패했습니다. 비밀번호를 다시 확인해 주세요.');
    }
  };

  // 👑 관리자 답변 등록 제출
  const handleAdminReplySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/quotes/${selectedQuote.id}/reply`, { reply: adminReplyInput });
      alert('답변이 등록되었습니다.');
      setSelectedQuote(res.data);
    } catch (err) {
      alert('답변 등록 실패');
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        
        {/* 페이지 헤더 */}
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-950">견적문의</h1>
          <p className="text-xs text-neutral-400">다온씨엔이는 고객님의 성공적인 비즈니스를 위한 최적의 솔루션을 제안합니다.</p>
        </div>

        {/* 대시보드가 열려있지 않은 상태일 때만 상단 탭 노출 */}
        {!selectedQuote && (
          <div className="flex border-b border-neutral-200 mb-8">
            <button onClick={() => setActiveTab('list')} className={`py-3 px-6 text-sm font-medium transition-all border-b-2 ${activeTab === 'list' ? 'border-neutral-950 text-neutral-950 font-bold' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>문의 목록</button>
            <button onClick={() => setActiveTab('write')} className={`py-3 px-6 text-sm font-medium transition-all border-b-2 ${activeTab === 'write' ? 'border-neutral-950 text-neutral-950 font-bold' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>문의하기</button>
          </div>
        )}

        {/* 📋 상태 1: 리스트화면 */}
        {!selectedQuote && activeTab === 'list' && (
          <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-400 font-medium text-xs border-b border-neutral-200">
                  <th className="py-4 px-6 w-16 text-center">번호</th>
                  <th className="py-4 px-6">제목</th>
                  <th className="py-4 px-6 w-24 text-center">작성자</th>
                  <th className="py-4 px-6 w-28 text-center">등록일</th>
                  <th className="py-4 px-6 w-24 text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {isLoading ? (
                  <tr><td colSpan="5" className="py-12 text-center text-neutral-400 text-xs">로딩 중...</td></tr>
                ) : boardList.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-neutral-400 text-xs">등록된 내역이 없습니다.</td></tr>
                ) : (
                  boardList.map((post) => (
                    <tr key={post.id} className="hover:bg-neutral-50/50 cursor-pointer transition-colors" onClick={() => handleRowClick(post)}>
                      <td className="py-4 px-6 text-center text-neutral-400 text-xs">{post.id}</td>
                      <td className="py-4 px-6 font-medium text-neutral-900">
                        <div className="flex items-center gap-2">
                          {post.isSecret && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-neutral-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                          )}
                          <span className="truncate">{post.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-xs text-neutral-500">{post.name?.charAt(0) + '*'}</td>
                      <td className="py-4 px-6 text-center text-xs text-neutral-400">{post.createdAt?.split('T')[0]}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${post.status === '답변완료' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}>{post.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 🔍 상태 2: 상세 보기 화면 (수정 모드 분기 포함) */}
        {selectedQuote && (
          <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <button onClick={handleBackToList} className="text-xs font-semibold text-neutral-400 hover:text-neutral-900 flex items-center gap-1">← 목록으로 가기</button>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${selectedQuote.status === '답변완료' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}>{selectedQuote.status}</span>
            </div>

            {!isEditMode ? (
              // 👁️ 2-A: 일반 읽기 전용 뷰
              <div className="space-y-6">
                <div>
                  <span className="text-xs text-neutral-400 font-medium">{selectedQuote.company || '개인 방문자'} — {selectedQuote.name} 고객님</span>
                  <h2 className="text-xl font-bold text-neutral-900 mt-1">{selectedQuote.title}</h2>
                  <p className="text-[11px] text-neutral-300 mt-0.5">등록일: {selectedQuote.createdAt?.replace('T', ' ').slice(0, 16)}</p>
                </div>
                
                {/* 연락처 보안 노출 권한 피드 */}
                {(isLoggedIn || selectedQuote.phone) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-neutral-50 p-4 rounded-xl text-xs text-neutral-600">
                    <div><strong>연락처:</strong> {selectedQuote.phone}</div>
                    <div><strong>이메일:</strong> {selectedQuote.email}</div>
                  </div>
                )}

                <div className="text-sm text-neutral-800 leading-relaxed min-h-[150px] whitespace-pre-wrap pt-2">
                  {selectedQuote.content}
                </div>

                {/* 📝 일반 고객용 수정 버튼 단락 */}
                {!isLoggedIn && (
                  <div className="flex justify-end pt-4 border-t border-neutral-100">
                    <button onClick={() => setIsEditMode(true)} className="text-xs font-bold border border-neutral-200 bg-white px-4 py-2 rounded-xl hover:bg-neutral-50 transition-all text-neutral-700">정보 수정하기</button>
                  </div>
                )}
              </div>
            ) : (
              // ✏️ 2-B: 작성자 내용 수정 폼 뷰
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-neutral-400 mb-1">작성자 성함</label><input type="text" required className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5" value={selectedQuote.name} onChange={(e) => setSelectedQuote({...selectedQuote, name: e.target.value})} /></div>
                  <div><label className="block text-xs font-semibold text-neutral-400 mb-1">연락처</label><input type="text" required className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5" value={selectedQuote.phone} onChange={(e) => setSelectedQuote({...selectedQuote, phone: e.target.value})} /></div>
                </div>
                <div><label className="block text-xs font-semibold text-neutral-400 mb-1">문의 제목</label><input type="text" required className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5" value={selectedQuote.title} onChange={(e) => setSelectedQuote({...selectedQuote, title: e.target.value})} /></div>
                <div><label className="block text-xs font-semibold text-neutral-400 mb-1">상세 내역</label><textarea required rows={5} className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5 resize-none" value={selectedQuote.content} onChange={(e) => setSelectedQuote({...selectedQuote, content: e.target.value})} /></div>
                <div><label className="block text-xs font-semibold text-neutral-400 mb-1">본인 인증 비밀번호 재확인</label><input type="password" required placeholder="기존 글 비밀번호를 입력하세요." className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-2.5" value={selectedQuote.password || ''} onChange={(e) => setSelectedQuote({...selectedQuote, password: e.target.value})} /></div>
                <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsEditMode(false)} className="text-xs border px-4 py-2 rounded-xl">취소</button><button type="submit" className="text-xs bg-neutral-950 text-white font-bold px-4 py-2 rounded-xl">수정 완료</button></div>
              </form>
            )}

            {/* 💬 답변 디스플레이 및 입력 영역 분기 */}
            <div className="mt-8 pt-6 border-t border-neutral-200 space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">상담 답변 내역</h3>
              
              {/* 답변 완료 상태일 때 노출 블록 */}
              {selectedQuote.reply && !isLoggedIn && (
                <div className="bg-neutral-950 text-neutral-100 p-5 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold"><span>DAON CNE 대외협력팀</span><span>{selectedQuote.replyAt?.split('T')[0]}</span></div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedQuote.reply}</p>
                </div>
              )}

              {/* 답변이 아직 없는 대기 상태일 때 고객 전용 노출문 */}
              {!selectedQuote.reply && !isLoggedIn && <p className="text-xs text-neutral-400 italic">담당 부서에서 문의 사항을 확인하고 있습니다. 서류 검토 후 빠르게 답변해 드리겠습니다.</p>}

              {/* 👑 관리자 권한 전용: 실시간 답변 편집창 폼 활성화 */}
              {isLoggedIn && (
                <form onSubmit={handleAdminReplySubmit} className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/40">
                  <label className="block text-xs font-bold text-neutral-600">관리자 전용 공식 코멘트 주입</label>
                  <textarea rows={4} className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:outline-none resize-none bg-white" placeholder="이곳에 기재한 답변 내용이 실시간으로 고객 비밀글에 표시되며, 상태값이 자동으로 '답변완료'로 셋업됩니다. 공백으로 제출 시 접수대기로 변경됩니다." value={adminReplyInput} onChange={(e) => setAdminReplyInput(e.target.value)} />
                  <div className="flex justify-end"><button type="submit" className="text-xs font-bold text-white bg-neutral-950 px-4 py-2 rounded-xl hover:bg-neutral-800">공식 답변 등록/수정</button></div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ✍️ 상태 3: 문의하기 신규 글 작성 화면 */}
        {!selectedQuote && activeTab === 'write' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-neutral-400 mb-2">회사명 / 기관명</label><input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="주식회사 다온" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3" /></div>
              <div><label className="block text-xs font-semibold text-neutral-400 mb-2">작성자 성함 *</label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="홍길동" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3" /></div>
              <div><label className="block text-xs font-semibold text-neutral-400 mb-2">연락처 *</label><input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="010-0000-0000" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3" /></div>
              <div><label className="block text-xs font-semibold text-neutral-400 mb-2">이메일 주소 *</label><input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="example@daoncne.com" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3" /></div>
            </div>
            <div><label className="block text-xs font-semibold text-neutral-400 mb-2">문의 제목 *</label><input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="문의 사항 핵심 제목" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3" /></div>
            <div><label className="block text-xs font-semibold text-neutral-400 mb-2">상세 내역 기재 *</label><textarea name="content" required rows={6} value={formData.content} onChange={handleInputChange} placeholder="필요 장비, 공사 종류 등 상세 기재" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 resize-none" /></div>

            {/* 1. 🍯 허니팟 필드 (사람 눈에는 완벽히 숨김 처리, 로봇 유인용) */}
            {/* 숨김 처리된 허니팟 인풋 이름 변경 */}
            <div className="hidden" aria-hidden="true">
              <input 
                type="text" 
                name="email_confirm" // 🛡️ 변장 완료
                value={formData.email_confirm} 
                onChange={handleInputChange} 
                tabIndex="-1" 
                autoComplete="off" 
              />
            </div>
            
            {/* 🔒 [추가된 영역] 개인정보 수집 및 이용동의 박스 */}
            <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200/60 text-xs text-neutral-600">
              <p className="font-bold text-neutral-800">[필수] 개인정보 수집 및 이용 동의</p>
              <div className="h-20 overflow-y-auto bg-white p-3 rounded-lg border border-neutral-200 text-[11px] leading-relaxed text-neutral-500">
                주식회사 다온씨엔이는 고객님의 견적 상담 및 문의 사항 처리를 위해 아래와 같이 개인정보를 수집하고 있습니다.<br />
                • 수집 및 이용 항목: 회사명/기관명, 작성자 성함, 연락처, 이메일 주소<br />
                • 수집 및 이용 목적: 견적 문의 내역 검토, 맞춤 상담 제공 및 결과 회신<br />
                • 보유 및 이용 기간: <strong>문의 처리 완료 후 3년간 보관</strong> (고객 응대 및 이력 관리를 위함이며, 법령에 따른 보유 기간 외에는 즉시 파기됩니다.)
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="privacyAgreement" 
                  name="privacyAgreement" 
                  checked={formData.privacyAgreement} 
                  onChange={handleInputChange} 
                  className="w-4 h-4 accent-neutral-950 cursor-pointer"
                />
                <label htmlFor="privacyAgreement" className="font-medium text-neutral-700 cursor-pointer select-none">
                  개인정보 수집 및 이용약관에 동의합니다.
                </label>
              </div>
            </div>

            {/* 2. 🤖 조건부 자동 등록 방지 인증 (isCaptchaRequired 가 true 일 때만 렌더링) */}
            {isCaptchaRequired && (
              <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-200/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-blue-950">보안 인증 추가 *</p>
                  <p className="text-[11px] text-neutral-400">빠른 작성 속도로 인해 일시적 제한이 걸렸습니다. 사칙연산을 풀어주세요.</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="bg-neutral-900 text-neutral-100 font-mono font-bold text-sm px-4 py-2.5 rounded-xl min-w-[85px] text-center select-none shadow-inner">
                    {captchaInfo.question || '로드 중...'}
                  </div>
                  <button type="button" onClick={fetchCaptcha} className="p-2.5 text-neutral-400 hover:text-neutral-600 border bg-white rounded-xl shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg></button>
                  <input type="text" required placeholder="정답" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} className="w-24 text-sm border border-blue-200 rounded-xl px-3 py-2.5 text-center font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white" />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2"><input type="checkbox" id="isSecret" name="isSecret" checked={formData.isSecret} onChange={handleInputChange} className="w-4 h-4 accent-neutral-950" /><label htmlFor="isSecret" className="text-xs font-medium text-neutral-600">비밀글로 안전하게 보관 (추천)</label></div>
              {formData.isSecret && <input type="password" name="password" required={formData.isSecret} value={formData.password} onChange={handleInputChange} placeholder="비밀번호 설정 (4자리 이상)" className="w-full sm:w-52 text-xs border border-neutral-200 rounded-xl px-4 py-2.5" />}
            </div>
            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setActiveTab('list')} className="text-xs text-neutral-500 border bg-white px-5 py-3 rounded-xl">취소</button><button type="submit" className="text-xs font-bold text-white bg-neutral-950 px-6 py-3 rounded-xl shadow-sm">작성 완료하기</button></div>
          </form>
        )}

      </div>

      {/* 🔑 하위 오버레이 레이어: 비밀번호 확인용 라이트박스 모달 팝업 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 border border-neutral-200 shadow-2xl space-y-4 animate-scaleUp">
            <div><h4 className="font-bold text-neutral-900 text-base">비밀글 인증 패널</h4><p className="text-xs text-neutral-400 mt-0.5">글 작성 시 입력했던 본인확인용 비밀번호를 입력하세요.</p></div>
            <form onSubmit={handlePasswordVerify} className="space-y-3">
              <input type="password" required autofocus className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-900" placeholder="비밀번호 4자리 입력" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
              <div className="flex gap-2"><button type="button" onClick={() => { setShowPasswordModal(false); setPasswordInput(''); }} className="flex-1 text-xs font-medium text-neutral-500 border border-neutral-100 py-3 rounded-xl hover:bg-neutral-50">닫기</button><button type="submit" className="flex-1 text-xs font-bold text-white bg-neutral-950 py-3 rounded-xl hover:bg-neutral-800">본인 확인 완료</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteBoard;