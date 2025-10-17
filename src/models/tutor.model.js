import { Schema, model } from "mongoose";

const tutorSchema = new Schema(
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
      // Se recomienda añadir una validación de email aquí
    },
    password: {
      type: String,
      required: true,
      // Recordatorio: Usa tu helper de bcrypt para hashear antes de guardar.
    },

    // Campo 'role' ajustado a 'tutor' para coherencia con tu JWT helper
    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      default: "tutor", // Valor por defecto clave
      required: true,
    },

    // Subdocumento Embebido (Profile) - Necesario para la información del JWT
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
      // Este es el campo 'biography' que se mapea a la biografía del tutor
      biography: { 
        type: String,
        default: "",
        maxlength: 500 // Límite útil para una descripción de perfil
      },
      avatarUrl: {
        type: String,
        default: "https://i.imgur.com/TutorDefault.png",
      },
    },

    // Campos Específicos para la Plataforma de Tutoría
    subjects: {
      type: [String], // Array de strings para las materias que puede enseñar
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'El tutor debe especificar al menos una materia.'
      }
    },
    
    hourlyRate: {
      type: Number,
      default: 0,
      min: 0, 
      max: 15000,// Ajustado para permitir tarifas más altas
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    
    isVerified: {
        type: Boolean,
        default: false, // Indica si el tutor ha pasado un proceso de verificación
    }

  },
  {
    timestamps: true, // Registra 'createdAt' y 'updatedAt'
  }
);

// Exportación del Modelo
export const Tutor = model("Tutor", tutorSchema);