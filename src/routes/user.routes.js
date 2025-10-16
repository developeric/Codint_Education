// src/routes/user.routes.js

import { Router } from "express";
import { getMyProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const userRouter = Router();

// Ruta protegida para obtener el perfil del usuario actual
userRouter.get("/users/me", authMiddleware, getMyProfile);

export default userRouter;
