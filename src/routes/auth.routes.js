import { Router } from "express";
import { aplicarValidaciones } from "../middlewares/validator.js"; // Middleware que verifica si hay errores
import {
  registerEstudiante,
  loginEstudiante,
  logoutEstudiante,
} from "../controllers/authEstudiante.controller.js";
import {
  registerTutor,
  loginTutor,
} from "../controllers/authTutor.controller.js";
import {
  registerEstudianteValidations,
  registerTutorValidations,
  loginValidations,
} from "../middlewares/validations/authValidator.js"; // Importa las nuevas validaciones

const authRouter = Router();

// =========================================================
// RUTAS DE ESTUDIANTE
// =========================================================

// REGISTRO DE ESTUDIANTE
authRouter.post(
  "/register/student",
  registerEstudianteValidations, // 1. Aplica las reglas
  aplicarValidaciones, // 2. Muestra los errores (si existen)
  registerEstudiante // 3. Ejecuta el controlador
);

// LOGIN DE ESTUDIANTE
authRouter.post(
  "/login/student",
  loginValidations,
  aplicarValidaciones,
  loginEstudiante
);

// =========================================================
// RUTAS DE TUTOR
// =========================================================

// REGISTRO DE TUTOR
authRouter.post(
  "/register/tutor",
  registerTutorValidations,
  aplicarValidaciones,
  registerTutor
);

// LOGIN DE TUTOR
authRouter.post(
  "/login/tutor",
  loginValidations,
  aplicarValidaciones,
  loginTutor
);

// =========================================================
// LOGOUT (Genérico)
// =========================================================
authRouter.post("/logout", logoutEstudiante);

export default authRouter;
