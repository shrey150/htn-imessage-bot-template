import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const smoke = process.argv[2] === '--smoke';
const args = smoke ? ['Use Browserbase to create a browser session, open https://example.com, extract the page heading, and stop the browser session. Return the heading and URL.'] : process.argv.slice(2);
// A smoke test must work with only the documented credentials, even on a
// developer machine that has other provider keys or model-routing settings.
const env = smoke ? Object.fromEntries([
  'PATH', 'HOME', 'USER', 'LANG', 'LC_ALL', 'TMPDIR', 'SystemRoot',
  'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'NODE_EXTRA_CA_CERTS',
  'BROWSERBASE_API_KEY', 'AI_GATEWAY_API_KEY',
].filter((key) => process.env[key] !== undefined).map((key) => [key, process.env[key]])) : process.env;
const child = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/eve/bin/eve.js', import.meta.url)), 'invoke', ...args], {
  env, stdio: ['inherit', 'pipe', 'pipe'],
});
let stdout = '', stderr = '';
child.stdout.setEncoding('utf8').on('data', (chunk) => { stdout += chunk; });
child.stderr.setEncoding('utf8').on('data', (chunk) => { stderr += chunk; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', () => { console.error('Could not start Eve. Run npm ci first.'); process.exitCode = 1; });
child.on('close', (code) => {
  // Stagehand can write SDK diagnostics (including signed browser URLs) to
  // stdout. Emit only Eve's final JSON result so callers can safely pipe it.
  let result;
  for (const match of [...stdout.matchAll(/^\{/gm)].reverse()) {
    try {
      const candidate = JSON.parse(stdout.slice(match.index));
      if (typeof candidate.status === 'string') { result = candidate; break; }
    } catch {}
  }
  if (!result) {
    console.error('Eve returned no invocation JSON. Run npm run doctor, then inspect npx eve logs locally.');
    process.exitCode = code || 1;
    return;
  }
  console.log(JSON.stringify(result, null, 2));
  const failedSmoke = smoke && (result.outcome?.status !== 'completed'
    || !result.outcome?.message?.includes('Example Domain')
    || /tool execution failed/i.test(stderr + stdout));
  if (failedSmoke) console.error('Browser smoke test failed or a tool fell back. Inspect npx eve logs locally.');
  process.exitCode = code || (failedSmoke ? 1 : 0);
});
