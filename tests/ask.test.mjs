import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function invokeFixture(source, args = []) {
  const root = mkdtempSync(join(tmpdir(), 'instinct-invoke-'));
  try {
    mkdirSync(join(root, 'scripts'));
    mkdirSync(join(root, 'node_modules/eve/bin'), { recursive: true });
    copyFileSync(new URL('../scripts/ask.mjs', import.meta.url), join(root, 'scripts/ask.mjs'));
    writeFileSync(join(root, 'node_modules/eve/bin/eve.js'), source);
    return spawnSync(process.execPath, [join(root, 'scripts/ask.mjs'), ...args], { encoding: 'utf8' });
  } finally { rmSync(root, { recursive: true, force: true }); }
}
test('headless output is JSON without SDK diagnostics or signed URLs', () => {
  const r = invokeFixture('console.log("SDK diagnostic with synthetic-signed-url");console.log(JSON.stringify({status:"ready",outcome:{status:"completed",message:"Example Domain"}}));');
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).status, 'ready');
  assert.ok(!r.stdout.includes('synthetic-signed-url'));
});
test('headless output preserves a paused invocation and its exit code', () => {
  const r = invokeFixture('console.log(JSON.stringify({status:"input-required",resume:{session:{sessionId:"test"}}}));process.exitCode=3;');
  assert.equal(r.status, 3);
  assert.equal(JSON.parse(r.stdout).resume.session.sessionId, 'test');
});
test('smoke fails on a recovered tool error even when the answer looks correct', () => {
  const r = invokeFixture('console.error("tool execution failed");console.log(JSON.stringify({status:"ready",outcome:{status:"completed",message:"Example Domain"}}));', ['--smoke']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /fell back/);
});
