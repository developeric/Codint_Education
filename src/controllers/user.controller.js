import { Estudiante } from "../models/estudiante.model.js";

// Obtener el perfil del usuario autenticado (estudiante o usuario general)
export const getMyProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    
    // Aquí solo manejamos estudiantes
    const userProfile = await Estudiante.findById(id).select("-password");

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

// 💡 FUNCIÓN AÑADIDA: Actualizar el perfil del usuario (Estudiante)
export const updateMyProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    // Solo recogemos los campos permitidos
    const { username, profile } = req.body; 

    if (role !== "student") {
        return res.status(403).json({ ok: false, msg: "Permisos insuficientes para actualizar este perfil." });
    }

    const updateFields = {};
    // Solo permitimos actualizar el username y los campos de perfil
    if (username) updateFields.username = username;
    
    if (profile) {
        if (profile.firstName) updateFields['profile.firstName'] = profile.firstName;
        if (profile.lastName) updateFields['profile.lastName'] = profile.lastName;
        if (profile.biography) updateFields['profile.biography'] = profile.biography;
    }
    
    const updatedUser = await Estudiante.findByIdAndUpdate(
        id, 
        { $set: updateFields },
        { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado." });
    }

    // Devolvemos el JSON actualizado
    return res.status(200).json({ ok: true, msg: "Perfil actualizado.", data: updatedUser });

  } catch (error) {
    // Manejo de error de Mongo (ej: username duplicado - código 11000)
    if (error.code === 11000) {
        return res.status(400).json({ ok: false, msg: "El nombre de usuario ya está en uso." });
    }
    console.error(error);
    // Aseguramos que los errores internos también sean JSON
    return res.status(500).json({ ok: false, msg: "Error en el servidor al actualizar el perfil." });
  }
};