# OpenInstinct Lite: coding-agent quickstart

Read README.md, then run `npm ci` and `npm run doctor -- --json`.
Use `npm run ask -- "<task>"` for a headless run; it returns Eve JSON.
Exit 0 is a completed invocation, 1 is failure, 3 means input or authorization
is pending. Preserve the JSON and resume with `npm run --silent ask -- --resume` via stdin.
Do not treat a paused invocation as success.

Use managed environment variables for secrets. Never print credentials, put
secrets in chat or command arguments, or write real keys into repository files.
`source scripts/keys.sh` is a human-operated hidden Bash prompt for one shell.
The doctor command tests presence, not authentication. `npm run smoke` calls
real model and Browserbase services and can incur usage charges.

The project intentionally starts with one agent and the official Browserbase
extension. The native Linq channel ships ready to configure with managed environment
variables. `npm run linq` replaces it via Eve's Vercel Connect setup; use that
alternative only before customizing the channel, or after reviewing the change.
Do not overwrite a configured Linq channel or provision another line by default.
Keep the user's requested project small. Change `agent/instructions.md` first.
Do not add databases, a frontend, memory, or schedules unless the project needs them.

Run `npm run check` and `npm run build` after code changes. Live checks require
credentials: use public demo sites and stop the browser session afterward.
The prompt's behavioral restrictions are not a security boundary: add enforced
approvals and access controls before extending the agent to make commitments.

## Framework guidance from the official scaffold

# eve Agent App

This project uses the eve framework: an agent is a directory of files under `agent/`, and eve compiles and runs it.

For a content-only change to the root agent's identity, purpose, tone, or response guidelines, edit its existing authored instructions. Fresh projects use `agent/instructions.md`; a project may instead use `agent/instructions.ts` or files under `agent/instructions/`. You do not need to read the framework docs for a content-only instructions change. A fresh project already has its selected model in `agent/agent.ts`; preserve that file unless the user asks to change the model.

## Read the docs before writing code

```sh
ls node_modules/eve/docs
```

Start with `docs/README.md`: it maps each task to the page that covers it. Read that page before authoring tools, connections, channels, skills, subagents, schedules, or deployment. In a workspace or local package install, resolve the installed `eve` package location first. If the package docs are missing, use https://eve.dev/docs.

Use a bounded authoring loop:

1. Read the relevant page and inspect only files you will modify or need to imitate.
2. Stop discovery once the file location, imports, and definition shape are clear. Implement the smallest complete behavior the user requested.
3. Run one narrow verification. Expand investigation only when it fails or the request needs project-specific details.

Follow links or inspect public types only when the routed page leaves the task unanswered. Do not recursively glob `node_modules`, enumerate the entire docs tree, or read unrelated scaffold files when the direct path is known. Package-manager links can hide files from recursive glob tools even though direct reads work.

## Prefer an existing integration

When a task names an external product or service, search the registry before implementing its integration. For a generic capability, author a tool instead.

```sh
eve registry search <query> --json
eve registry view <item>
```

Prefer items whose `implementation` is `native`; use Chat SDK adapters when no native channel fits. `registry view` links the item's documentation.

Install without driving interactive prompts:

```sh
eve add <item> --non-interactive
```

Exit code 0 means setup completed, 1 failed, and 2 needs an answer or a prerequisite. On exit 2, run the `next.command` from the final NDJSON event. For a non-secret question, replace its `<JSON value>` answer placeholder with the answer you collected; string values need JSON quotes. Never pass a secret in `--answer`. See `docs/install-integrations.mdx` for setup prerequisites.

## Use eve for Vercel operations

Use eve to link and deploy Vercel projects:

```sh
eve link --non-interactive --project <name-or-id> [--team <team-id-or-slug>]
eve deploy --non-interactive --yes [--project <name-or-id>]
```

A setup may report `eve link` as a prerequisite; run it, then retry the continuation. When a completed setup event has `deploymentRequired: true`, run the `next` command it reports.

## Validate the change

Run the validation the task requests. When it does not establish the behavior you changed, run the narrowest relevant check.
