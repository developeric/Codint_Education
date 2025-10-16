// server.js (o el nombre que tenga tu archivo principal)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // 👈 1. Asegúrate de que está importado

// Importa tus componentes de la aplicación
import { dbConnection } from "./src/config/database.js";
import authRoutes from "./src/routes/auth.routes.js";
import tutorRoutes from "./src/routes/tutor.routes.js";

// Carga las variables de entorno (.env) INMEDIATAMENTE
dotenv.config();

const app = express();

// Conecta a la base de datos
dbConnection();

// --- Middlewares ---

// 2. Configuración de CORS (CRÍTICO PARA LAS COOKIES)
const corsOptions = {
  // La URL exacta donde corre tu frontend
  origin: "http://127.0.0.1:5500",
  // Esto es lo que permite al navegador enviar la cookie
  credentials: true,
};
app.use(cors(corsOptions));

// Middlewares para procesar los datos de las solicitudes
app.use(express.json()); // Para entender JSON
app.use(cookieParser()); // 👈 3. Para que el servidor pueda LEER las cookies

// --- Rutas de la API (DEBEN IR DESPUÉS DE LOS MIDDLEWARES) ---
app.use("/api", authRoutes);
app.use("/api", tutorRoutes);

// --- Iniciar el servidor ---
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
