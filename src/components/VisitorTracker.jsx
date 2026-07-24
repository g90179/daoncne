// daon-frontend/src/components/VisitorTracker.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // 관리자 페이지나 특정 경로는 로깅에서 제외하고 싶다면 여기서 필터링 가능
    if (location.pathname.startsWith('/admin')) return;

    const recordVisit = async () => {
      try {
        await api.post('/visitors/log', { path: location.pathname + location.search });
      } catch (err) {
        // 백그라운드 로깅 실패 시 사용자 경험에 지장을 주지 않도록 조용히 처리
        console.error('방문 기록 전송 실패', err);
      }
    };

    recordVisit();
  }, [location]);

  return null;
};

export default VisitorTracker;