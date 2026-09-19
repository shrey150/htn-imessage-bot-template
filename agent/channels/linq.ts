import { linqChannel, defaultLinqAuth } from "eve/channels/linq";

// Resolve credentials at request time so builds do not need real keys.
export default linqChannel({
  credentials: {
    apiKey: () => process.env.LINQ_API_KEY!,
    signingSecret: () => process.env.LINQ_WEBHOOK_SECRET!,
  },
  onMessage(_ctx, message) {
    const allowed = (process.env.LINQ_ALLOWED_SENDERS ?? "")
      .split(",")
      .map((number) => number.trim())
      .filter(Boolean);
    // Linq's adapter maps the sender's phone handle to userName; userId can be a UUID.
    if (message.author.isBot || !allowed.includes(message.author.userName)) return null;
    return { auth: defaultLinqAuth(message) };
  },
});
