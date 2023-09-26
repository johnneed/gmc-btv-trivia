import Question from "./question.type";

type Quiz = {
    id: string;
    title: string;
    publishDate: Date;
    image?: string
    questions: Question[];
    tags: string[];
};

export default Quiz;

