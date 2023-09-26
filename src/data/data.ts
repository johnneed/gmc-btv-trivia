import data from "./trivia.json";
import { quizFactory } from "../models/factories";

const quizzes =  (data.quizzes).map(q => quizFactory(q));
export default quizzes;