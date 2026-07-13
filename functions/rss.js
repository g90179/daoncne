export async function onRequest(context) {
  const targetUrl = "https://g90179.gabia.io/rss";
  
  // 기존 브라우저 헤더를 복사하지 않고, 가비아가 요구하는 핵심 헤더만 깔끔하게 생성
  const cleanRequest = new Request(targetUrl, {
    method: "GET",
    headers: {
      "Host": "g90179.gabia.io", // 나는 가비아 도메인이다 (변조)
      "Accept": "application/rss+xml, application/xml, text/xml, */*"
    }
  });
  
  // 백엔드로 요청 전송
  return fetch(cleanRequest);
}