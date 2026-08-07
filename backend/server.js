import express from "express";
import cors from "cors";
import contactRouter from "./routes/contact.js";
import contentRouter from "./routes/content.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "nexoria-backend" });
});

app.use("/api/contact", contactRouter);
app.use("/api", contentRouter);

app.listen(PORT, () => {
  console.log(`Nexoria backend running on http://localhost:${PORT}`);
});
