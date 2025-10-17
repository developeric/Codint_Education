// src/routes/tutor.routes.js

import { Router } from "express";
// 💡 CORRECCIÓN: Se combinan ambas funciones en una sola línea de importación.
import {
  getAllTutors,
  getStudentsForTutor,
} from "../controllers/tutor.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isTutorMiddleware } from "../middlewares/tutor.middleware.js";

const tutorRouter = Router();

// Ruta para obtener todos los tutores (vista de estudiante)
tutorRouter.get("/tutors", authMiddleware, getAllTutors);

// Ruta para que un tutor obtenga la lista de estudiantes
tutorRouter.get(
  "/tutors/students",
  authMiddleware,
  isTutorMiddleware,
  getStudentsForTutor
);

export default tutorRouter;
