import { Question } from "../types";
import { v4 as uuidv4 } from "uuid";
import choiceFactory from "./choice.factory";

const quizFactory = (data: any): Question => ({
    id: typeof data?.id === "string" ? data?.id : uuidv4(),
    tags: Array.from(new Set((data?.questions || []).filter((t: unknown) => typeof t === "string"))),
    questionText: data.questionText,
    choices: (data?.choices || []).map((c: unknown) => choiceFactory(c)),
    correctAnswerIndex: typeof data?.answerText === "number" ? data?.answerText : 0,
    answerText: typeof data?.answerText === "string" ? data?.answerText : "",
    answerImage: typeof data?.answerImage === "string" ? data?.answerImage : "",
});

export default quizFactory