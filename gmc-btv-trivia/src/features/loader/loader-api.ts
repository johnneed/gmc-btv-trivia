import { Quiz, Trivia } from "../../models/types";
import * as R from "ramda";
import TriviaFactory from "../../models/factories/trivia.factory";
const API_URL = process.env.REACT_APP_API_URL;

const quizFilterSort  = R.compose<any[], Trivia, Quiz[], Quiz[], Quiz[], Quiz[], Quiz[] >(
    R.sort((a, b) => (b.publishDate - a.publishDate)),
    R.filter((q: Quiz) => q.publishDate <= Date.now()),
    R.filter((q: Quiz) => (new Date(q.publishDate)).toString() !== "Invalid Date"),
    R.filter((q: Quiz) => Boolean(q.publishDate)),
    (trivia: Trivia) => trivia.quizzes,
    TriviaFactory
);

export const fetchTrivia = async (amount = 1): Promise<Quiz[]> => {
    if (!API_URL) throw new Error("REACT_APP_API_URL is not defined");
    console.log("FETCHING FROM: ", API_URL + "trivia.json");
    const response = await fetch(API_URL + "trivia.json");
    const trivia: Trivia = await response.json();
    const quizzes =  quizFilterSort(trivia);
    return quizzes;
};
