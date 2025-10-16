// src/controllers/auth.tutor.js

import { Tutor } from "../models/tutor.model.js"; // Importación con nombre
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js"; // Importación con nombre
import { generateToken } from "../helpers/jwt.helper.js"; // Importación con nombre

// ... el resto del código del controlador permanece igual
// ... (export const registerTutor, export const loginTutor, etc.)
// === REGISTER TUTOR ===
export const registerTutor = async (req, res) => {
  // Desestructuración, incluyendo campos específicos del tutor
  const { username, email, password, role, profile, subjects, hourlyRate } =
    req.body;

  // El campo 'role' debe ser 'tutor' para este endpoint
  if (role && role !== "tutor") {
    return res
      .status(400)
      .json({ ok: false, msg: "Rol de registro incorrecto." });
  }

  try {
    // 1. Verificar existencia
    const emailExiste = await Tutor.findOne({ email });
    if (emailExiste) {
      return res
        .status(400)
        .json({ ok: false, msg: "Este email ya está Registrado" });
    }

    const userExiste = await Tutor.findOne({ username });
    if (userExiste) {
      return res
        .status(400)
        .json({ ok: false, msg: "Este Username ya está Registrado" });
    }

    // Validar subjects (importante para el perfil del tutor)
    if (!subjects || subjects.length === 0) {
      return res
        .status(400)
        .json({ ok: false, msg: "Debe especificar al menos una materia." });
    }

    // 2. Hashear la contraseña
    const hashedPassword = await hashPassword(password); //

    // 3. Crear el tutor (usando el modelo Tutor)
    const tutor = await Tutor.create({
      username,
      email,
      password: hashedPassword,
      role: "tutor", // Usamos 'tutor' como valor fijo para este endpoint
      profile,
      subjects,
      hourlyRate,
      // averageRating y isVerified usarán sus valores por defecto
    });

    // 4. Generar Token
    const token = generateToken(tutor); //

    // 5. Configurar Cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hora
    });

    return res.status(201).json({
      ok: true,
      msg: "Registrado Correctamente",
      data: {
        id: tutor._id,
        username: tutor.username,
        role: tutor.role,
      },
    });
  } catch (error) {
    console.log(error);
    // Errores de validación de Mongoose (como 'required' o 'enum')
    if (error.name === "ValidationError") {
      return res.status(400).json({ ok: false, msg: error.message });
    }
    return res
      .status(500)
      .json({
        ok: false,
        msg: "Error en el Servidor al Registrar",
        data: null,
      });
  }
};

// === LOGIN TUTOR ===
export const loginTutor = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Tutor.findOne({ username });

    if (!user) {
      return res
        .status(400)
        .json({ ok: false, msg: "Credenciales incorrectas" });
    }

    // Asegurar que solo los tutores puedan iniciar sesión aquí
    if (user.role !== "tutor") {
      return res
        .status(403)
        .json({ ok: false, msg: "Acceso denegado para este tipo de usuario." });
    }

    const validPassword = await comparePassword(password, user.password); //

    if (!validPassword) {
      return res
        .status(401)
        .json({ ok: false, msg: "Credenciales incorrectas" });
    }

    const token = generateToken(user); //

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });

    return res.status(200).json({ ok: true, msg: "Logueado Correctamente" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ ok: false, msg: "Error Interno del Servidor" });
  }
};

// === LOGOUT TUTOR ===
export const logoutTutor = (req, res) => {
  res.clearCookie("token");
  return res.json({ ok: true, msg: "Logout exitoso" });
};
