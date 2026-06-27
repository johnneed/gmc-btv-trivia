import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import QuizListScreen from "./index";
import loaderReducer from "../loader/loader-slice";
import scoreReducer from "../score/score-slice";
import { createQuiz } from "../../domain/factories/quiz.factory";

// 6 quizzes cover all branches of the assignGraphic switch (indices 0-5)
const quizzes = Array.from({ length: 6 }, (_, i) => createQuiz({ title: `Quiz ${i}` }));

const makeStore = () =>
    configureStore({
        reducer: { loader: loaderReducer, score: scoreReducer },
        preloadedState: {
            loader: { quizzes, quizTags: [], status: "idle" as const, selectedQuizTags: [], selectedQuiz: null },
        },
    });

describe("QuizListScreen", () => {
    it("renders quiz cards for each quiz", () => {
        render(<Provider store={makeStore()}><MemoryRouter><QuizListScreen /></MemoryRouter></Provider>);
        expect(screen.getByText("Quiz 0")).toBeInTheDocument();
        expect(screen.getByText("Quiz 5")).toBeInTheDocument();
    });

    it("renders all 6 quiz cards (covers all graphic switch branches)", () => {
        const { container } = render(<Provider store={makeStore()}><MemoryRouter><QuizListScreen /></MemoryRouter></Provider>);
        // Each quiz card is a link
        expect(container.querySelectorAll("a[href^='/quiz/']").length).toBe(6);
    });

    it("renders Back button", () => {
        render(<Provider store={makeStore()}><MemoryRouter><QuizListScreen /></MemoryRouter></Provider>);
        expect(screen.getByText(/Back to Trail Trivia/)).toBeInTheDocument();
    });
});
