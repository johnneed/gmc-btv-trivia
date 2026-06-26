import type Choice from "./choice.type";

type Question = {
  id: string;
  questionText: string;
  choices: Choice[];
  correctAnswerIndex: number;
  answerText: string;
  answerImage?: string;
  answerImageAlt?: string;
  answerImageCaption?: string;
  // no tags field — per-question tagging not implemented
};

export default Question;
