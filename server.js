// server.js (Archivo principal del backend)

import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { dbConnection } from "./src/config/database.js";
import open from "open";
import path from "path";
import { fileURLToPath } from "url";

// Importa todas tus rutas
import authRoutes from "./src/routes/auth.routes.js";
import tutorRoutes from "./src/routes/tutor.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import messageRouter from "./src/routes/message.routes.js";

// --- Configuración de __dirname para ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Conecta a la base de datos
dbConnection();

// --- Middlewares Esenciales ---
const corsOptions = {
  origin: ["http://127.0.0.1:5500", "http://127.0.0.1:5501"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 🚨 CORRECCIÓN CLAVE: El path a 'public' no necesita '..'
app.use(express.static(path.join(__dirname, "public"))); // Cambiado de '..', 'public' a solo 'public'

// --- Rutas de la API ---
app.use("/api", authRoutes);
app.use("/api", tutorRoutes);
app.use("/api", userRoutes);
app.use("/api", messageRouter);

// 💡 MEJORA: Agregar una ruta explícita para la raíz (/) para asegurar el index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Iniciar el servidor ---
const PORT = process.env.PORT;
const BACKEND_URL = `http://localhost:${PORT}`;
// Cambiamos la URL de apertura para que solo sea la raíz (/)
const FRONTEND_URL = `${BACKEND_URL}/`;

app.listen(PORT, async () => {
  console.log(`✅ Servidor corriendo en ${BACKEND_URL}`);

  try {
    //ESTA LINEA HACE QUE SE ABRA EL INDEX.HTML AUTOMATICAMENTE
    await open(FRONTEND_URL);
  } catch (error) {
    console.error("Error al intentar abrir el navegador:", error);
  }
});
