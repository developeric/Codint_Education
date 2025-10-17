// src/models/curso.model.js

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "El título del curso es obligatorio."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria."],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "La materia es obligatoria."],
      trim: true,
    },
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    // Alumnos inscritos
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Estudiante",
      },
    ],
  },
  { timestamps: true }
);

export default model("Curso", courseSchema);
