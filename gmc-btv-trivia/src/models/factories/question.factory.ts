import { Question } from "../types";
import { v4 as uuidv4 } from "uuid";
import choiceFactory from "./choice.factory";

const questionFactory = (data?: any): Question => ({
    id: typeof data?.id === "string" ? data?.id : uuidv4(),
    tags: Array.from<string>(new Set((data?.tags || []).filter((t: unknown) => typeof t === "string"))),
    questionText: data.questionText,
    choices: (data?.choices || []).map((c: unknown) => choiceFactory(c)),
    correctAnswerIndex: typeof data?.correctAnswerIndex === "number" ? data?.correctAnswerIndex : 0,
    answerText: typeof data?.answerText === "string" ? data?.answerText : "",
    answerImage: typeof data?.answerImage === "string" ? data?.answerImage : "",
    answerImageAlt: typeof data?.answerImageAlt === "string" ? data?.answerImageAlt : "answer illustration",
    answerImageCaption: typeof data?.answerImageCaption === "string" ? data?.answerImageCaption : ""
});

export default questionFactory;