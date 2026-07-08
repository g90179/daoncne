// daon-frontend/src/pages/admin/AdminUserAdmin.jsx
import React, { useState, useEffect } from 'react';
import axiosOriginal from 'axios';
import Pagination from '../../components/Pagination';
import { API_URL } from '../../config';

const formatPhone = (num) => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, '');
  if (cleaned.startsWith('02')) return cleaned.replace(/^(\d{2})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  return cleaned.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
};

const AdminUserAdmin = ({ loggedInEmail }) => {
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 5;

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewRole] = useState('일반 관리자');

  const [editingUser, setEditingUser] = useState(null); 
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');       
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('일반 관리자');

  const axiosInstance = axiosOriginal.create({ baseURL: API_URL });
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // 🔑 [완전 격리 해결] 대시보드 프롭스가 누락되더라도 로컬 스토리지에서 직접 계정을 꺼내오는 원천 필터 구축
  const currentRequestingEmail = loggedInEmail || localStorage.getItem('loggedInEmail') || '';

  const fetchUsers = async () => {
    try { 
      // 🔑 유동적으로 확보한 이메일 스냅샷을 백엔드 쿼리에 안전하게 바인딩합니다.
      const res = await axiosInstance.get(`/users?requestingEmail=${currentRequestingEmail}`); 
      setUsers(res.data); 
    } catch (e) {}
  };

  // 🔑 동기화 타겟을 currentRequestingEmail 변수로 변경하여 즉시 추적 리스닝 가동
  useEffect(() => { 
    fetchUsers(); 
  }, [currentRequestingEmail]);

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) { alert('이메일과 비밀번호를 입력해 주세요.'); return; }
    try {
      await axiosInstance.post('/users', { email: newEmail, password: newPassword, name: newUserName, phone: newUserPhone, role: newUserRole });
      alert('새로운 관리자 계정이 생성되었습니다.');
      setNewEmail(''); setNewPassword(''); setNewUserName(''); setNewUserPhone(''); setNewRole('일반 관리자');
      setUserPage(1);
      fetchUsers();
    } catch (e) { alert('계정 생성 실패'); }
  };

  const handleUpdateUser = async () => {
    if (!editEmail) { alert('이메일은 필수입니다.'); return; }
    try {
      await axiosInstance.patch(`/users/${editingUser.id}`, {
        email: editEmail, password: editPassword || undefined, name: editName, phone: editPhone, role: editRole
      });
      alert('계정 정보가 성공적으로 수정되었습니다.');
      setEditingUser(null); setEditPassword('');
      fetchUsers();
    } catch (e) { alert('계정 수정 중 오류가 발생했습니다.'); }
  };

  const totalUserPages = Math.ceil(users.length / USERS_PER_PAGE);
  const currentUsers = users.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

  return (
    <div className="max-w-12xl mx-auto animate-fadeIn">
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* 👈 좌측 배치: 마스터 계정 리스트 플랫 카드 */}
        <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.02)] border border-white/70 flex flex-col justify-between h-[760px] transition-all">
          
          <div className="border-b border-slate-100 pb-3 mb-2 px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              마스터 계정 대기열 ({users.length})
            </h3>
          </div>

          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 mb-4">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs font-medium space-y-2 py-20">
                <span className="text-2xl">👤</span>
                <span>등록된 마스터 관리자 계정이 존재하지 않습니다.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {currentUsers.map(u => (
                  <div key={u.id} className="group flex items-center justify-between py-4 px-1 hover:bg-slate-50/60 transition-all duration-200">
                    
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200/40 flex items-center justify-center shrink-0 shadow-inner">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {u.name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-[oklch(0.38_0.07_259.56)] truncate group-hover:text-blue-500 transition-colors">
                          {u.name ? `${u.name}` : '이름 없음'}
                          <span className="text-xs text-slate-400 font-mono font-normal ml-2 group-hover:text-slate-500 transition-colors">[{u.email}]</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium font-mono mt-1">
                          {formatPhone(u.phone) || '연락처 미등록'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center shrink-0 pl-4 gap-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition shadow-sm ${
                        u.role === '최고 관리자' 
                          ? 'bg-purple-50 text-purple-500 border border-purple-100' 
                          : 'bg-blue-50 text-blue-500 border border-blue-100'
                      }`}>
                        {u.role}
                      </span>

                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingUser(u); setEditEmail(u.email); setEditName(u.name || ''); setEditPhone(u.phone || ''); setEditRole(u.role || '일반 관리자'); }} className="cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all active:scale-95 whitespace-nowrap">수정</button>
                        
                        {u.email !== 'hello.g901@kakao.com' ? (
                          <button onClick={async () => { if(confirm('삭제하시겠습니까?')) { await axiosInstance.delete(`/users/${u.id}`); fetchUsers(); } }} className="cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all active:scale-95 whitespace-nowrap">삭제</button>
                        ) : (
                          /* 🛡️ 문구 대신 정교하게 설계된 퍼플 방패 배지 아이콘 장착 완료 */
                          <div 
                            className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-400 border border-purple-100/70 flex items-center justify-center shadow-sm select-none transition-all duration-300 hover:bg-purple-100/50" 
                            title="시스템 보호 계정 (삭제 불가)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100/60">
            <Pagination currentPage={userPage} totalPages={totalUserPages} onPageChange={setUserPage} />
          </div>
        </div>

        {/* 👉 우측 배치: 정보 변경 폼 에디터 */}
        <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.02)] border border-white/70 h-[760px] overflow-y-auto custom-scrollbar transition-all">
          {editingUser ? (
            <div className="space-y-5 text-left animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-[oklch(0.38_0.07_259.56)] tracking-tight">🛠️ 계정 세부 정보 수정</h3>
                <button onClick={() => setEditingUser(null)} className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer transition">변경 취소</button>
              </div>
              
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">로그인 이메일 계정 *</label>
                  <input type="text" readOnly={editingUser.email === 'hello.g901@kakao.com'} className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 transition-all disabled:opacity-70" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">관리자 실명 (별명)</label>
                  <input type="text" placeholder="이름을 입력하세요" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 transition-all" value={editName} onChange={e => setEditName(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">새 비밀번호 설정</label>
                  <input type="password" placeholder="기존 비밀번호를 유지하려면 공백으로 비워두세요" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 transition-all" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">담당자 비상 연락처</label>
                  <input type="text" placeholder="숫자만 입력" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-bold font-mono outline-none focus:bg-white focus:border-blue-400 transition-all" value={formatPhone(editPhone)} onChange={e => setEditPhone(e.target.value.replace(/\D/g, ''))} />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">대시보드 오퍼레이션 권한 등급</label>
                  <select disabled={editingUser.email === 'hello.g901@kakao.com'} className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all cursor-pointer" value={editRole} onChange={e => setEditRole(e.target.value)}>
                    <option value="일반 관리자">일반 관리자</option>
                    <option value="최고 관리자">최고 관리자</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/60">
                <button onClick={handleUpdateUser} className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-400/20 transition-all active:scale-95 cursor-pointer">
                  변경 사항 저장하기
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-left">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-[oklch(0.38_0.07_259.56)] tracking-tight">👤 신규 계정 인프라 등록</h3>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">로그인 이메일 주소 *</label>
                  <input type="text" placeholder="ex) master@daoncne.com" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/5 transition-all duration-300" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">접속 비밀번호 규격 *</label>
                  <input type="password" placeholder="안전한 비밀번호 기입" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 transition-all" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">관리자 실명 (별명)</label>
                  <input type="text" placeholder="ex) 홍길동 팀장" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-medium outline-none focus:bg-white focus:border-blue-400 transition-all" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">담당자 비상 연락처</label>
                  <input type="text" placeholder="숫자만 입력" className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-bold font-mono outline-none focus:bg-white focus:border-blue-400 transition-all" value={formatPhone(newUserPhone)} onChange={e => setNewUserPhone(e.target.value.replace(/\D/g, ''))} />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">대시보드 오퍼레이션 권한 등급</label>
                  <select className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl px-5 py-3.5 text-sm text-[oklch(0.38_0.07_259.56)] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all cursor-pointer" value={newUserRole} onChange={e => setNewRole(e.target.value)}>
                    <option value="일반 관리자">일반 관리자</option>
                    <option value="최고 관리자">최고 관리자</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/60">
                <button onClick={handleCreateUser} className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-400/20 transition-all active:scale-95 cursor-pointer">
                  새로운 관리자 계정 생성
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminUserAdmin;