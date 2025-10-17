import { Estudiante } from "../models/estudiante.model.js";
import { Tutor } from "../models/tutor.model.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js";

// --- FUNCIÓN AUXILIAR ---
const getModelByRole = (role) => {
    if (role === "student") return Estudiante;
    if (role === "tutor") return Tutor;
    return null;
};

// === GET: Obtener Perfil del Usuario Autenticado (/api/users/me) ===
export const getMyProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const Model = getModelByRole(role);

    if (!Model) {
      return res.status(400).json({ ok: false, msg: "Rol de usuario no válido." });
    }

    // Obtenemos el perfil sin la contraseña
    const userProfile = await Model.findById(id).select("-password");

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

// === PUT: Actualizar Perfil (/api/users/me/profile) ===
export const updateMyProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    // Recogemos solo los campos permitidos: username y los campos anidados de profile
    const { username, profile, subjects, hourlyRate } = req.body; 

    const Model = getModelByRole(role);
    if (!Model) {
        return res.status(400).json({ ok: false, msg: "Rol de usuario no válido." });
    }

    const updateFields = {};
    if (username) updateFields.username = username;
    
    // Mapeo seguro de campos de perfil
    if (profile) {
        if (profile.firstName) updateFields['profile.firstName'] = profile.firstName;
        if (profile.lastName) updateFields['profile.lastName'] = profile.lastName;
        // Permite actualizar biography (incluso a vacío)
        if (profile.biography !== undefined) updateFields['profile.biography'] = profile.biography; 
    }
    
    // Campos específicos del tutor
    if (role === 'tutor') {
        if (subjects) updateFields.subjects = subjects;
        if (hourlyRate !== undefined) updateFields.hourlyRate = hourlyRate;
    }

    const updatedUser = await Model.findByIdAndUpdate(
        id, 
        { $set: updateFields },
        { new: true } // Devuelve el documento actualizado
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado." });
    }

    // Devuelve el JSON actualizado (sin la contraseña)
    return res.status(200).json({ ok: true, msg: "Perfil actualizado.", data: updatedUser });

  } catch (error) {
    // Manejo de error de Mongo (ej: username duplicado - código 11000)
    if (error.code === 11000) {
        return res.status(400).json({ ok: false, msg: "El nombre de usuario ya está en uso." });
    }
    console.error(error);
    return res.status(500).json({ ok: false, msg: "Error en el servidor al actualizar el perfil." });
  }
};

// === PUT: Actualizar Contraseña (/api/users/me/password) ===
export const updatePassword = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { currentPassword, newPassword } = req.body;
        
        const Model = getModelByRole(role);
        if (!Model) {
            return res.status(400).json({ ok: false, msg: "Rol de usuario no válido." });
        }

        // 1. Encontrar al usuario y obtener la hash actual
        // El .select('+password') es crucial si la contraseña está excluida por defecto en el esquema
        const user = await Model.findById(id).select('+password'); 
        
        if (!user) {
            return res.status(404).json({ ok: false, msg: "Usuario no encontrado." });
        }

        // 2. Verificar la contraseña actual
        const isMatch = await comparePassword(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ ok: false, msg: "La contraseña actual es incorrecta." });
        }

        // 3. Hashear y guardar la nueva contraseña
        const hashedNewPassword = await hashPassword(newPassword);
        
        user.password = hashedNewPassword;
        await user.save(); // Guarda el documento, aplicando las validaciones del modelo (ej: minlength)

        return res.status(200).json({ ok: true, msg: "Contraseña actualizada con éxito." });

    } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        // Manejo de errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ ok: false, msg: error.message });
        }
        return res.status(500).json({ ok: false, msg: "Error en el servidor al cambiar la contraseña." });
    }
};