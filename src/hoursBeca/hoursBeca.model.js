import mongoose, { Schema, model } from "mongoose";

const hoursBecaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    hour: {
      type: Number,
      required: true,
      min: 0,
    },
    day: {
      type: Date,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    managerID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Rejected"],
      default: "Pending",
    },
    state: {
      type: String,
      enum: ["Desactive", "Active"],
      default: "Pending",
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default model("HoursBeca", hoursBecaSchema);
