import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";
import checkoutRouter from "./routes/checkout.js";
import adminRouter from "./routes/admin.js";
import chatRouter from "./routes/chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "nexoria-storefront-backend" });
});

app.use("/api/products", productsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/admin", adminRouter);
app.use("/api/portfolio-chat", portfolioChatRouter);
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`Nexoria storefront backend running on http://localhost:${PORT}`);
});
