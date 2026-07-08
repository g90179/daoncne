// daon-frontend\src\pages\admin\ResetPassword.jsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';

  const [instanceKey, setInstanceKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [robotToken, setRobotToken] = useState(''); // 견적문의 로봇 토큰 바인딩용

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('새 비밀번호가 서로 일치하지 않습니다.');
    
    // 🔑 2번 조건: 견적문의 검사 연동 분기
    // if (!robotToken) return alert('로봇 차단 검증을 완료해 주세요.');

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email, instanceKey, newPassword, robotToken
      });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      
      // 🔑 4번 조건: 메인 페이지로 이동하면서 로그인 팝업을 띄우라는 시그널(state)을 전송
      navigate('/', { state: { triggerLogin: true } });
    } catch (err) {
      alert(err.response?.data?.message || '비밀번호 변경 실패. 만료되었거나 틀린 키입니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center p-6 font-sans">
      <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.03)] border border-white/70 max-w-md w-full text-center space-y-5">
        <div>
          <span className="text-3xl">🔄</span>
          <h2 className="text-xl font-bold text-[oklch(0.38_0.07_259.56)] mt-3">비밀번호 변경 설정</h2>
          <p className="text-xs text-slate-400 mt-1">이메일로 수신된 8자리 인증키와 새 암호를 기입하세요.</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4 text-left">
          {/* 인스턴스 키 입력 필드 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">인스턴스 키 (8자리)</label>
            <input type="text" maxLength={8} required value={instanceKey} onChange={e => setInstanceKey(e.target.value)} placeholder="대소문자 숫자 조합" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3 text-sm text-[oklch(0.38_0.07_259.56)] font-mono outline-none focus:bg-white focus:border-blue-400 transition-all" />
          </div>

          {/* 새 비밀번호 입력 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">새로운 비밀번호</label>
            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="새 암호 입력" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3 text-sm text-[oklch(0.38_0.07_259.56)] outline-none focus:bg-white focus:border-blue-400 transition-all" />
          </div>

          {/* 새 비밀번호 확인 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">비밀번호 재확인</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="한번 더 입력" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3 text-sm text-[oklch(0.38_0.07_259.56)] outline-none focus:bg-white focus:border-blue-400 transition-all" />
          </div>

          {/* 🔑 2번 조건: 견적문의 도메인에 심어둔 로봇 차단 검사 로직 인터페이스 주입단 */}
          <div className="pt-1.5 border-t border-slate-100">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">보안 로봇 검증</label>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-xs">
              {/* 성현 님이 사용 중이신 견적문의 전용 캡차 컴포넌트 오브젝트를 이 자리에 매운 뒤 */}
              {/* 완료 시 setRobotToken(결과값)을 호출하도록 연동하시면 매끄럽게 결합됩니다. */}
              <span className="text-slate-400">[견적문의 페이지의 로봇 검사 컴포넌트 영역]</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-blue-400/20 transition-all active:scale-95 cursor-pointer"
          >
            비밀번호 변경 완료하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;