// src/routes/user.routes.js

import { Router } from "express";
import { getMyProfile, updateMyProfile ,updatePassword} from "../controllers/user.controller.js"; 
import { authMiddleware } from "../middlewares/authMiddleware.js";

const userRouter = Router();

// Ruta protegida para obtener el perfil del usuario actual
userRouter.get("/users/me", authMiddleware, getMyProfile);

// 🚨 RUTA CRÍTICA AÑADIDA: PUT para actualizar el perfil del estudiante
userRouter.put("/users/me/profile", authMiddleware, updateMyProfile);
userRouter.put("/users/me/password", authMiddleware, updatePassword);
export default userRouter;