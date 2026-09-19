import browserbase from "@browserbasehq/eve";

export default browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY!,
  model: "google/gemini-3.6-flash",
  sessionTimeoutSeconds: 300,
  proxies: false,
});
