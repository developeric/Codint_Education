// src/routes/tutor.routes.js

import { Router } from "express";
import { getAllTutors } from "../controllers/tutor.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const tutorRouter = Router();

// Ruta para obtener todos los tutores
// Aplicamos el middleware para asegurar que solo usuarios logueados puedan acceder
tutorRouter.get("/tutors", authMiddleware, getAllTutors);

export default tutorRouter;
