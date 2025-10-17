import { Schema, model } from "mongoose";
// Eliminada la importación no utilizada 'Types' y 'type' de 'os'

// 1. Definición del Sub-Esquema para Profile (Embebido)
// Usamos { _id: false } para indicar que este subdocumento no necesita un _id propio,
// aunque Mongoose lo añade por defecto si no se especifica.

// 2. Definición del Esquema Principal (Estudiante)
const estudianteSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Es buena práctica añadir una validación de email (ej. usando un regex)
    },
    password: {
      type: String,
      required: true,
      // Nota: El hashing de la contraseña debe hacerse antes de guardar
      // (según tu bcrypt.helper.js)
    },

    // 3. Campo 'role' añadido para ser coherente con tu JWT helper
    role: {
      type: String,
      enum: ["student", "tutor", "admin"], // Define los roles permitidos
      default: "student",
      required: true,
    },

    // 4. Inclusión del Subdocumento Embebido
    profile: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      // Campo que aparece en tu JWT helper
      biography: {
        type: String,
        default: "",
      },
      avatarUrl: {
        type: String,
        // Puedes poner una URL de avatar por defecto
        default: "https://i.imgur.com/2Y0WbU0.png",
      }, // Asegura que los datos del perfil siempre estén presentes
    },
  },
  {
    timestamps: false, // Añade 'createdAt' y 'updatedAt' automáticamente
  }
);

// 5. Exportación del Modelo
export const Estudiante = model("Estudiante", estudianteSchema); // Correcto