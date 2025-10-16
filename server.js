// developeric/codint_education/Codint_Education-backend/server.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

// CAMBIO A IMPORTACIÓN CON NOMBRE:
import { dbConnection } from "./src/config/database.js"; // Antes era 'import dbConnection from ...' o similar
import router from "./src/routes/auth.routes.js";
//
// Inicialización
const PORT = process.env.PORT; //
const app = express();
dbConnection(); // Conectar a la base de datos

// Middlewares
app.use(cors()); // Permite peticiones de otros dominios (frontend)
app.use(express.json()); // Parsea el body de las peticiones a JSON
app.use(cookieParser()); // Parsea las cookies

// Rutas
app.use("/api/auth", router);

// Escuchar en el puerto
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
