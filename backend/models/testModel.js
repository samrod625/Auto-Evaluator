import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["mcq", "short", "long"],
    required: [true, "Question type is required"],
  },
  questionText: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  marks: {
    type: Number,
    default: 1,
    min: [1, "Marks cannot be less than 1"],
  },
  options: {
    type: [String],
    validate: {
      validator: function (v) {
        return this.type !== "mcq" || (v && v.length >= 2);
      },
      message: "MCQ questions must have at least 2 options",
    },
    trim: true,
  },
  correctOption: {
    type: Number,
    validate: {
      validator: function (v) {
        return this.type !== "mcq" || (v !== undefined && v >= 0);
      },
      message: "Please select a correct option for MCQ questions",
    },
  },
  keywords: {
    type: String,
    trim: true,
  },
});

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Test name is required"],
      trim: true,
      maxlength: [100, "Test name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Test description is required"],
      trim: true,
    },
    timeLimit: {
      type: Number,
      default: 15, // minutes
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one question is required",
      },
    },
    code: {
      type: String,
      unique: true,
      uppercase: true,
      index: true,
    },
    teacherID: {
      type: String,
      required: [true, "Teacher ID is required"],
    },
    studentAttempts: [
      {
        studentID: {
          type: String,
          required: true,
        },
        answers: [
          {
            response: mongoose.Schema.Types.Mixed,
            selectedOption: Number,
          },
        ],
        score: {
          type: Number,
          default: 0,
          min: 0,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["not-started", "in-progress", "submitted"],
          default: "not-started",
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to calculate total marks
testSchema.virtual("totalMarks").get(function () {
  return this.questions.reduce((sum, q) => sum + q.marks, 0);
});

// Indexes for faster queries
testSchema.index({ teacherID: 1, createdAt: -1 });
testSchema.index({ "studentAttempts.studentID": 1 });

export default mongoose.model("Test", testSchema);
