import type { Quiz } from "../domain/types";

const fetchTrivia = async (): Promise<Quiz[]> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) throw new Error("VITE_API_URL is not defined");
    const response = await fetch(apiUrl + "trivia.json");
    return response.json() as Promise<Quiz[]>;
};

export { fetchTrivia };
