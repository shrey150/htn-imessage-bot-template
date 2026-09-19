import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

// Contract test using the real compiled app and native Linq adapter.
// Random test signing material only. No Linq API calls or real messages.
const portable = readFileSync(new URL('../agent/channels/linq.ts', import.meta.url), 'utf8').includes('LINQ_ALLOWED_SENDERS');
test('production HTTP and Linq webhook boundaries', { timeout: 30_000, skip: !portable && 'Uses a managed Linq connector; test its own verifier separately' }, async (t) => {
  const port = await new Promise((resolve) => {
    const probe = createServer();
    probe.listen(0, '127.0.0.1', () => {
      const port = probe.address().port;
      probe.close(() => resolve(port));
    });
  });
  const key = randomBytes(32);
  const child = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', EVE_DEV: '', VERCEL: '', VERCEL_ENV: '',
      LINQ_API_KEY: 'synthetic-not-a-live-api-key', LINQ_WEBHOOK_SECRET: `whsec_${key.toString('base64')}`,
      LINQ_ALLOWED_SENDERS: '+14165550123' },
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  const base = `http://127.0.0.1:${port}`;
  const post = (body, headers = {}) => fetch(`${base}/eve/v1/linq`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body,
  });
  function sign(body, timestamp = Math.floor(Date.now() / 1000)) {
    const id = randomUUID();
    return { 'webhook-id': id, 'webhook-timestamp': String(timestamp),
      'webhook-signature': 'v1,' + createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64') };
  }
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { if ((await fetch(`${base}/eve/v1/health`)).ok) { ready = true; break; } } catch {}
      if (child.exitCode !== null) throw new Error('Production server exited before ready');
      await delay(100);
    }
    assert.ok(ready, 'production health becomes ready');
    await t.test('anonymous production session requests are rejected', async () => {
      const response = await fetch(`${base}/eve/v1/session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'hello' }),
      });
      assert.equal(response.status, 401);
    });
    await t.test('unsigned webhooks are rejected', async () => {
      assert.ok([400, 401].includes((await post('{}')).status));
    });
    const body = JSON.stringify({ event_type: 'message.received', data: {
      id: randomUUID(), chat: { id: randomUUID(), is_group: false }, direction: 'inbound',
      sender_handle: { id: randomUUID(), handle: '+15195550123', is_me: false },
      sent_at: new Date().toISOString(), parts: [{ type: 'text', value: 'Synthetic ignored sender test' }],
    } });
    await t.test('tampered payloads are rejected', async () => {
      assert.ok([400, 401].includes((await post(body + ' ', sign(body))).status));
    });
    await t.test('expired signatures are rejected', async () => {
      assert.ok([400, 401].includes((await post(body, sign(body, Math.floor(Date.now()/1000)-600))).status));
    });
    await t.test('valid signatures reach the channel; non-allowlisted sender is ignored', async () => {
      const response = await post(body, sign(body));
      assert.equal(response.status, 200);
      assert.equal(await response.text(), 'OK');
    });
  } finally {
    child.kill('SIGTERM');
    const forceStop = setTimeout(() => child.kill('SIGKILL'), 2000).unref();
    await new Promise((resolve) => { if(child.exitCode !== null) resolve(); else child.once('exit', resolve); });
    clearTimeout(forceStop);
  }
});
