// daon-frontend\src\pages\admin\ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestLink = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setIsSent(true);
    } catch (err) {
      alert(err.response?.data?.message || '링크 발송 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center p-6 font-sans">
      <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.03)] border border-white/70 max-w-md w-full text-center space-y-6">
        <div>
          <span className="text-3xl">🔐</span>
          <h2 className="text-xl font-bold text-[oklch(0.38_0.07_259.56)] mt-3">비밀번호 찾기</h2>
          <p className="text-xs text-slate-400 mt-1">등록하신 이메일로 인증 링크를 발송합니다.</p>
        </div>

        {!isSent ? (
          <form onSubmit={handleRequestLink} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">이메일 주소</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ex) admin@daoncne.com" 
                className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/5 transition-all duration-300"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-blue-400/20 transition-all active:scale-95 cursor-pointer disabled:bg-slate-300"
            >
              {isLoading ? '인증 메일 전송 중...' : '비밀번호 찾기 링크 전송'}
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-600 font-medium leading-relaxed">
              📩 입력하신 이메일로 <strong>인스턴스 키</strong>와 변경 링크를 발송했습니다. 5분 이내에 이메일의 링크를 열어 변경 작업을 마감해 주세요.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;