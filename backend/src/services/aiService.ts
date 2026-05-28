import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Initialise Gemini
// ---------------------------------------------------------------------------

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️  GEMINI_API_KEY is not set — AI generation will fail at runtime");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerateParams {
  title: string;
  subject: string;
  instructions: string;
  questionTypes: Array<{ type: string; count: number; marksEach: number }>;
}

interface GeneratedPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: string;
  sections: Array<{
    title: string;
    instruction: string;
    questions: Array<{
      text: string;
      difficulty: "Easy" | "Medium" | "Hard";
      marks: number;
      options?: string[];
    }>;
  }>;
}

// ---------------------------------------------------------------------------
// Human-readable label for each question type
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  mcq: "Multiple Choice Questions (MCQ)",
  short_answer: "Short Answer Questions",
  long_answer: "Long Answer Questions",
  true_false: "True/False Questions",
  numerical: "Numerical Problems",
  diagram: "Diagram/Graph-Based Questions",
};

// ---------------------------------------------------------------------------
// Generate question paper
// ---------------------------------------------------------------------------

export async function generateQuestionPaper(params: GenerateParams): Promise<GeneratedPaper> {
  const { title, subject, instructions, questionTypes } = params;

  const totalMarks = questionTypes.reduce((sum, qt) => sum + qt.count * qt.marksEach, 0);

  // Build question-type breakdown for the prompt
  const qtDescription = questionTypes
    .map((qt) => {
      const label = TYPE_LABELS[qt.type] || qt.type;
      return `- ${qt.count} ${label} worth ${qt.marksEach} marks each`;
    })
    .join("\n");

  const prompt = `You are an expert teacher creating a question paper.

Subject: ${subject}
Title: ${title}
Total Marks: ${totalMarks}
${instructions ? `Teacher Instructions: ${instructions}` : ""}

Create a question paper with the following question types:
${qtDescription}

Rules:
1. Group questions into sections — one section per question type.
2. Each section should have a clear title (e.g., "Section A - Multiple Choice Questions") and an instruction line.
3. Assign a realistic difficulty level to each question: "Easy", "Medium", or "Hard". Mix difficulties within each section.
4. For MCQ questions, provide exactly 4 options labeled "A. ...", "B. ...", "C. ...", "D. ...".
5. For non-MCQ questions, do NOT include an "options" field.
6. Make questions relevant, educational, and appropriate for the subject.
7. Suggest a reasonable exam duration based on the total marks and question types.

Respond with ONLY a valid JSON object. No markdown. No explanation. No backticks. Just raw JSON.

The JSON must follow this exact structure:
{
  "title": "${title}",
  "subject": "${subject}",
  "totalMarks": ${totalMarks},
  "duration": "X hours",
  "sections": [
    {
      "title": "Section A - Multiple Choice Questions",
      "instruction": "Choose the correct answer for each question.",
      "questions": [
        {
          "text": "Question text here",
          "difficulty": "Easy",
          "marks": 2,
          "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"]
        }
      ]
    }
  ]
}`;

  // Call Gemini with a 60-second timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    clearTimeout(timeout);

    const responseText = result.response.text();

    // Strip any accidental markdown code fences
    const cleaned = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      const parsed: GeneratedPaper = JSON.parse(cleaned);
      return parsed;
    } catch {
      console.error("Raw Gemini response:", responseText);
      throw new Error("AI returned invalid JSON structure");
    }
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("AI generation timed out after 60 seconds");
    }
    throw err;
  }
}
