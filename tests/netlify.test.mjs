import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { config } from '../netlify/functions/api.mjs';

test('Netlify routes the same-origin API and supports missing-key demo mode', async () => {
  const saved = process.env.GOOGLE_TRANSLATE_API_KEY;
  delete process.env.GOOGLE_TRANSLATE_API_KEY;
  try {
    assert.equal(config.path, '/api/*');
    const result = await handler(new Request('https://demo.netlify.app/api/languages'), { ip: '192.0.2.1' });
    assert.equal(result.status, 200);
    assert.deepEqual(await result.json(), { configured: false, languages: [] });
    assert.equal((await handler(new Request('https://demo.netlify.app/api/ui?target=fr'))).status, 503);
  } finally {
    if (saved === undefined) delete process.env.GOOGLE_TRANSLATE_API_KEY;
    else process.env.GOOGLE_TRANSLATE_API_KEY = saved;
  }
});

test('Netlify adapter preserves unknown-route, method and origin restrictions', async () => {
  assert.equal((await handler(new Request('https://demo.netlify.app/api/unknown'))).status, 404);
  assert.equal((await handler(new Request('https://demo.netlify.app/api/languages', { method: 'POST' }))).status, 405);
  assert.equal((await handler(new Request('https://demo.netlify.app/api/languages', { headers: { Origin: 'https://other.example' } }))).status, 403);
});
