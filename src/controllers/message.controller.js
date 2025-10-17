// src/controllers/message.controller.js

import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { Estudiante } from "../models/estudiante.model.js";
import { Tutor } from "../models/tutor.model.js";

// Obtiene la lista de contactos (conversaciones)
export const getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const conversations = await Message.aggregate([
      // ✅ CORRECCIÓN: Se añade una condición para excluir mensajes
      // donde el emisor y el receptor son la misma persona.
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
          $expr: { $ne: ["$senderId", "$receiverId"] }, // <-- ESTA LÍNEA ES LA SOLUCIÓN
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$lastMessage" } },
      { $sort: { createdAt: -1 } },
    ]);

    const contactDetails = await Promise.all(
      conversations.map(async (convo) => {
        const otherUserId = convo.senderId.equals(userId)
          ? convo.receiverId
          : convo.senderId;
        const otherUserModel = convo.senderId.equals(userId)
          ? convo.receiverModel
          : convo.senderModel;

        const Model = otherUserModel === "Tutor" ? Tutor : Estudiante;
        const user = await Model.findById(otherUserId)
          .select("profile.firstName profile.lastName")
          .lean();

        if (!user) return null;

        return {
          id: otherUserId,
          name: `${user.profile.firstName} ${user.profile.lastName}`,
          avatar: `${user.profile.firstName.charAt(
            0
          )}${user.profile.lastName.charAt(0)}`.toUpperCase(),
          lastMessage: convo.content,
          time: convo.createdAt,
          role: otherUserModel,
        };
      })
    );

    res.status(200).json({ ok: true, data: contactDetails.filter(Boolean) });
  } catch (error) {
    console.error("Error en getConversations:", error);
    res.status(500).json({ ok: false, msg: "Error al obtener conversaciones" });
  }
};

// Obtiene los mensajes entre el usuario logueado y otro usuario
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: "asc" });

    res.status(200).json({ ok: true, data: messages });
  } catch (error) {
    console.error("Error en getMessages:", error);
    res.status(500).json({ ok: false, msg: "Error al obtener mensajes" });
  }
};

// Envía un mensaje
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const senderModel = req.user.role === "student" ? "Estudiante" : "Tutor";
    const { receiverId, receiverModel, content } = req.body;

    if (!receiverId || !content || !receiverModel) {
      return res
        .status(400)
        .json({ ok: false, msg: "Faltan campos requeridos" });
    }

    const newMessage = new Message({
      senderId,
      senderModel,
      receiverId,
      receiverModel,
      content,
    });

    await newMessage.save();

    res.status(201).json({ ok: true, data: newMessage });
  } catch (error) {
    console.error("Error en sendMessage:", error);
    res.status(500).json({ ok: false, msg: "Error al enviar el mensaje" });
  }
};
