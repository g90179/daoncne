// daon-frontend/functions/rss.js

export async function onRequest(context) {
  // 사용자가 /rss로 요청한 객체
  const { request } = context;
  
  // 목적지 백엔드 주소
  const targetUrl = "https://g90179.gabia.io/rss";
  
  // Host 헤더를 백엔드 도메인으로 변조 (가비아 404 차단 우회)
  const newHeaders = new Headers(request.headers);
  newHeaders.set("Host", "g90179.gabia.io");
  
  // 변조된 헤더를 담아 백엔드로 새 요청 전송
  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: newHeaders,
  });
  
  return fetch(newRequest);
}