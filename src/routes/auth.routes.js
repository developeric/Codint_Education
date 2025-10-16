import { Router } from "express";
import { aplicarValidaciones } from "../middlewares/validator.js"; // Middleware que verifica si hay errores
import {
  registerEstudiante,
  loginEstudiante,
  logoutEstudiante,
} from "../controllers/auth.estudiante.js";
import { registerTutor, loginTutor } from "../controllers/auth.tutor.js";
import {
  registerEstudianteValidations,
  registerTutorValidations,
  loginValidations,
} from "../middlewares/validations/authValidator.js"; // Importa las nuevas validaciones

const router = Router();

// =========================================================
// RUTAS DE ESTUDIANTE
// =========================================================

// REGISTRO DE ESTUDIANTE
router.post(
  "/register/student",
  registerEstudianteValidations, // 1. Aplica las reglas
  aplicarValidaciones, // 2. Muestra los errores (si existen)
  registerEstudiante // 3. Ejecuta el controlador
);

// LOGIN DE ESTUDIANTE
router.post(
  "/login/student",
  loginValidations,
  aplicarValidaciones,
  loginEstudiante
);

// =========================================================
// RUTAS DE TUTOR
// =========================================================

// REGISTRO DE TUTOR
router.post(
  "/register/tutor",
  registerTutorValidations,
  aplicarValidaciones,
  registerTutor
);

// LOGIN DE TUTOR
router.post("/login/tutor", loginValidations, aplicarValidaciones, loginTutor);

// =========================================================
// LOGOUT (Genérico)
// =========================================================
router.post("/logout", logoutEstudiante);

export default router;
