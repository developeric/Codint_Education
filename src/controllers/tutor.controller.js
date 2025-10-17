import { Tutor } from "../models/tutor.model.js";

// === GET: Obtener todos los tutores disponibles (/api/tutors) ===
export const getAllTutors = async (req, res) => {
    try {
        // Busca todos los documentos en la colección de tutores
        // Excluye la contraseña y la versión key (__v)
        const tutors = await Tutor.find(
            {}, 
            { 
                password: 0, 
                __v: 0,
            } 
        ); 
        
        if (!tutors || tutors.length === 0) {
            return res.status(404).json({ 
                ok: false, 
                message: "No se encontraron tutores disponibles." 
            });
        }

        // Devuelve la lista completa de tutores con todos sus datos públicos
        return res.status(200).json({ ok: true, data: tutors });
    } catch (error) {
        console.error("Error fetching all tutors:", error);
        return res.status(500).json({ 
            ok: false, 
            message: "Error interno del servidor al obtener tutores." 
        });
    }
};

// === GET: Obtener un tutor por ID (Para perfil individual) ===
export const getTutorById = async (req, res) => {
    try {
        const { id } = req.params;
        const tutor = await Tutor.findById(id).select('-password -__v');

        if (!tutor) {
            return res.status(404).json({ ok: false, message: "Tutor no encontrado." });
        }

        return res.status(200).json({ ok: true, data: tutor });
    } catch (error) {
        console.error("Error fetching tutor by ID:", error);
        return res.status(500).json({ ok: false, message: "Error interno del servidor." });
    }
};