// server.js (Archivo principal del backend)

import express from "express";
import cors from "cors";
import "dotenv/config"
import cookieParser from "cookie-parser";
import { dbConnection } from "./src/config/database.js";
import open from 'open';
import path from 'path'; // 💡 1. NUEVA IMPORTACIÓN: Importar 'path'
import { fileURLToPath } from 'url'; // 💡 2. NUEVA IMPORTACIÓN: Para manejar __dirname en ES Modules

// Importa todas tus rutas
import authRoutes from "./src/routes/auth.routes.js";
import tutorRoutes from "./src/routes/tutor.routes.js";
import userRoutes from "./src/routes/user.routes.js";

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

// 💡 3. CAMBIO CRÍTICO: MIDDLEWARE PARA SERVIR ARCHIVOS ESTÁTICOS
// Esto le dice a Express que la carpeta 'public' contiene archivos servibles.
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Rutas de la API ---
// Estas rutas solo se activan cuando la URL empieza por /api
app.use("/api", authRoutes);
app.use("/api", tutorRoutes);
app.use("/api", userRoutes);

// --- Iniciar el servidor ---
const PORT = process.env.PORT;
const BACKEND_URL = `http://localhost:${PORT}`; // URL del backend
// La URL de apertura debe apuntar al índice servido por el backend:
const FRONTEND_URL = `${BACKEND_URL}/index.html`; 

app.listen(PORT, async () => { 
  console.log(`✅ Servidor corriendo en ${BACKEND_URL}`);
  
  // Código añadido: Abrir el navegador automáticamente
  try {
      console.log(`Abriendo frontend en ${FRONTEND_URL}...`);
      await open(FRONTEND_URL);
  } catch (error) {
      console.error("Error al intentar abrir el navegador:", error);
  }
});