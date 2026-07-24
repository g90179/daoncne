// daon-frontend/src/pages/admin/AdminVisitorLog.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';

const AdminVisitorLog = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  const fetchLogs = async (currentPage) => {
    try {
      const res = await api.get(`/visitors/admin?page=${currentPage}&limit=${LIMIT}`);
      setLogs(res.data.data);
      setTotalPages(Math.ceil(res.data.total / LIMIT));
    } catch (err) {
      console.error('방문자 통계 로드 실패', err);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">📊 방문자 분석 통계</h2>
          <p className="text-xs text-slate-400 mt-1">웹사이트 방문자의 IP, 유입 키워드 및 접속 환경을 실시간으로 확인합니다.</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">방문 시간</th>
                <th className="py-4 px-6">IP 주소</th>
                <th className="py-4 px-6">지역</th>
                <th className="py-4 px-6">유입 경로 / 키워드</th>
                <th className="py-4 px-6">방문 페이지</th>
                <th className="py-4 px-6">접속 기기 (User-Agent)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-slate-400">
                    기록된 방문자 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono whitespace-nowrap text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-700">{log.ip}</td>
                    <td className="py-4 px-6">{log.region}</td>
                    <td className="py-4 px-6 font-semibold text-blue-500">{log.keyword}</td>
                    <td className="py-4 px-6 font-mono text-slate-500">{log.path}</td>
                    <td className="py-4 px-6 truncate max-w-xs text-slate-400" title={log.device}>
                      {log.device}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="py-4 border-t border-slate-100 flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVisitorLog;