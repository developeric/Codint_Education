export default function isTutorMiddleware(req, res, next) {
  // requiere que authMiddleware ya haya poblado req.user
  if (!req.user) {
    return res.status(401).json({ ok: false, msg: "No autenticado" });
  }
  if (req.user.role !== "tutor") {
    return res.status(403).json({ ok: false, msg: "Acceso solo para tutores" });
  }
  next();
}
