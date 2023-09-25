import type Choice from './choice';

type Question = {
    id: string;
    publish: Date;
    tags?: string[];
    questionText: string;
    choices: Choice[];
    correctAnswerIndex: number;
    answerText: string;
    answerImage?: string;
}

export default Question