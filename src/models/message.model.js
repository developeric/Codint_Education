// src/models/message.model.js

import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Estudiante", "Tutor"],
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ["Estudiante", "Tutor"],
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Un índice compuesto ayuda a la base de datos a buscar conversaciones rápidamente
messageSchema.index({ senderId: 1, receiverId: 1 });

export const Message = model("Message", messageSchema);
