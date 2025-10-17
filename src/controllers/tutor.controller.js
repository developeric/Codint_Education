// src/controllers/tutor.controller.js

import { Tutor } from "../models/tutor.model.js";

// OBTENER TODOS LOS TUTORES (Para Estudiantes)
export const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find().select("profile subjects hourlyRate");
    return res.status(200).json({ ok: true, data: tutors });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error en el servidor." });
  }
};

// OBTENER PERFIL PÚBLICO DE UN TUTOR POR ID
export const getTutorById = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id).select("-password");
    if (!tutor)
      return res.status(404).json({ ok: false, msg: "Tutor no encontrado." });
    return res.status(200).json({ ok: true, data: tutor });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error en el servidor." });
  }
};

// OBTENER EL PERFIL DEL TUTOR QUE HA INICIADO SESIÓN
export const getMyProfile = async (req, res) => {
  try {
    const tutorProfile = await Tutor.findById(req.user.id).select("-password");
    if (!tutorProfile)
      return res.status(404).json({ ok: false, msg: "Perfil no encontrado." });
    return res.status(200).json({ ok: true, data: tutorProfile });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error en el servidor." });
  }
};

// ACTUALIZAR EL PERFIL DEL TUTOR
export const updateMyProfile = async (req, res) => {
  try {
    const { profile, subjects, hourlyRate } = req.body;
    // Actualizamos el perfil anidado de forma segura
    const updateData = {
      "profile.biography": profile.biography,
      subjects,
      hourlyRate,
    };
    const updatedTutor = await Tutor.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );
    return res
      .status(200)
      .json({ ok: true, msg: "Perfil actualizado.", data: updatedTutor });
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, msg: "Error al actualizar el perfil." });
  }
};
