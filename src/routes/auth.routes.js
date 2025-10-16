// src/routes/auth.routes.js

import { Router } from "express";
import { aplicarValidaciones } from "../middlewares/validator.js";
import {
  registerEstudiante,
  loginEstudiante,
  // Ya no importamos logoutEstudiante
} from "../controllers/authEstudiante.controller.js";
import {
  registerTutor,
  loginTutor,
} from "../controllers/authTutor.controller.js";
import {
  registerEstudianteValidations,
  registerTutorValidations,
  loginValidations,
} from "../middlewares/validations/authValidator.js";

const authRouter = Router();

// ✨ MEJORA: Creamos una función de logout genérica aquí mismo
const logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ ok: true, msg: "Logout exitoso" });
};

// --- RUTAS DE ESTUDIANTE ---
authRouter.post(
  "/register/student",
  registerEstudianteValidations,
  aplicarValidaciones,
  registerEstudiante
);
authRouter.post(
  "/login/student",
  loginValidations,
  aplicarValidaciones,
  loginEstudiante
);

// --- RUTAS DE TUTOR ---
authRouter.post(
  "/register/tutor",
  registerTutorValidations,
  aplicarValidaciones,
  registerTutor
);
authRouter.post(
  "/login/tutor",
  loginValidations,
  aplicarValidaciones,
  loginTutor
);

// --- LOGOUT (Genérico) ---
authRouter.post("/logout", logout); // ✨ Usamos la nueva función genérica

export default authRouter;
