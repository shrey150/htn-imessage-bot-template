import { existsSync } from "node:fs";

const json = process.argv.includes("--json");
const linq = process.argv.includes("--linq");
const checks = [
  { name: "Node.js 24", ok: Number(process.versions.node.split(".")[0]) === 24 },
  { name: "BROWSERBASE_API_KEY", ok: Boolean(process.env.BROWSERBASE_API_KEY?.trim()) },
  { name: "AI_GATEWAY_API_KEY", ok: Boolean(process.env.AI_GATEWAY_API_KEY?.trim()) },
];
if (linq) {
  for (const name of ["LINQ_API_KEY", "LINQ_WEBHOOK_SECRET"]) {
    checks.push({ name, ok: Boolean(process.env[name]?.trim()) });
  }
  const senders = (process.env.LINQ_ALLOWED_SENDERS ?? "").split(",").map((s) => s.trim());
  checks.push({ name: "LINQ_ALLOWED_SENDERS (E.164 phone numbers)", ok: senders.every((s) => /^\+[1-9]\d{7,14}$/.test(s)) });
  checks.push({ name: "agent/channels/linq.ts", ok: existsSync(new URL("../agent/channels/linq.ts", import.meta.url)) });
}
const ok = checks.every((check) => check.ok);
if (json) console.log(JSON.stringify({ ok, checks }));
else {
  for (const check of checks) console.log(`${check.ok ? "OK" : "MISSING"}  ${check.name}`);
  console.log("\nChecks presence and format only; run npm run smoke to verify live access.");
  if (!ok) console.log("Supply credentials through your secret manager or source scripts/keys.sh in Bash. See README.md.");
  console.log("For Eve /login or Vercel OIDC, a local AI_GATEWAY_API_KEY is optional; doctor checks the headless API-key path.");
}
process.exitCode = ok ? 0 : 1;
