import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactRouter from "./routes/contact.js";
import contentRouter from "./routes/content.js";
import chatRouter from "./routes/chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "nexoria-backend" });
});

app.use("/api/contact", contactRouter);
app.use("/api/chat", chatRouter);
app.use("/api", contentRouter);

app.listen(PORT, () => {
  console.log(`Nexoria backend running on http://localhost:${PORT}`);
});
