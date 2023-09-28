import { Trivia } from "../types";
import quizFactory from "./quiz.factory";

const TriviaFactory = (data: any): Trivia => ({
    quizzes: (data?.quizzes || []).map((q: unknown) => quizFactory(q)),
});
export default TriviaFactory;