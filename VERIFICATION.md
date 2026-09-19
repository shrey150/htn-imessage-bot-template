# Verification — September 19, 2026

Tested on Node.js 24.15.0 with Eve 0.62.0 and the published Browserbase Eve extension 0.1.0. Eve uses `anthropic/claude-sonnet-4.6`; Stagehand uses `google/gemini-3.6-flash` through Browserbase Model Gateway.

| Check | Observed result | What it proves |
| --- | --- | --- |
| `npm ci` | Clean install from the checked-in public-registry lockfile passed | A hacker can install the pinned dependency tree |
| `npm run check` | TypeScript passes; 3 setup tests pass | Authored modules typecheck; doctor does not echo synthetic credentials; hidden-key helper handles execution correctly |
| `npm run build` | Production output generated in `.output` | Eve compiles the agent, Browserbase extension, and native Linq channel |
| `npm run smoke` | `create_session` → `navigate` → `extract` → `stop_session`; heading `Example Domain` | Real Eve + Browserbase + Stagehand extraction, with live model calls |
| Browserbase session API after the smoke test | `COMPLETED` | Browser cleanup was verified against the service, not only the agent's reply |
| `npm run test:server` | 5 HTTP assertions pass (6 tests including the parent test) | The compiled portable app serves health, rejects anonymous HTTP session creation, verifies Linq webhook signatures, and accepts a valid signed event from an ignored sender |
| Unsigned, tampered, and expired Linq webhook requests | All return 401 | Native Linq signature enforcement using synthetic signing material |
| Valid signed synthetic event | Returns 200 `OK`; sender is outside the portable allowlist | Event verification and channel routing; not real Linq delivery |
| Guide at 1440 × 1000 and 390 × 844 | Rendered screenshots; mobile has no horizontal overflow | Desktop and mobile guide layout |

The initial OpenAI browser-model attempt hit a model-credit error. The final configured Gemini browser model passed the same real extraction task without tool errors.

## Not yet verified

- A real inbound Linq iMessage/SMS and an actual reply delivered to a phone. No Linq API key or provisioned line was available for this build.
- Linq account/number provisioning through Vercel Connect.
- Production execution after a Vercel deployment. The local production build and HTTP contract checks pass; deployments need account environment configuration.

The synthetic webhook tests use the real Eve HTTP server and native Linq adapter, but do not call the Linq API or claim to simulate phone delivery. The research-only prompt is behavior guidance, not a security sandbox. Transitive package dependencies retain their upstream maintenance and security constraints; this report is a functional verification, not a dependency security audit.
