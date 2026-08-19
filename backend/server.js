import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactRouter from "./routes/contact.js";
import contentRouter from "./routes/content.js";
import chatRouter from "./routes/chat.js";
import portfolioChatRouter from "./routes/portfolio-chat.js";
import portfolioSiteRouter from "./routes/portfolio-site.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ekadhantha-backend" });
});

app.use("/api/contact", contactRouter);
app.use("/api/chat", chatRouter);
app.use("/api/portfolio-chat", portfolioChatRouter);
app.use("/api", portfolioSiteRouter);
app.use("/api", contentRouter);

app.listen(PORT, () => {
  console.log(`EKADHANTHA backend running on http://localhost:${PORT}`);
});
