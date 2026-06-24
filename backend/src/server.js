import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import fittingsRoutes from "./routes/fittings.routes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
  })
);

app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "Tailor CRM API",
    health: "/api/health",
    clients: "/api/clients",
    orders: "/api/orders",
    fittings: "/api/fittings",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/fittings", fittingsRoutes);

app.use((request, response) => {
  response.status(404).json({
    error: "Route not found",
    path: request.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`Tailor CRM backend is running on http://localhost:${PORT}`);
});