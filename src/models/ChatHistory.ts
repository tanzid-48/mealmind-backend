import { Schema, model, Document } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  userId: string;
  sessionId: string;
  messages: IChatMessage[];
  createdAt: Date;
}

const chatHistorySchema = new Schema<IChatHistory>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, unique: true },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const ChatHistory = model<IChatHistory>("ChatHistory", chatHistorySchema);
