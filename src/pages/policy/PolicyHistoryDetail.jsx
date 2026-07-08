// daon-frontend/src/pages/PolicyHistoryDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';

const PolicyHistoryDetail = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // 단건 조회를 위해 기존 policies에 쿼리를 날리거나 컨트롤러 단건 엔드포인트를 호출합니다.
        const res = await axios.get(`${API_URL}/policies`);
        const target = res.data.find(p => p.id === parseInt(id));
        setDoc(target);
      } catch (e) {
        setDoc(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="py-40 text-center text-xs font-medium text-neutral-400">보안 아카이브 해독 중...</div>;
  if (!doc) return <div className="py-40 text-center text-xs font-medium text-neutral-400">삭제되었거나 유효하지 않은 약관 문서 코드입니다.</div>;

  return (
    <div className="w-full bg-slate-50 min-h-screen text-neutral-900 font-sans antialiased pt-32 pb-20 px-4 md:px-10">
      <div className="max-w-4xl mx-auto space-y-6 text-left">
        
        <Link to="/policy/history" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-neutral-700">
          ← 히스토리 아카이브 목록으로 복귀
        </Link>

        {/* ⚠️ 과거 기록 보존 안내 배너 */}
        {!doc.isExposed && (
          <div className="bg-amber-50 border border-amber-200/70 p-4 rounded-2xl text-amber-700 text-xs font-semibold flex items-center gap-2">
            <span>💡</span>
            <span>이 문서는 현재 효력이 상실된 <strong>[과거 누적 기록 보존 데이터]</strong>입니다. 현재 적용 중인 방침은 공식 규정 페이지를 참조하세요.</span>
          </div>
        )}

        {/* 정보 명세 헤드 보드 */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-neutral-200/50 shadow-sm space-y-2">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md inline-block ${
            doc.type === 'PRIVACY' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
          }`}>
            {doc.type === 'PRIVACY' ? '개인정보처리방침' : '서비스 이용약관'}
          </span>
          <h1 className="text-xl md:text-2xl font-black text-neutral-800 tracking-tight">{doc.title}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-[11px] text-neutral-400 font-mono font-medium border-t border-neutral-100">
            <div>공고일자: <span className="text-neutral-800 font-bold">{doc.createdAt?.slice(0, 10)}</span></div>
            <div>최종 변경: <span className="text-neutral-800 font-bold">{doc.updatedAt?.slice(0, 10)}</span></div>
            <div>법적 시행일: <span className="text-blue-500 font-bold">{doc.effectiveDate?.slice(0, 10)}</span></div>
            <div>공식 지위: <span className={doc.isExposed ? 'text-emerald-500 font-bold' : 'text-neutral-400'}>{doc.isExposed ? '공식 노출중' : '효력 만료'}</span></div>
          </div>
        </div>

        {/* 실질 본문 렌더링 보드 */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-neutral-200/50 shadow-sm">
          <article 
            className="w-full max-w-none text-neutral-700 font-sans text-sm focus:outline-none"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </div>

      </div>
    </div>
  );
};

export default PolicyHistoryDetail;