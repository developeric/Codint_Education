import { validationResult } from "express-validator";
export const aplicarValidaciones = (req, res, next) => {
  // Exportación con nombre
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.mapped() });
  }
  next();
};
