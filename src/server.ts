import express from "express";
import { config } from "dotenv";
import { limiter } from "./middlewares/rateLimit";
import { router } from "./routes/routes";
import cors from "cors"; // <--- importa o cors

config(); // dotenv

const app = express();
const PORT = process.env.PORT ?? 3001;

// middleware CORS
app.use(cors({
  origin: "*", // permite acesso de qualquer domínio
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// rate limit
app.use(limiter);

// router
app.use("/", router);

app.listen(PORT, () => {
  console.log(`⚔️  API started ON PORT : ${PORT} @ STARTED 🚀`);
});

export default app;

