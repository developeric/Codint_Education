import { body } from "express-validator";

// =========================================================
// REGLAS BASE REUTILIZABLES
// =========================================================

const authBaseValidations = [
  body("username")
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio")
    .isLength({ min: 3 })
    .withMessage("El nombre de usuario debe tener al menos 3 caracteres")
    .trim()
    .escape(),

  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
];

const profileBaseValidations = [
  body("profile.firstName")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .trim()
    .escape(),
    
  body("profile.lastName")
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .trim()
    .escape(),
    
  // El campo biography es opcional, pero se valida su longitud si se proporciona
  body("profile.biography")
    .optional()
    .isString()
    .withMessage("La biografía debe ser texto")
    .isLength({ max: 500 }) // Consistente con el modelo Tutor
    .withMessage("La biografía no puede exceder los 500 caracteres"),

  body("profile.avatarUrl")
    .optional()
    .isURL()
    .withMessage("El Avatar URL debe ser una URL válida"),
];

// =========================================================
// 1. VALIDACIONES DE REGISTRO PARA ESTUDIANTE
// =========================================================

export const registerEstudianteValidations = [
  // Campos de Autenticación y Perfil
  ...authBaseValidations,
  ...profileBaseValidations,

  // Validación de Rol (se asegura que el rol sea 'student')
  body("role")
    .optional()
    .custom((value) => {
      if (value && value !== "student") {
        throw new Error("Rol de estudiante incorrecto.");
      }
      return true;
    }),
];


// =========================================================
// 2. VALIDACIONES DE REGISTRO PARA TUTOR
// =========================================================

export const registerTutorValidations = [
  // Campos de Autenticación y Perfil
  ...authBaseValidations,
  ...profileBaseValidations,

  // Campos Específicos del Tutor
  body("subjects")
    .isArray({ min: 1 })
    .withMessage("Debe especificar al menos una materia de enseñanza"),
    
  body("hourlyRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("La tarifa por hora debe ser un número positivo"),

  // Validación de Rol (se asegura que el rol sea 'tutor')
  body("role")
    .optional()
    .custom((value) => {
      if (value && value !== "tutor") {
        throw new Error("Rol de tutor incorrecto.");
      }
      return true;
    }),
];

// =========================================================
// 3. VALIDACIONES DE LOGIN (Común)
// =========================================================

export const loginValidations = [
  body("username").notEmpty().withMessage("El nombre de usuario es obligatorio").trim().escape(),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];