import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const QuoteBoard = ({ initialTab = 'list' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [boardList, setBoardList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    company: '', name: '', phone: '', email: '', title: '', content: '', isSecret: true, password: ''
  });

  // 🔄 백엔드로부터 견적문의 목록 로드
  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/quotes`);
      setBoardList(response.data);
    } catch (error) {
      console.error('견적 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // 💡 탭이 'list'로 바뀌거나 컴포넌트 마운트 시 목록 리프레시
  useEffect(() => {
    if (activeTab === 'list') {
      fetchQuotes();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 🚀 백엔드로 견적문의 데이터 전송 (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/quotes`, formData);
      alert('견적 문의가 정상적으로 접수되었습니다.');
      
      // 상태 초기화 및 목록 탭으로 이동
      setFormData({ company: '', name: '', phone: '', email: '', title: '', content: '', isSecret: true, password: '' });
      setActiveTab('list');
    } catch (error) {
      console.error('견적 접수 중 오류 발생:', error);
      alert(error.response?.data?.message || '견적 접수에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const InfoRow = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="flex gap-2">
        <span className="text-neutral-400 shrink-0">{label}</span>
        <span className="text-neutral-600">{value}</span>
      </div>
    );
  };

  // 마스킹 처리용 헬퍼 함수
  const formatAuthor = (name) => {
    if (!name) return '방문자';
    if (name.length <= 2) return name.charAt(0) + '*';
    return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        
        {/* 페이지 헤더 */}
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-950">견적문의</h1>
          <p className="text-xs text-neutral-400">다온씨엔이는 고객님의 성공적인 비즈니스를 위한 최적의 솔루션을 제안합니다.</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-neutral-200 mb-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-6 text-sm font-medium tracking-wide transition-all border-b-2 ${
              activeTab === 'list' 
                ? 'border-neutral-950 text-neutral-950 font-bold' 
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            문의 목록
          </button>
          <button
            onClick={() => setActiveTab('write')}
            className={`py-3 px-6 text-sm font-medium tracking-wide transition-all border-b-2 ${
              activeTab === 'write' 
                ? 'border-neutral-950 text-neutral-950 font-bold' 
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            문의하기
          </button>
        </div>

        {/* 📋 1. 문의 목록 탭 */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
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
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-neutral-400 text-xs">데이터를 불러오는 중입니다...</td>
                    </tr>
                  ) : boardList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-neutral-400 text-xs">등록된 견적 문의가 없습니다.</td>
                    </tr>
                  ) : (
                    boardList.map((post) => (
                      <tr key={post.id} className="hover:bg-neutral-50/50 cursor-pointer transition-colors" onClick={() => alert('상세 보기 및 비밀번호 검증 모달 구현부')}>
                        <td className="py-4 px-6 text-center text-neutral-400 text-xs">{post.id}</td>
                        <td className="py-4 px-6 font-medium text-neutral-900">
                          <div className="flex items-center gap-2">
                            {post.isSecret && (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-neutral-400 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                              </svg>
                            )}
                            <span className="truncate">{post.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-xs text-neutral-500">{formatAuthor(post.name)}</td>
                        <td className="py-4 px-6 text-center text-xs text-neutral-400">{post.createdAt?.split('T')[0]}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            post.status === '답변완료' 
                              ? 'bg-neutral-900 text-white' 
                              : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ✍️ 2. 문의하기(글작성) 탭 */}
        {activeTab === 'write' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">회사명 / 기관명</label>
                <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="주식회사 다온" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">작성자 성함 *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="홍길동" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">연락처 *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="010-0000-0000" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">이메일 주소 *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="example@daoncne.com" className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">문의 제목 *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="문의 사항의 핵심 제목을 입력해주세요." className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">상세 내역 기재 *</label>
                <textarea name="content" required rows={6} value={formData.content} onChange={handleInputChange} placeholder="필요하신 장비, 공사 종류, 기간, 예산 등 상세 내용을 적어주시면 신속한 답변이 가능합니다." className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all resize-none" />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isSecret" name="isSecret" checked={formData.isSecret} onChange={handleInputChange} className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 border-neutral-300 accent-neutral-950" />
                <label htmlFor="isSecret" className="text-xs font-medium text-neutral-600 cursor-pointer">비밀글로 안전하게 보관 (추천)</label>
              </div>
              {formData.isSecret && (
                <div className="w-full sm:w-auto">
                  <input type="password" name="password" required={formData.isSecret} value={formData.password} onChange={handleInputChange} placeholder="글 비밀번호 설정 (4자리 이상)" className="w-full sm:w-52 text-xs border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setActiveTab('list')} className="text-xs font-medium text-neutral-500 border border-neutral-200 bg-white px-5 py-3 rounded-xl hover:bg-neutral-50 transition-all">취소</button>
              <button type="submit" className="text-xs font-bold text-white bg-neutral-950 px-6 py-3 rounded-xl hover:bg-neutral-800 transition-all shadow-sm">작성 완료하기</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default QuoteBoard;