// src/controllers/user.controller.js

import { Estudiante } from "../models/estudiante.model.js";
import { Tutor } from "../models/tutor.model.js";

// Obtener el perfil del usuario autenticado (estudiante o tutor)
export const getMyProfile = async (req, res) => {
  try {
    const { id, role } = req.user; // Datos extraídos del token por authMiddleware
    let userProfile;

    if (role === "student") {
      userProfile = await Estudiante.findById(id).select("-password");
    } else if (role === "tutor") {
      userProfile = await Tutor.findById(id).select("-password");
    }

    if (!userProfile) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado." });
    }

    return res.status(200).json({ ok: true, data: userProfile });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, msg: "Error en el servidor al obtener el perfil." });
  }
};
