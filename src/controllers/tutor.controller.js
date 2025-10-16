// src/controllers/tutor.controller.js

import { Tutor } from "../models/tutor.model.js";

// Obtener todos los tutores (perfil público)
export const getAllTutors = async (req, res) => {
  try {
    // Buscamos todos los tutores y seleccionamos solo los campos públicos
    const tutors = await Tutor.find().select(
      "profile subjects hourlyRate averageRating"
    );

    if (!tutors || tutors.length === 0) {
      return res
        .status(404)
        .json({ ok: true, msg: "No se encontraron tutores." });
    }

    return res.status(200).json({
      ok: true,
      data: tutors,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ ok: false, msg: "Error en el servidor al buscar tutores." });
  }
};
