// daon-frontend/src/components/VisitorTracker.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

// ✨ referrer URL을 분석해서 유입 출처와 검색 키워드를 추출
const parseReferral = () => {
  const referrer = document.referrer;
  const currentUrl = new URL(window.location.href);

  // 1순위: 현재 URL 자체에 붙은 UTM 파라미터 (광고/캠페인 링크로 들어온 경우)
  const utmSource = currentUrl.searchParams.get('utm_source');
  const utmTerm = currentUrl.searchParams.get('utm_term') || currentUrl.searchParams.get('utm_campaign');
  if (utmSource) {
    return { source: utmSource, keyword: utmTerm || null };
  }

  if (!referrer) {
    return { source: '직접 유입', keyword: null };
  }

  let refUrl;
  try {
    refUrl = new URL(referrer);
  } catch {
    return { source: '직접 유입', keyword: null };
  }

  // 같은 사이트 안에서의 이동은 유입 출처 정보로서 의미가 없으니 표시하지 않음
  if (refUrl.hostname === window.location.hostname) {
    return { source: '내부 이동', keyword: null };
  }

  const host = refUrl.hostname.replace(/^www\./, '');
  const params = refUrl.searchParams;

  if (host.includes('google')) return { source: 'Google', keyword: params.get('q') };
  if (host.includes('naver')) return { source: 'Naver', keyword: params.get('query') };
  if (host.includes('daum')) return { source: 'Daum', keyword: params.get('q') };
  if (host.includes('bing')) return { source: 'Bing', keyword: params.get('q') };
  if (host.includes('facebook')) return { source: 'Facebook', keyword: null };
  if (host.includes('instagram')) return { source: 'Instagram', keyword: null };
  if (host.includes('kakao') || host.includes('kakaocorp')) return { source: 'Kakao', keyword: null };

  return { source: host, keyword: null };
};

const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // ✨ [수정] 실제 관리자 경로(/admDashboard)를 정확히 제외
    if (location.pathname.startsWith('/admDashboard')) return;

    const referral = parseReferral();

    const recordVisit = async () => {
      try {
        await api.post('/visitors/log', {
          path: location.pathname + location.search,
          referrer: document.referrer || null,
          source: referral.source,
          keyword: referral.keyword,
        });
      } catch (err) {
        console.error('방문 기록 전송 실패', err);
      }
    };

    recordVisit();
  }, [location]);

  return null;
};

export default VisitorTracker;