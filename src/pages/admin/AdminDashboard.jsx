// daon-frontend/src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosOriginal from 'axios';
import AdminPostEditor from '../../components/AdminPostEditor';
import AdminPostList from '../../components/AdminPostList';
import MainSlideAdmin from './MainSlideAdmin';
import { API_URL } from '../../config';

// 🔑 [신규 추가] 대한민국 전화번호 하이픈 자동 포맷터 (02 서울 특수 규격 예외처리 포함)
const formatPhone = (num) => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, ''); // 숫자만 남기기
  if (cleaned.startsWith('02')) {
    return cleaned.replace(/^(\d{2})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  }
  return cleaned.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
};

// 🔑 [신규 추가] 사업자등록번호 포맷터 (3자리-2자리-5자리 국룰 매핑)
const formatBizNumber = (num) => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, '');
  return cleaned.replace(/^(\d{3})(\d{2})(\d{5})$/, '$1-$2-$3');
};

const DEBUG_ALLOWED_EMAIL = 'hello.g901@kakao.com';

const AdminDashboard = ({ 
  isLoggedIn, 
  handleLogout, 
  loggedInEmail, 
  isMapScriptLoaded, 
  posts, 
  fetchPosts, 
  activeTab, 
  setActiveTab,
  fetchGlobalCompanyInfo
}) => {
  // ... (기존 State 및 로직 상단부 동일)

  return (
    <div className="flex bg-slate-50 min-h-screen w-full relative">
      {/* 사이드바 생략 ... */}

      <main className="flex-1 p-12 relative overflow-x-hidden">
        {/* 콘텐츠 관리 뷰 생략 ... */}

        {/* 🎬 메인 슬라이드 관리 뷰 생략 ... */}

        {/* 👤 계정 관리 뷰 */}
        {adminView === 'users' && (
          <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
            <h1 className="text-3xl font-black text-slate-800">계정 관리</h1>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              <div className="xl:col-span-5">
                {editingUser ? (
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-blue-100 space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b pb-2"><h3 className="font-black text-slate-800 text-sm">🛠️ 계정 정보 수정</h3><button onClick={() => setEditingUser(null)} className="text-xs text-slate-400 font-bold">취소</button></div>
                    <input type="text" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                    <input type="text" placeholder="이름 (별명)" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={editName} onChange={e => setEditName(e.target.value)} />
                    <input type="password" placeholder="새 비밀번호 (기존 유지 시 공백)" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
                    
                    {/* 🔑 [인풋 마스킹] 수정 모드 전화번호 입력창 */}
                    <input 
                      type="text" 
                      placeholder="연락처"
                      className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none font-mono" 
                      value={formatPhone(editPhone)} 
                      onChange={e => setEditPhone(e.target.value.replace(/\D/g, ''))} 
                    />
                    
                    <select className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={editRole} onChange={e => setEditRole(e.target.value)}>
                      <option value="일반 관리자">일반 관리자</option><option value="최고 관리자">최고 관리자</option>
                    </select>
                    <button onClick={handleUpdateUser} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold">변경 저장</button>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border space-y-4">
                    <h3 className="font-black text-slate-800 text-sm border-b pb-2">👤 신규 계정 등록</h3>
                    <input type="text" placeholder="이메일 주소" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                    <input type="password" placeholder="비밀번호" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <input type="text" placeholder="이름 (별명)" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                    
                    {/* 🔑 [인풋 마스킹] 생성 모드 전화번호 입력창 */}
                    <input 
                      type="text" 
                      placeholder="연락처"
                      className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none font-mono" 
                      value={formatPhone(newUserPhone)} 
                      onChange={e => setNewUserPhone(e.target.value.replace(/\D/g, ''))} 
                    />
                    
                    <select className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={newUserRole} onChange={e => setNewRole(e.target.value)}>
                      <option value="일반 관리자">일반 관리자</option><option value="최고 관리자">최고 관리자</option>
                    </select>
                    <button onClick={handleCreateUser} className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold">생성하기</button>
                  </div>
                )}
              </div>
              <div className="xl:col-span-7">
                <div className="bg-white rounded-[2rem] shadow-xl border overflow-hidden">
                  <div className="divide-y h-[560px] overflow-y-auto custom-scrollbar">
                    {users.map(u => (
                      <div key={u.id} className="p-6 flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{u.name ? `${u.name} [${u.email}]` : u.email}</p>
                          {/* 🔑 [출력 포맷팅] 리스트에 뿌려줄 때 formatPhone 적용 */}
                          <p className="text-xs text-slate-400 mt-0.5">{formatPhone(u.phone) || '연락처 없음'} — <span className="text-orange-500 font-bold">{u.role}</span></p>
                        </div>
                        <div className="flex gap-4 text-xs font-bold">
                          <button onClick={() => { setEditingUser(u); setEditEmail(u.email); setEditName(u.name || ''); setEditPhone(u.phone || ''); setEditRole(u.role || '일반 관리자'); }} className="text-blue-500">수정</button>
                          <button onClick={async () => { if(confirm('삭제하시겠습니까?')) { await axiosInstance.delete(`/users/${u.id}`); fetchUsers(); } }} className="text-red-400">삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🏢 회사 정보 관리 뷰 */}
        {adminView === 'company' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div><h1 className="text-3xl font-black text-slate-800 tracking-tighter">회사 정보 관리</h1></div>
              {isSuperAdmin && <button onClick={() => { setShowDebugPanel(!showDebugPanel); runDiagnostics(); }} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">🚨 카카오맵 자가진단기 {showDebugPanel ? '닫기' : '켜기'}</button>}
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="회사명" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                <input type="text" placeholder="대표자명" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={ceoName} onChange={e => setCeoName(e.target.value)} />
                
                {/* 🔑 [인풋 마스킹] 회사 사업자등록번호 입력창 */}
                <input 
                  type="text" 
                  placeholder="사업자 번호" 
                  className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none font-mono" 
                  value={formatBizNumber(bizNumber)} 
                  onChange={e => setBizNumber(e.target.value.replace(/\D/g, ''))} 
                />
                
                {/* 🔑 [인풋 마스킹] 회사 대표전화 입력창 */}
                <input 
                  type="text" 
                  placeholder="대표 전화" 
                  className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none font-mono" 
                  value={formatPhone(phone)} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                />
                
                <input type="text" placeholder="이메일" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} />
                <input type="text" placeholder="팩스 번호" className="w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={faxNumber} onChange={e => setFaxNumber(e.target.value)} />
                <div className="md:col-span-2 flex gap-3">
                  <input type="text" readOnly placeholder="도로명 주소" className="flex-1 px-5 py-3 bg-gray-50 border rounded-2xl" value={address} />
                  <button onClick={handleAddressSearch} className="px-5 bg-slate-800 text-white rounded-2xl text-xs font-bold">주소 검색</button>
                </div>
                <input type="text" placeholder="상세 주소" className="md:col-span-2 w-full px-5 py-3 bg-gray-50 border rounded-2xl outline-none" value={addressDetail} onChange={e => setAddressDetail(e.target.value)} />
                <div className="md:col-span-2 pt-2">
                  <div id="admin-map" className="w-full h-64 bg-slate-100 rounded-2xl border shadow-inner relative z-10" />
                </div>
              </div>
              <div className="flex justify-end border-t pt-4"><button onClick={handleSaveCompanyInfo} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md">정보 수정하기</button></div>
            </div>
          </div>
        )}
      </main>
      {/* 자가진단 패널 생략 ... */}
    </div>
  );
};

export default AdminDashboard;