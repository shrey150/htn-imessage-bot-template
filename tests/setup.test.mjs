import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const doctor = new URL("../scripts/doctor.mjs", import.meta.url);
test("doctor returns machine-readable missing credentials without leaking values", () => {
  const result = spawnSync(process.execPath, [doctor.pathname, "--json"], { env: {}, encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).ok, false);
});
test("doctor reports presence without printing credentials", () => {
  const marker = "synthetic-value-do-not-print";
  const result = spawnSync(process.execPath, [doctor.pathname, "--json"], {
    env: { BROWSERBASE_API_KEY: marker, AI_GATEWAY_API_KEY: marker }, encoding: "utf8",
  });
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).ok, true);
  assert.ok(!result.stdout.includes(marker));
});
test("keys helper refuses execution instead of pretending to export to parent", () => {
  const result = spawnSync("bash", [new URL("../scripts/keys.sh", import.meta.url).pathname], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /source scripts\/keys.sh/);
});
