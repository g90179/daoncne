// daoncne.co.kr 정적 사이트 앞단 Worker.
// /rss.xml(과 검색엔진에 등록된 /rss)만 백엔드(api.daoncne.co.kr/rss)에서 받아 돌려주고, 나머지는 모두 정적 파일(ASSETS)로 처리한다.
// 예전 rss.daoncne.co.kr 주소는 서버(Caddy)에서 이 주소로 301 리다이렉트한다.
const RSS_SOURCE = 'https://api.daoncne.co.kr/rss';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/rss.xml' || url.pathname === '/rss') {
      const res = await fetch(RSS_SOURCE, { cf: { cacheTtl: 600, cacheEverything: true } });
      if (!res.ok) return new Response('RSS feed temporarily unavailable', { status: 502 });
      return new Response(res.body, {
        status: 200,
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=600',
        },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
