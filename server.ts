import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy route to bypass CORS for the bell sound
  app.get("/api/bell-proxy", (req, res) => {
    // A reliable Archive.org link
    const audioUrl = "https://ia800204.us.archive.org/24/items/MehterMarslari/01-CeddinDeden.mp3";
    
    https.get(audioUrl, (proxyRes) => {
      // Forward headers
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Access-Control-Allow-Origin", "*");
      proxyRes.pipe(res);
    }).on("error", (e) => {
      console.error("Proxy error:", e);
      res.status(500).send("Error fetching audio");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
