import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("out");
const index = process.argv.indexOf("--port");
const port = Number(index >= 0 ? process.argv[index + 1] : process.env.PORT || 3000);
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".txt": "text/plain", ".gltf": "model/gltf+json", ".glb": "model/gltf-binary" };
http.createServer(async (req, res) => {
  try {
    let file = resolve(root, "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname));
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const info = await stat(file);
    res.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream", "Content-Length": info.size, "X-Content-Type-Options": "nosniff" });
    if (req.method === "HEAD") res.end(); else createReadStream(file).pipe(res);
  } catch { res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found"); }
}).listen(port, "127.0.0.1", () => console.log(`SceneBreaker static export: http://127.0.0.1:${port}`));
