// src/controllers/authEstudiante.controller.js

import { Estudiante } from "../models/estudiante.model.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

// === REGISTER (Sin cambios) ===
export const registerEstudiante = async (req, res) => {
  const { username, email, password, profile } = req.body;
  try {
    const emailExiste = await Estudiante.findOne({ email });
    if (emailExiste)
      return res
        .status(400)
        .json({ ok: false, msg: "Este email ya está registrado" });
    const userExiste = await Estudiante.findOne({ username });
    if (userExiste)
      return res
        .status(400)
        .json({ ok: false, msg: "Este nombre de usuario ya está registrado" });
    const hashedPassword = await hashPassword(password);
    const estudiante = await Estudiante.create({
      username,
      email,
      password: hashedPassword,
      role: "student",
      profile,
    });
    const token = generateToken(estudiante);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 3600000,
    });
    return res
      .status(201)
      .json({
        ok: true,
        msg: "Registrado Correctamente",
        data: {
          id: estudiante._id,
          username: estudiante.username,
          role: estudiante.role,
          profile: estudiante.profile,
        },
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ ok: false, msg: "Error en el servidor al registrar" });
  }
};

// === LOGIN (Con corrección) ===
export const loginEstudiante = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Estudiante.findOne({ username });
    if (!user || user.role !== "student")
      return res
        .status(401)
        .json({ ok: false, msg: "Credenciales incorrectas" });
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword)
      return res
        .status(401)
        .json({ ok: false, msg: "Credenciales incorrectas" });
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 3600000,
    });

    // ✨ CAMBIO CLAVE: Devolvemos los datos del usuario para que el frontend los use
    return res.status(200).json({
      ok: true,
      msg: "Logueado Correctamente",
      data: {
        id: user._id,
        username: user.username,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ ok: false, msg: "Error interno del servidor" });
  }
};
