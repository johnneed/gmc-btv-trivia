import type Choice from "./choice.type";

type Question = {
    id: string;
    tags: string[];
    questionText: string;
    choices: Choice[];
    correctAnswerIndex: number;
    answerText: string;
    answerImage?: string;
    answerImageAlt?: string;
    answerImageCaption?: string;
}

export default Question;

