import { v4 as uuidv4 } from "uuid";
import type Quiz from "../types/quiz.type";

const createQuiz = (overrides: Partial<Quiz> = {}): Quiz => ({
  id: uuidv4(),
  title: "",
  author: "",
  authorId: 0,
  publishDate: Date.now(),
  status: "draft",
  questions: [],
  tags: [],
  ...overrides,
});

export { createQuiz };
