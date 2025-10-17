// server.js (Archivo principal del backend)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { dbConnection } from "./src/config/database.js";

// Importa todas tus rutas
import authRoutes from "./src/routes/auth.routes.js";
import tutorRoutes from "./src/routes/tutor.routes.js";
import userRoutes from "./src/routes/user.routes.js";

// Carga las variables de entorno (.env) lo antes posible
dotenv.config();

const app = express();

// Conecta a la base de datos
dbConnection();

// --- Middlewares Esenciales ---
const corsOptions = {
  origin: "http://127.0.0.1:5500", // URL exacta de tu frontend
  credentials: true, // Permite que el navegador envíe cookies
};
app.use(cors(corsOptions));
app.use(express.json()); // Para entender JSON
app.use(cookieParser()); // Para poder leer las cookies

// --- Rutas de la API ---
app.use("/api", authRoutes);
app.use("/api", tutorRoutes);
app.use("/api", userRoutes);

// --- Iniciar el servidor ---
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
