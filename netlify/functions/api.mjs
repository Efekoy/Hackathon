import worker from '../../dist/server/index.js';

// Reuse the tested translation API. The key stays in Netlify's function runtime.
export default async function handler(request, context = {}) {
  const headers = new Headers(request.headers);
  // Use the platform's client IP, never a caller-supplied Cloudflare header.
  headers.set('CF-Connecting-IP', context.ip || 'unknown');
  return worker.fetch(new Request(request, { headers }), {
    GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY,
  });
}

export const config = { path: '/api/*' };
