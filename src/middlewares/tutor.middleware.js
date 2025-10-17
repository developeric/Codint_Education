// src/middlewares/tutor.middleware.js

export const isTutorMiddleware = (req, res, next) => {
  // Este middleware se usa DESPUÉS de authMiddleware,
  // por lo que ya tenemos acceso a req.user
  if (req.user && req.user.role === "tutor") {
    next(); // El usuario es un tutor, continuar
  } else {
    res
      .status(403)
      .json({ ok: false, msg: "Acceso denegado. Se requiere rol de tutor." });
  }
};
