# HTN iMessage bot template

**Text a task. Let a browser agent do the research.** A small starting point for Hack The North, built with [Eve](https://eve.dev), [Browserbase](https://www.browserbase.com), and [Linq](https://docs.linqapp.com).

[Read the setup guide](https://shrey150.github.io/htn-imessage-bot-template/) · [Use this template](https://github.com/new?template_name=htn-imessage-bot-template&template_owner=shrey150) · [Agent setup prompt](SETUP_PROMPT.md) · [Hackathon demo](HACKATHON_DEMO.md)

```text
Your terminal ──────────────┐
                           ▼
iMessage / SMS → Linq → Eve agent → Browserbase search / fetch / browser
                           │                       │
                           └──── a short answer ◀──┘
```

One agent. Edit its instructions to make it yours. No app UI, database, scheduler, or custom webhook server to build. Eve owns the agent loop, conversation history, HTTP routes, and messaging integration. [Browserbase's official Eve extension](https://eve.dev/integrations/browserbase) owns the browser lifecycle and tools. The native Linq channel is already included; configure its credentials when you're ready to text the agent.

## Hosted backend

A reference deployment is available at [htn-imessage-bot-template.vercel.app](https://htn-imessage-bot-template.vercel.app/eve/v1/health). Its health route is public; agent sessions require authentication. A Linq sandbox line is connected and restricted to configured senders. Live iMessage requests, browser tool calls, and delivered replies have been observed. The upgraded Opus 5 deployment also passed an authenticated browser task and a forced-compaction follow-up; a fresh phone round trip after that upgrade remains to be checked. See [verification](VERIFICATION.md) for evidence. Deploy your own instance using step 6.

## 1. Get the starter

Install **Node.js 24** and Git. npm ships with Node. macOS, Linux, and Windows through WSL work with the Bash examples below.

```bash
git clone https://github.com/shrey150/htn-imessage-bot-template.git
cd htn-imessage-bot-template
npm ci
```

Alternatively, select **Use this template** on GitHub to create your own repo, then clone it. The checked-in lockfile pins the tested dependency tree; use `npm ci` rather than upgrading during the hackathon.

## 2. Connect your accounts

For the reproducible terminal/headless path you need:

| Variable | Get it from | Used for |
| --- | --- | --- |
| `BROWSERBASE_API_KEY` | [Browserbase project settings](https://www.browserbase.com/settings) | Search, fetch, browser sessions, and Stagehand's model calls |
| `AI_GATEWAY_API_KEY` | [Vercel AI Gateway](https://vercel.com/ai-gateway) | Eve's reasoning model |

Have Browserbase access that supports **keep-alive sessions**, which the official extension uses. Browser and model calls consume the respective account's credits. No separate Stagehand model key or Browserbase project ID is required by this extension.

Use your secret manager to inject both variables. For a quick local session, open Bash and use the included hidden prompts:

```bash
bash
source scripts/keys.sh
npm run doctor
```

Enter keys only in the hidden terminal prompts. They stay in that shell, are not printed, and are not written to files. Run subsequent commands in the same shell. On a Coder devbox, use Coder User Secrets for persistence. `.env.example` lists the names; do not put real values in repository files or a chat with your coding agent.

`doctor` checks presence and format, not API access. Eve's interactive `/login` can use supported account connections instead of an AI Gateway key. Vercel deployments can use project OIDC for the agent model. The doctor deliberately checks the explicit API-key path used by the commands here.

## 3. Run a real browser task

```bash
npm run smoke
```

This smoke test passes only the two documented API credentials to Eve, so unrelated provider keys on your laptop cannot change its model routing. It also fails if a tool error is recovered through a fallback. It asks the real Eve agent to create a Browserbase session, navigate to `https://example.com`, extract the heading, and stop the browser. A successful response contains **Example Domain** and the source URL. Inspect the session in your [Browserbase dashboard](https://www.browserbase.com/sessions).

Chat interactively:

```bash
npm run dev
```

Or let another coding agent run a task without a TUI:

```bash
npm run --silent ask -- "Open https://news.ycombinator.com in a browser and return the first three story titles with links. Close the browser."
```

The small headless wrapper emits Eve's final JSON and keeps SDK diagnostic logs, including signed browser URLs, out of stdout. Exit code `0` means the invocation completed; `1` means failure; `3` means it paused for input or authorization. A completed turn can still describe a failed task, so inspect its answer. Save the result to a temporary, private file outside the repo if you want to continue the conversation:

```bash
npm run --silent ask -- --resume "Now summarize those in one sentence" < /path/to/previous-result.json
```

## 4. Make it your hack

Edit **`agent/instructions.md`**. That's the main customization surface. Pick one narrow job:

- **Internship scout:** find three public roles matching a skill and city, with application links.
- **Weekend planner:** compare three activities near Waterloo, with current source links.
- **Shopping researcher:** compare three products against a budget; link to the listings.
- **Paper companion:** open an article or project page and explain it in three bullets.

Change the reasoning model in `agent/agent.ts`; change the browser's model or timeout in `agent/extensions/browserbase.ts`. These are separate model calls. Optional Eve defaults such as shell access are disabled; this agent gets its tools from Browserbase.

The main agent uses **Claude Opus 5 with a 1M-token context window**. Eve automatically compacts older history at 75% of that window. Its separate, default session budget allows 40M cumulative input tokens across model calls. Repeatedly reading the same history counts toward that budget, including cached input. Compaction reduces future context size; it does not reset accumulated usage.

The instructions steer the starter toward research and away from purchases, submissions, and account changes. They are behavior guidance, not an enforced permissions system. Add explicit tool approval policies before building features that commit actions for users. See [Eve tool approvals](https://eve.dev/docs/tools/human-in-the-loop).

## 5. Add Linq

Choose **one** path. Both use Eve's native `linqChannel`, with the webhook route `/eve/v1/linq`.

### Hack the North sandbox

Start at [Linq's Hack the North signup](https://linqapp.com/s/events/hack-the-north), which offers hackers a free seven-day sandbox with school-email signup. When the dashboard assigns a number, text **Activate** to it from the phone you'll use for testing. Then save your API key in your secret manager and follow **Already have Linq credentials or a hackathon line?** below. The included channel uses that existing line; no second line or connector setup is needed.

### Guided setup with Vercel Connect (alternative to the included adapter)

```bash
npx eve link
npm run linq
```

This replaces the starter's portable channel with a managed connector. Use it before customizing `agent/channels/linq.ts`; review or save changes first. In Eve's setup, choose **Vercel Connect**, create or connect your Linq account, and select your line. Eve manages the connector credentials and webhook. Follow any remaining setup/deployment steps it reports. A usable Linq number and account access are prerequisites; availability and provisioning depend on your Linq account. Don't wait on a phone number to build the terminal demo.

For coding agents, use the native noninteractive installer:

```bash
npx eve add channel/linq --non-interactive --overwrite
```

If a noninteractive Vercel link reports a missing scope, run `npx vercel link --project YOUR-PROJECT --scope YOUR-TEAM --yes`, then retry Eve from the linked directory. The Vercel CLI is pinned in this repo.

Exit `2` means setup needs input or a prerequisite. Read the final NDJSON event and follow `next.command`. Supply only non-secret answers with `--answer`. Do not retry the same unresolved command in a loop. The guided portable option may write local env files; use the checked-in portable path below when your credentials are already managed externally.

### Already have Linq credentials or a hackathon line?

The repo already includes `agent/channels/linq.ts`. No adapter installation or custom webhook server is needed. Supply these variables through your host's secret manager:

| Variable | Value |
| --- | --- |
| `LINQ_API_KEY` | Your Linq Partner API v3 key |
| `LINQ_WEBHOOK_SECRET` | Signing secret returned when creating the webhook subscription |
| `LINQ_ALLOWED_SENDERS` | Your team's sender phone numbers in E.164, comma-separated, e.g. `+14165550123,+15195550123` |

The portable channel ignores senders outside that list and preserves Eve's per-sender auth. It verifies webhook signatures through the native adapter. For local credentials, `source scripts/keys.sh --linq` prompts without saving values.

After deployment, create a [Linq webhook subscription](https://docs.linqapp.com/channel/imessage/api/resources/webhook_subscriptions/methods/create/) for:

```text
https://YOUR-APP.vercel.app/eve/v1/linq
```

Subscribe to `message.received`, `reaction.added`, and `reaction.removed`. Filter the subscription to your assigned agent line. Save the returned signing secret directly to your host's encrypted environment variables and redeploy. Linq shows that secret only at creation; don't paste it into chat. The sender allowlist contains **your phone**, not the agent's receiving line.

`npm run doctor -- --linq` validates the portable environment. For a local webhook test, expose a production-mode `eve start` server behind a trusted HTTPS tunnel. Do not tunnel `eve dev`: its HTTP session route trusts development traffic. No tunnel is needed for the terminal demo.

## 6. Deploy and text it

With your own Vercel project linked, set `BROWSERBASE_API_KEY` in its **Production** encrypted environment variables. Set the three Linq variables too if you chose the portable route. Project OIDC supplies Eve's AI Gateway authentication when the Vercel team has model access; otherwise configure `AI_GATEWAY_API_KEY` on the project.

```bash
npm run check
npm run build
npm run test:server
npm run deploy
```

For a coding agent deploying a named project:

```bash
npx eve deploy --project YOUR-PROJECT --non-interactive --yes
```

Then check:

```bash
curl https://YOUR-APP.vercel.app/eve/v1/health
```

Health verifies the service, not the whole messaging chain. Direct portable Linq webhooks need public reachability; if Vercel Deployment Protection intercepts the webhook, configure access for that integration. Eve's HTTP session routes still require authentication in production. Keep the default auth policy in `agent/channels/eve.ts`.

Text your Linq number:

> Open example.com in a browser, tell me its heading, and close the browser.

Expect **Example Domain**. Then try your custom task. A real inbound message, a successful Browserbase session, and an actual reply on your phone are the final proof. Complete this test on your own line; a healthy deployment alone does not prove messaging delivery.

## Show it at the hackathon

Use the [five-minute demo script](HACKATHON_DEMO.md): text a live research request, show the Browserbase session or replay, ask a follow-up in the same thread, then show `agent/instructions.md` and the template button. Rehearse the full phone round trip before presenting; use a recorded, clearly labeled run if venue connectivity fails.

## Repo map

```text
agent/
  agent.ts                 # Opus 5, 1M context, 75% compaction
  instructions.md          # Your product idea — edit this first
  channels/eve.ts          # Eve's authenticated HTTP channel
  channels/linq.ts         # Ready-to-configure native Linq channel
  extensions/browserbase.ts # Official Browserbase tools
scripts/                   # Credential check, optional setup, guide preview
SETUP_PROMPT.md             # Give this to your coding agent
HACKATHON_DEMO.md           # Five-minute presentation and rehearsal
VERIFICATION.md             # What was actually tested
docs/index.html            # Self-contained branded HTML guide
```

The server contract tests exercise the included portable adapter using synthetic signatures. They skip after migrating to Vercel Connect, whose authentication must be tested against that deployment.

The Linq channel ships in the repo and reads its credentials at request time. Missing Linq credentials do not block terminal tasks or the build. Local conversations and compiled output live under ignored `.eve/` and `.output/` directories. The starter adds no long-term memory store and no reminder service. For those features later, start with Eve's registry rather than inventing infrastructure.

## Troubleshooting

| Symptom | Next step |
| --- | --- |
| `doctor` reports a missing key | Inject it into the same shell, or configure the host's encrypted environment; never print it to debug. |
| A browser task picks up another model-provider key | The official extension can detect ambient provider keys. `npm run smoke` isolates its environment; keep only the documented keys when reproducing that path. |
| Model authentication fails | Confirm AI Gateway access to the model in `agent/agent.ts`; the Browserbase key does not pay for Eve's model. |
| Browser creation fails | Check Browserbase credentials, credits, and keep-alive support. |
| Linq responds with 400/401 | Verify the route and signing secret for the direct subscription, or finish the Connect setup. Unsigned requests should be rejected. |
| No reply on your phone | Check Linq delivery logs, assigned line, subscribed events, deployment protection, and the portable sender allowlist. |
| “Input-token limit per session” | This is a cumulative usage budget, not the model context window. `Approve` grants another budget window. Budget settings are fixed when a session starts; an older session can retain a previous limit after deployment. A fresh session adopts the new budget and starts without the old active conversation context. |
| Browser task returns partial results | Inspect the Eve logs and Browserbase session; check target access and available credits. |
| `eve invoke` exits 3 | Preserve its JSON and resume the pending input/authorization; this is not a completed task. |

## Built on official starting points

This project was scaffolded with `npx eve@0.62.0 init`, then configured with the published `@browserbasehq/eve@0.1.0` extension and Eve's native Linq adapter. It combines those official starting points into a small, deployable iMessage assistant for Hack the North.

- [Eve quickstart](https://eve.dev/docs/getting-started) and [templates](https://eve.dev/templates)
- [Official Browserbase integration for Eve](https://eve.dev/integrations/browserbase) and [extension source](https://github.com/browserbase/stagehand/tree/main/packages/integrations/eve)
- [Eve native Linq channel](https://eve.dev/docs/channels/linq)
- [Eve deployment](https://eve.dev/docs/guides/deployment/vercel)
- [Browserbase templates](https://github.com/browserbase/templates)

MIT for starter code; see `THIRD_PARTY_NOTICES.md` for upstream licenses and brand assets.
