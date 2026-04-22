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

  app.use(express.json());

  // In-memory messages for demonstration
  let messages = [
    {
      id: 'p1',
      senderId: 'teacher-1',
      sender: 'Matematik Canavarı (Öğretmen)',
      recipientId: 'parent-1',
      senderRole: 'Öğretmen',
      content: 'Üçgenler bugün kare olmaya karar verdi, lütfen cetvellerinizi yanınızda getirmeyin, bisküvi getirin.',
      time: '14:20',
      avatar: 'https://i.pravatar.cc/150?u=math'
    },
    {
      id: 'v1',
      senderId: 'parent-1',
      sender: 'Arda Demir',
      recipientId: 'teacher-1',
      senderRole: 'Veli',
      content: 'Hocam, Ali bugün okula uçarak gelmeye çalıştı, pelerinini evde unutmuş. Lütfen teneffüste pelerinsiz uçmaması için uyarır mısınız?',
      time: '10:45',
      avatar: 'https://i.pravatar.cc/150?u=arda'
    }
  ];

  // API Route to fetch messages
  app.get("/api/messages", (req, res) => {
    res.json(messages);
  });

  // API Route to send a message
  app.post("/api/messages", (req, res) => {
    const newMessage = {
      id: Date.now().toString(),
      ...req.body,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  });

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
