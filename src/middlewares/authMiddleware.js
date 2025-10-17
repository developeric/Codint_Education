// src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Extraemos el token de la cookie

  if (!token) {
    return res
      .status(401)
      .json({ ok: false, msg: "No autorizado: No hay token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guardamos los datos del usuario del token en el request
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ ok: false, msg: "No autorizado: Token no válido" });
  }
};
