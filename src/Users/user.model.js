import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    carne: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "MANEGER", "ADMIN"],
      default: "USER",
    },
    statusAccount: {
      type: String,
      enum: ["Pending", "Active"],
      default: "Pending",
    },
    verification: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    horasBecaDone: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default model("User", userSchema);
