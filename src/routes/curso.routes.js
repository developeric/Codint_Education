// src/routes/curso.routes.js

import { Router } from "express";
// Importar controladores necesarios
import {
  getAllCourses,
  createCourse,
  getTutorCourses,
  updateCourse,
  deleteCourse,
  joinCourse,
  getStudentCourses,
} from "../controllers/curso.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import isTutorMiddleware from "../middlewares/isTutorMiddleware.js";

const cursoRouter = Router();

// RUTAS PÚBLICAS / ESPECÍFICAS (orden importante)
// Obtener todos los cursos (estudiantes)
cursoRouter.get("/", authMiddleware, getAllCourses);

// Obtener las clases en las que está inscrito el estudiante
cursoRouter.get("/inscritas", authMiddleware, getStudentCourses);

// Estudiante se une a una clase
cursoRouter.post("/:id/join", authMiddleware, joinCourse);

// Rutas para tutores (crear, listar propios, editar, eliminar)
cursoRouter.post("/", authMiddleware, isTutorMiddleware, createCourse);

// Obtener cursos del tutor logueado
cursoRouter.get("/me", authMiddleware, isTutorMiddleware, getTutorCourses);

// Editar y eliminar (rutas con :id al final)
cursoRouter.put("/:id", authMiddleware, isTutorMiddleware, updateCourse);
cursoRouter.delete("/:id", authMiddleware, isTutorMiddleware, deleteCourse);

export default cursoRouter;
