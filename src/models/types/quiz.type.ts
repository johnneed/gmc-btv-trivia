import Question from "./question.type";

type Quiz = {
    id: string;
    title: string;
    author: string;
    publishDate: number;
    image?: string
    questions: Question[];
    tags: string[];
};

export default Quiz;

