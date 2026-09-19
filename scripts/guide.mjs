import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

createServer(async (req, res) => {
  if (req.url !== "/" && req.url !== "/index.html") {
    res.writeHead(404).end("Not found");
    return;
  }
  try {
    const html = await readFile(new URL("../docs/index.html", import.meta.url));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(html);
  } catch {
    res.writeHead(500).end("Guide file unavailable");
  }
}).listen(4173, "127.0.0.1", () => console.log("Guide: http://127.0.0.1:4173"));
