import { Trivia } from "../../models/types";

const API_URL = process.env.REACT_APP_API_URL;
export const fetchTrivia = async (amount = 1): Promise<Trivia> => {
    if (!API_URL) throw new Error("REACT_APP_API_URL is not defined");
    const response = await fetch(API_URL + "trivia.json");
    const trivia = await response.json();
    return trivia as Trivia;
};
