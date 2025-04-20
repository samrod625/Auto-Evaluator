import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ["mcq", "short", "long"], required: true },
  questionText: { type: String, required: true },
  marks: { type: Number, default: 1 },
  options: [String],
  correctOption: Number,
  keywords: String,
});

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  timeLimit: { type: Number, default: 30 },
  questions: [questionSchema],
  code: { type: String, unique: true },
});

export default mongoose.model("Test", testSchema);
