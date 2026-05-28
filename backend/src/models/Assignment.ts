import mongoose, { Schema, Document } from "mongoose";

// ---------------------------------------------------------------------------
// TypeScript interfaces
// ---------------------------------------------------------------------------

export interface IQuestion {
  text: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  options?: string[];
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IGeneratedPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: string;
  sections: ISection[];
}

export interface IQuestionType {
  type: "mcq" | "short_answer" | "long_answer" | "true_false" | "numerical" | "diagram";
  count: number;
  marksEach: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  dueDate: Date;
  instructions?: string;
  questionTypes: IQuestionType[];
  totalMarks: number;
  status: "pending" | "queued" | "generating" | "completed" | "failed";
  jobId?: string;
  generatedPaper?: IGeneratedPaper;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Mongoose schema
// ---------------------------------------------------------------------------

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    marks: { type: Number, required: true },
    options: { type: [String], default: undefined },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false }
);

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    duration: { type: String, required: true },
    sections: { type: [SectionSchema], required: true },
  },
  { _id: false }
);

const QuestionTypeSchema = new Schema<IQuestionType>(
  {
    type: {
      type: String,
      enum: ["mcq", "short_answer", "long_answer", "true_false", "numerical", "diagram"],
      required: true,
    },
    count: { type: Number, required: true },
    marksEach: { type: Number, required: true },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    dueDate: { type: Date, required: true },
    instructions: { type: String },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    totalMarks: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "queued", "generating", "completed", "failed"],
      default: "pending",
    },
    jobId: { type: String },
    generatedPaper: { type: GeneratedPaperSchema },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<IAssignment>("Assignment", AssignmentSchema);
