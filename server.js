import express from "express"
import "dotenv/config"
import cors from "cors"
import cookieParser from 'cookie-parser';

//
import { dbConnection } from "./src/config/database.js";
//
// Inicialización
const PORT = process.env.PORT;
const app = express();
dbConnection(); // Conectar a la base de datos

// Middlewares
app.use(cors()); // Permite peticiones de otros dominios (frontend)
app.use(express.json()); // Parsea el body de las peticiones a JSON
app.use(cookieParser()); // Parsea las cookies

// Rutas
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/users', require('./routes/users.routes'));
// Agrega más rutas aquí (tutores, sesiones, etc.)

// Escuchar en el puerto
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});