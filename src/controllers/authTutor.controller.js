// src/controllers/authTutor.controller.js

import { Tutor } from "../models/tutor.model.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

// === REGISTER (Sin cambios) ===
export const registerTutor = async (req, res) => {
  const { username, email, password, profile, subjects, hourlyRate } = req.body;
  try {
    const emailExiste = await Tutor.findOne({ email });
    if (emailExiste)
      return res
        .status(400)
        .json({ ok: false, msg: "Este email ya está registrado" });
    const userExiste = await Tutor.findOne({ username });
    if (userExiste)
      return res
        .status(400)
        .json({ ok: false, msg: "Este nombre de usuario ya está registrado" });
    const hashedPassword = await hashPassword(password);
    const tutor = await Tutor.create({
      username,
      email,
      password: hashedPassword,
      role: "tutor",
      profile,
      subjects,
      hourlyRate,
    });
    const token = generateToken(tutor);
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
          id: tutor._id,
          username: tutor.username,
          role: tutor.role,
          profile: tutor.profile,
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
export const loginTutor = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Tutor.findOne({ username });
    if (!user || user.role !== "tutor")
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

    // ✨ CAMBIO CLAVE: Devolvemos los datos del usuario
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
