// src/routes/message.routes.js

import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const messageRouter = Router();

// Todas las rutas requieren que el usuario esté autenticado
messageRouter.use(authMiddleware);

// ✅ CORREGIDO:
// Ruta para obtener la lista de todas las conversaciones del usuario
// GET -> /api/conversations
messageRouter.get("/conversations", getConversations);

// ✅ CORREGIDO:
// Ruta para obtener los mensajes de UNA conversación específica
// GET -> /api/conversations/:otherUserId
messageRouter.get("/conversations/:otherUserId", getMessages);

// ✅ CORREGIDO:
// Ruta para ENVIAR un nuevo mensaje (esta se queda como estaba pero la movemos para claridad)
// POST -> /api/messages
messageRouter.post("/messages", sendMessage);

export default messageRouter;
