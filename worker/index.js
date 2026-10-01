// daoncne.co.kr 정적 사이트 앞단 Worker.
// RSS·사이트맵만 백엔드(api.daoncne.co.kr)에서 최신 내용으로 받아 돌려주고, 나머지는 정적 파일(ASSETS)로 처리한다.
// - /rss, /rss.xml  -> 백엔드 /rss (검색엔진에는 /rss 로 등록돼 있다)
// - /sitemap.xml    -> 백엔드 /sitemap.xml (포트폴리오 글 포함). 백엔드가 응답하지 않으면 정적 public/sitemap.xml
// 예전엔 별도 Worker(rss-proxy)가 이 경로들을 폐기된 가비아 서버로 넘겼다.
const API = 'https://api.daoncne.co.kr';
const FEEDS = {
  '/rss': { source: '/rss', type: 'application/rss+xml; charset=utf-8' },
  '/rss.xml': { source: '/rss', type: 'application/rss+xml; charset=utf-8' },
  '/sitemap.xml': { source: '/sitemap.xml', type: 'application/xml; charset=utf-8', fallbackToAsset: true },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const feed = FEEDS[url.pathname];
    if (feed) {
      try {
        const res = await fetch(`${API}${feed.source}`, { cf: { cacheTtl: 600, cacheEverything: true } });
        if (res.ok) {
          return new Response(res.body, {
            status: 200,
            headers: { 'Content-Type': feed.type, 'Cache-Control': 'public, max-age=600' },
          });
        }
      } catch { /* 아래 대체 응답 */ }
      if (feed.fallbackToAsset) return env.ASSETS.fetch(request);
      return new Response('Feed temporarily unavailable', { status: 502 });
    }
    return env.ASSETS.fetch(request);
  },
};
