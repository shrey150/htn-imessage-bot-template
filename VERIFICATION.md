# HTN iMessage bot template verification — September 19, 2026

Tested on Node.js 24.15.0 with Eve 0.62.0 and the published Browserbase Eve extension 0.1.0. The agent now uses `anthropic/claude-opus-5` with 1M context and automatic compaction at 75%; the original hosted checks used Sonnet 4.6. Stagehand uses `openai/gpt-5.4-mini` through Browserbase Model Gateway.

| Check | Observed result | What it proves |
| --- | --- | --- |
| `npm ci` | Clean install from the checked-in public-registry lockfile passed | A hacker can install the pinned dependency tree |
| `npm run check` | TypeScript passes; 6 setup/headless tests pass | Authored modules typecheck; credential checks, clean JSON output, paused exit codes, and failure-on-fallback behavior pass |
| `npm run build` | Production output generated in `.output` | Eve compiles the agent, Browserbase extension, and native Linq channel |
| `npm run smoke` | `create_session` → `navigate` → `extract` → `stop_session`; heading `Example Domain` | Real Eve + Browserbase + Stagehand extraction, with live model calls |
| Browserbase session API after the smoke test | `COMPLETED` | Browser cleanup was verified against the service, not only the agent's reply |
| Hosted health and auth | Health returns `200 ready`; anonymous session creation returns `401` | Vercel deployment is serving requests with production auth enabled |
| Final hosted `eve invoke` browser task | Returned `Example Domain`; zero error log records during the run | The deployed agent works with only Browserbase and AI Gateway credentials |
| `npm run test:server` | 5 HTTP assertions pass (6 tests including the parent test) | The compiled portable app serves health, rejects anonymous HTTP session creation, verifies Linq webhook signatures, and accepts a valid signed event from an ignored sender |
| Unsigned, tampered, and expired Linq webhook requests | All return 401 | Native Linq signature enforcement using synthetic signing material |
| Valid signed synthetic event | Returns 200 `OK`; sender is outside the portable allowlist | Event verification and channel routing; not real Linq delivery |
| Public guide at 1440 × 1000 and 390 × 844 | Rendered screenshots; no horizontal overflow; copy prompt, setup tabs, mobile navigation, and checklist persistence pass | Published guide layout and controls |
| Linq sandbox activation and API access | User sent `Activate`; Linq reports one assigned, healthy line; phone-number API returns 200 | The provisioned sandbox and its API key work; activation arrived through iMessage |
| Linq webhook configuration | Active subscription filtered to the assigned line; API key, signing secret, and sender allowlist stored in encrypted Vercel Production variables | The deployed native channel has its live connection configuration |
| Deployment after Linq configuration | Health returns `200 ready`; unsigned `/eve/v1/linq` request returns `401` | The configured deployment is ready and rejects unauthenticated webhook requests |
| Live iMessage conversation | Linq received user messages; Eve ran Browserbase tools; Linq reports assistant replies as delivered | Real messaging transport and agent tool execution, including the budget warning described below |
| Opus 5 local browser smoke | Returned `Example Domain` after a real browser task; smoke exit 0, with no recovered tool errors | The upgraded model can use the published Browserbase extension with the documented credentials |
| Hosted Opus 5 browser smoke | Production reports `anthropic/claude-opus-5` and 1,000,000 context tokens; create → navigate → extract → stop returned `Example Domain` without tool failures | The upgraded Vercel deployment runs real browser work |
| Hosted Hack the North demo rehearsal | Returned the first three Hacker News story titles with URLs through real browser and fetch tools; no failed events; Browserbase API reports `COMPLETED`. The follow-up selected one of those titles without new tools and labeled its title-based inference | The hosted Opus 5 demo task and same-session follow-up work; this was an authenticated HTTP run, not a new phone round trip |
| Hosted forced compaction and follow-up | Observed `compaction.completed`; the next Opus 5 turn recalled `Example Domain` and `https://example.com` with no new tool calls | Compaction works and preserved this task's result; the full 750K automatic trigger was not exercised |

Early local and hosted tests exposed two setup traps: ambient provider keys can override the intended Browserbase Gateway path, and an agent can return a correct-looking answer after a browser tool falls back. The final smoke launcher passes only the documented credentials, uses the extension's supported default browser model, emits clean JSON, and returns failure if it detects a tool error.

The first live phone conversation also exposed an overly small authored session budget: 200K cumulative input tokens, separate from the model's context window. Repeated tool/model calls exhausted it while individual prompts remained below 60K tokens. The starter now uses Eve's default 40M cumulative input budget and no custom cumulative output cap. Model context is explicitly 1M, and automatic compaction starts at 75%. Existing sessions retain their original usage-budget settings; a fresh session is required to adopt the changed budget. Automatic compaction at 750K has not been exercised by a full-size context test.

## Not yet verified

- A new phone browser-task round trip after the Opus 5 and budget update.
- Linq account/number provisioning through Vercel Connect.
- SMS/RCS delivery; the sandbox activation used iMessage.

The synthetic webhook tests use the real Eve HTTP server and native Linq adapter, but do not call the Linq API or claim to simulate phone delivery. The research-only prompt is behavior guidance, not a security sandbox. Transitive package dependencies retain their upstream maintenance and security constraints; this report is a functional verification, not a dependency security audit.
