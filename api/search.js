export default async function handler(req, res) {
  const { q, n = '40' } = req.query;

  if (!q) {
    return res.status(400).json({ error: true, message: 'q 파라미터가 필요합니다.' });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: true,
      message: 'NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 환경변수가 설정되지 않았습니다. Vercel 프로젝트 설정에서 환경변수를 추가하세요.'
    });
  }

  const display = Math.min(Number(n) || 40, 100);
  const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(q)}&display=${display}&sort=sim`;

  try {
    const naverRes = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!naverRes.ok) {
      const text = await naverRes.text();
      return res.status(naverRes.status).json({ error: true, message: `네이버 API 오류: ${naverRes.status} - ${text}` });
    }

    const data = await naverRes.json();

    // 5분 CDN 캐시
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
}
