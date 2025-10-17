// src/controllers/curso.controller.js

import Curso from "../models/curso.model.js";

// Obtener todos los cursos (visibles para estudiantes)
export const getAllCourses = async (req, res) => {
  try {
    const cursos = await Curso.find().populate("tutor", "username profile");
    return res.status(200).json({ ok: true, data: cursos });
  } catch (error) {
    console.error("getAllCourses error:", error);
    return res.status(500).json({ ok: false, msg: "Error al obtener cursos" });
  }
};

// Crear un curso (solo tutor)
export const createCourse = async (req, res) => {
  try {
    if (req.user?.role !== "tutor") {
      return res
        .status(403)
        .json({ ok: false, msg: "Solo tutores pueden crear clases" });
    }
    const { title, description, subject } = req.body;
    const nuevo = new Curso({
      title,
      description,
      subject,
      tutor: req.user.id,
    });
    await nuevo.save();
    return res.status(201).json({ ok: true, data: nuevo });
  } catch (error) {
    console.error("createCourse error:", error);
    return res.status(500).json({ ok: false, msg: "Error al crear clase" });
  }
};

// Obtener cursos del tutor logueado
export const getTutorCourses = async (req, res) => {
  try {
    if (req.user?.role !== "tutor") {
      return res.status(403).json({ ok: false, msg: "Acceso restringido" });
    }
    const cursos = await Curso.find({ tutor: req.user.id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ ok: true, data: cursos });
  } catch (error) {
    console.error("getTutorCourses error:", error);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener tus clases" });
  }
};

// Actualizar curso (solo tutor propietario)
export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const tutorId = req.user?.id;
    const curso = await Curso.findById(courseId);
    if (!curso)
      return res.status(404).json({ ok: false, msg: "Clase no encontrada" });
    if (curso.tutor.toString() !== tutorId)
      return res.status(403).json({ ok: false, msg: "No autorizado" });

    const { title, description, subject } = req.body;
    if (title !== undefined) curso.title = title;
    if (description !== undefined) curso.description = description;
    if (subject !== undefined) curso.subject = subject;

    await curso.save();
    return res.status(200).json({ ok: true, data: curso });
  } catch (error) {
    console.error("updateCourse error:", error);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al actualizar la clase" });
  }
};

// Eliminar curso (solo tutor propietario)
export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const tutorId = req.user?.id;
    const curso = await Curso.findById(courseId);
    if (!curso)
      return res.status(404).json({ ok: false, msg: "Clase no encontrada" });
    if (curso.tutor.toString() !== tutorId)
      return res.status(403).json({ ok: false, msg: "No autorizado" });

    await Curso.findByIdAndDelete(courseId);
    return res.status(200).json({ ok: true, msg: "Clase eliminada" });
  } catch (error) {
    console.error("deleteCourse error:", error);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al eliminar la clase" });
  }
};

// Estudiante se une a una clase
export const joinCourse = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res
        .status(403)
        .json({ ok: false, msg: "Solo estudiantes pueden unirse" });
    }
    const courseId = req.params.id;
    const userId = req.user.id;
    const curso = await Curso.findById(courseId);
    if (!curso)
      return res.status(404).json({ ok: false, msg: "Clase no encontrada" });

    if (!Array.isArray(curso.students)) curso.students = [];
    if (curso.students.some((s) => s.toString() === userId)) {
      return res
        .status(200)
        .json({ ok: true, msg: "Ya inscrito", data: curso });
    }
    curso.students.push(userId);
    await curso.save();
    return res
      .status(200)
      .json({ ok: true, msg: "Inscripción exitosa", data: curso });
  } catch (error) {
    console.error("joinCourse error:", error);
    return res.status(500).json({ ok: false, msg: "Error al inscribirse" });
  }
};

// Obtener las clases en las que está inscrito el estudiante
export const getStudentCourses = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ ok: false, msg: "Solo estudiantes" });
    }
    const userId = req.user.id;
    const cursos = await Curso.find({ students: userId }).populate(
      "tutor",
      "username profile"
    );
    return res.status(200).json({ ok: true, data: cursos });
  } catch (error) {
    console.error("getStudentCourses error:", error);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener clases inscritas" });
  }
};
