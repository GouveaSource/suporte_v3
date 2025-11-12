import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
