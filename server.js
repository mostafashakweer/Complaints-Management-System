import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;
const DB_PATH = path.join(__dirname, "db.json");

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for potential large state with images

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

function broadcast(data) {
  const jsonData = JSON.stringify(data);
  wss.clients.forEach((client) => {
    // Check if the client is in the OPEN state before sending
    if (client.readyState === 1) {
      // 1 corresponds to WebSocket.OPEN
      try {
        client.send(jsonData);
      } catch (err) {
        console.error(`Failed to send message to a client:`, err);
      }
    }
  });
}

// API routes
app.get("/api/data", (req, res) => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileData = fs.readFileSync(DB_PATH, "utf8");
      // Avoid sending empty or corrupted data
      if (fileData) {
        res.status(200).json(JSON.parse(fileData));
      } else {
        res.status(200).json({});
      }
    } else {
      // File doesn't exist, return empty state
      res.status(200).json({});
    }
  } catch (err) {
    console.error("Error in GET /api/data:", err);
    res.status(500).send("Error reading data");
  }
});

app.post("/api/data", (req, res) => {
  const data = req.body;
  if (!data || Object.keys(data).length === 0) {
    return res.status(400).send("No data provided");
  }
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
    console.log("Data saved successfully.");
    // Broadcast the new state to all clients
    broadcast(data);
    res.status(200).send("Data saved successfully");
  } catch (err) {
    console.error("Error writing to database file:", err);
    res.status(500).send("Error saving data");
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// app.use(
//   cors({
//     origin: "*", // أو حدد اللينك بتاع الفرونت لو عايز أمان أكتر
//     credentials: true,
//   })
// );
