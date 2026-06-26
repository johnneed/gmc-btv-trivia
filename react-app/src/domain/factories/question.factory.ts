import { v4 as uuidv4 } from "uuid";
import type Question from "../types/question.type";
import { createChoice } from "./choice.factory";

const CHOICE_COUNT = 4;

const createQuestion = (overrides: Partial<Question> = {}): Question => {
  const base: Question = {
    id: uuidv4(),
    questionText: "",
    choices: Array.from({ length: CHOICE_COUNT }, () => createChoice()),
    correctAnswerIndex: 0,
    answerText: "",
  };
  // ponytail: always enforce exactly 4 choices regardless of overrides
  return { ...base, ...overrides, choices: base.choices };
};

export { createQuestion };
