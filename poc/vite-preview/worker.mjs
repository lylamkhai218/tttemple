// Limit the public prototype by Cloudflare's IP geolocation on every request.
export default {
  async fetch(request, env) {
    if (request.cf?.country !== 'VN') {
      return new Response('Bản thử chỉ dành cho kết nối có IP được xác định tại Việt Nam.', {
        status: 403,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
