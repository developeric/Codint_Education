// src/controllers/auth.estudiante.js

import { Estudiante } from "../models/estudiante.model.js"; // Importación con nombre
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js"; // Importación con nombre
import { generateToken } from "../helpers/jwt.helper.js"; // Importación con nombre

// ... el resto del código del controlador permanece igual
// ... (export const registerEstudiante, export const loginEstudiante, etc.)

// === REGISTER ESTUDIANTE ===
export const registerEstudiante = async (req, res) => {
  // Desestructuración, asegurando la captura de 'profile'
  const { username, email, password, role, profile } = req.body;

  // El campo 'role' debe ser 'student' para este endpoint
  if (role && role !== "student") {
    return res
      .status(400)
      .json({ ok: false, msg: "Rol de registro incorrecto." });
  }

  try {
    // 1. Verificar existencia
    const emailExiste = await Estudiante.findOne({ email: email });
    if (emailExiste) {
      return res
        .status(400)
        .json({ ok: false, msg: "Este email ya está Registrado" });
    }

    const userExiste = await Estudiante.findOne({ username: username });
    if (userExiste) {
      return res
        .status(400)
        .json({ ok: false, msg: "Este Username ya está Registrado" });
    }

    // 2. Hashear la contraseña
    const hashedPassword = await hashPassword(password); //

    // 3. Crear el estudiante (usando el modelo Estudiante)
    const estudiante = await Estudiante.create({
      username,
      email,
      password: hashedPassword,
      // Usamos 'student' como valor predeterminado, aunque también viene del modelo
      role: "student",
      profile,
    });

    // 4. Generar Token (El helper de JWT maneja la estructura del 'profile')
    const token = generateToken(estudiante); //

    // 5. Configurar Cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hora (o usa process.env.JWT_EXPIRE_IN)
    });

    return res.status(201).json({
      ok: true,
      msg: "Registrado Correctamente",
      data: {
        id: estudiante._id,
        username: estudiante.username,
        role: estudiante.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error en el Servidor al Registrar",
      data: null,
    });
  }
};

// === LOGIN ESTUDIANTE ===
export const loginEstudiante = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Estudiante.findOne({ username });

    if (!user) {
      return res
        .status(400)
        .json({ ok: false, msg: "Credenciales incorrectas" });
    }

    // Asegurar que solo los estudiantes puedan iniciar sesión aquí
    if (user.role !== "student") {
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

// === LOGOUT ESTUDIANTE ===
export const logoutEstudiante = (req, res) => {
  res.clearCookie("token"); // Eliminar cookie del navegador
  return res.json({ ok: true, msg: "Logout exitoso" });
};
