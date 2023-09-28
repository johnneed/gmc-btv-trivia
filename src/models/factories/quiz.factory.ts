import { Quiz } from "../types";
import questionFactory from "./question.factory";
import { v4 as uuidv4 } from "uuid";
import { dateFactory } from "./factoryHelpers";

const quizFactory = (data: any): Quiz => ({
    id: typeof data?.id === "string" ? data?.id : uuidv4(),
    title: typeof data?.title === "string" ? data?.title : "",
    publishDate: dateFactory(data?.publishDate, true) as Date,
    image: typeof data?.image === "string" ? data?.image : "",
    questions: (data?.questions || []).map((q: unknown) => questionFactory(q)),
    tags: Array.from(new Set((data?.questions || []).filter((t: unknown) => typeof t === "string"))),
});
export default quizFactory;