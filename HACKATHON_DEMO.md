# HTN iMessage bot template: five-minute demo

Show one complete loop: **text → real browser work → reply with sources**. Keep the presentation focused on what hackers can build from the template.

## Before you go on stage

- Open your configured iMessage conversation, the [Browserbase sessions dashboard](https://www.browserbase.com/sessions), the [setup guide](https://shrey150.github.io/htn-imessage-bot-template/), and `agent/instructions.md`.
- Send the demo text below and wait for an actual reply on your phone. Check the matching Browserbase session and that it stopped. A health check alone does not prove the phone path.
- Try the follow-up in that same conversation. If you reset the agent session, resend the first task so it has the context again.
- Keep the completed Browserbase replay and its matching phone reply ready. If venue connectivity fails, label that run as recorded; do not present a replay as live.
- Hide credentials and unrelated conversations. The reference sandbox accepts configured senders only; audience members should create their own repo and line.

## The five minutes

| Time | Show | Say or do |
| --- | --- | --- |
| 0:00–0:30 | Your phone and the three-service diagram in the guide | “This is an iMessage assistant that can use a real browser. Linq handles the texts, Eve runs the agent, and Browserbase does the web work.” |
| 0:30–2:30 | Send the first text; open its Browserbase session, then the reply | Show the browser live while the session is active, or its replay after it stops. Point out that the response links to the pages it read. |
| 2:30–3:30 | Send the follow-up in the same conversation | Show that the assistant can use the context from its previous answer. |
| 3:30–4:30 | `agent/instructions.md`, then `agent/extensions/browserbase.ts` | “Change this instruction file to make an internship scout, campus planner, or research assistant. The [official Browserbase Eve integration](https://eve.dev/integrations/browserbase) is already installed.” |
| 4:30–5:00 | The guide’s template button and agent setup prompt | “Use this template, give the setup prompt to your coding agent, and connect your own Linq sandbox number.” |

First text:

> Open https://news.ycombinator.com in a browser. Return the first three story titles with links, then close the browser.

Follow-up:

> Which of those three stories is most useful for a student building a hackathon project, and why? Keep it to three sentences and include the link.

The story titles change. Judge the demo by the live page, source links, browser evidence, and delivered reply; do not memorize expected titles.

## If someone asks how it works

The starter has one Eve agent, the official Browserbase extension, and a native Linq channel. The main model is Claude Opus 5 with a 1M-token context window and automatic compaction at 75%. Eve’s separate 40M cumulative input budget guards against runaway sessions; compaction does not reset that counter. Optional shell tools are disabled.

The agent runs locally from the terminal or deploys to Vercel for a public Linq webhook. Browserbase runs its browser sessions. Secrets belong in your host’s secret manager. The prompt steers the assistant toward research; add enforced approvals before extending it to make purchases or other commitments.

## Evidence and limits

The hosted Opus 5 agent passed the Hacker News task and same-session follow-up above through an authenticated HTTP session; Browserbase confirmed the session stopped. It also retained an earlier result through forced compaction. Live iMessage delivery and browser tool calls were observed before the model upgrade. A fresh phone round trip after the upgrade still needs rehearsal; the full 750K automatic compaction trigger has not been exercised. See [VERIFICATION.md](VERIFICATION.md) for the exact checks. Do not claim untested paths as demonstrated.

[Use this template](https://github.com/new?template_name=htn-imessage-bot-template&template_owner=shrey150) · [Setup guide](https://shrey150.github.io/htn-imessage-bot-template/) · [Copy the agent setup prompt](SETUP_PROMPT.md)
