# Paste this into your coding agent

Set up https://github.com/shrey150/htn-imessage-bot-template as my Hack The North starter.
Read its AGENTS.md and README.md first. Use Node.js 24 and npm ci; preserve the
pinned versions. Run npm run doctor -- --json. If credentials are missing, tell
me their names and ask me to configure them through my secret manager or the
included hidden terminal prompt. Never ask me to paste a secret into chat,
print its value, or write a reusable credential into the repo.

Keep the configured Claude Opus 5 model, 1M context, and 75% automatic
compaction. Keep Eve's default cumulative session budget; do not replace it
with a context-sized token cap. Use the included official Browserbase Eve
extension: https://eve.dev/integrations/browserbase. It is already installed.

Run npm run check and npm run build. Then run npm run smoke with the real
Browserbase and AI Gateway credentials. Verify the result includes Example
Domain and that the browser session is stopped. Use npm run --silent ask --
"<task>" for headless invocations. Preserve Eve's JSON; an exit code of 3 means
input or authorization is pending, and npm run --silent ask -- --resume takes the previous
result on stdin. Report observed results rather than assuming a zero exit code
means the requested web task succeeded.

Help me choose one focused use case, then edit agent/instructions.md. Keep the
repo small. For Hack the North, start with Linq's event sandbox signup in
README.md and have me text Activate to the assigned line. The repo already
includes a native portable Linq channel. Configure its managed API key,
webhook signing secret, and sender allowlist using the direct webhook steps
in README.md. Reuse my assigned line; do not replace the channel or provision
a second number. Vercel Connect is an alternative only if I choose that route.

Use my own Vercel project for deployment. Complete setup and validation before
deploying, following the permissions I give you. Verify the health route, then
have me text my Linq line and confirm that a reply arrives. Keep unavailable
checks clearly marked as unverified. Don't add a database or dashboard unless
my chosen project needs one. Finish by walking me through HACKATHON_DEMO.md.
