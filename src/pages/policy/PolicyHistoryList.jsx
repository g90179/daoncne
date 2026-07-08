// daon-frontend/src/pages/PolicyHistoryList.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';

const PolicyHistoryList = () => {
  const location = useLocation();
  const [filterType, setFilterType] = useState(location.state?.defaultFilter || 'ALL');
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const targetQuery = filterType === 'ALL' ? '' : `?type=${filterType}`;
        const res = await axios.get(`${API_URL}/policies${targetQuery}`);
        setHistoryList(res.data);
      } catch (e) {
        setHistoryList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [filterType]);

  return (
    <div className="w-full bg-slate-50 min-h-screen text-neutral-900 font-sans antialiased pt-32 pb-20 px-4 md:px-10">
      <div className="max-w-5xl mx-auto space-y-8 text-left">
        
        {/* 헤드 섹션 */}
        <div className="space-y-2">
          <Link to="/policy" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline">
            ← 현재 공식 공시 규정으로 돌아가기
          </Link>
          <h2 className="text-2xl font-black text-[oklch(0.38_0.07_259.56)] tracking-tight">약관 개정 이력 아카이브</h2>
          <p className="text-xs text-neutral-400 font-medium">다온씨엔이의 투명한 운영을 위해 기록된 법적 약관의 전체 히스토리 보드입니다.</p>
        </div>

        {/* 필터 세그먼트 바 */}
        <div className="bg-slate-200/50 p-1.5 rounded-2xl border border-white/60 flex gap-1 shadow-inner w-full sm:w-auto inline-flex">
          {[ ['ALL', '전체 히스토리'], ['PRIVACY', '개인정보처리방침'], ['TERMS', '서비스 이용약관'] ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                filterType === key
                  ? 'bg-blue-400 text-white shadow-md scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 리스트 카드 존 */}
        {loading ? (
          <div className="py-20 text-center text-neutral-400 text-xs font-medium">이력 데이터 분석 중...</div>
        ) : historyList.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-neutral-200/50 p-20 text-center text-neutral-400 text-xs font-medium">
            기록된 히스토리 자료가 존재하지 않습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {historyList.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-[1.8rem] border border-neutral-200/50 hover:border-blue-300 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.005)] flex items-center justify-between gap-6">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                      p.type === 'PRIVACY' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
                    }`}>
                      {p.type === 'PRIVACY' ? '개인정보' : '이용약관'}
                    </span>
                    {p.isExposed && (
                      <span className="text-[9px] font-black bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded-md animate-pulse">
                        현재 공식 노출중
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-neutral-800 truncate">{p.title}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono font-medium">
                    <span>공고일: {p.createdAt?.slice(0, 10)}</span>
                    <span>•</span>
                    <span className="text-blue-500 font-semibold">시행일: {p.effectiveDate?.slice(0, 10)}</span>
                  </div>
                </div>

                <Link
                  to={`/policy/history/${p.id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="shrink-0 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-500 hover:text-white border border-neutral-200/60 hover:border-blue-500 text-neutral-600 transition-all cursor-pointer whitespace-nowrap"
                >
                  원본 본문 보기 →
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default PolicyHistoryList;