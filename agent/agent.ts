import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-opus-5",
  modelContextWindowTokens: 1_000_000,
  defaultTools: false,
  tool: false,
  compaction: {
    thresholdPercent: 0.75,
  },
  // Keep Eve's default 40M cumulative input budget; it is separate from context size.
});
