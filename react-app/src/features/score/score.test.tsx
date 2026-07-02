import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ScoreScreen from "./index";
import loaderReducer from "../loader/loader-slice";
import scoreReducer from "../score/score-slice";
import { createQuiz } from "../../domain/factories/quiz.factory";

const quiz = createQuiz({ id: "quiz-1", questions: Array.from({ length: 5 }, () => ({ id: "q", questionText: "Q", choices: [], correctAnswerIndex: 0, answerText: "" })) });

const makeStore = (score?: number) =>
    configureStore({
        reducer: { loader: loaderReducer, score: scoreReducer },
        preloadedState: {
            loader: { quizzes: [quiz], quizTags: [], status: "idle" as const, selectedQuizTags: [], selectedQuiz: null },
            score: { scores: score !== undefined ? { "quiz-1": score } : {} as Record<string, number> },
        },
    });

const renderScore = (score?: number) =>
    render(
        <Provider store={makeStore(score)}>
            <MemoryRouter initialEntries={["/score/quiz-1"]}>
                <Routes>
                    <Route path="/score/:qid" Component={ScoreScreen} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );

describe("ScoreScreen", () => {
    it("renders score message when score is available", () => {
        renderScore(3);
        expect(screen.getByText(/You got 3 out of 5/)).toBeInTheDocument();
    });

    it("renders fallback message when no score in store", () => {
        renderScore();
        expect(screen.getByText("Congratulations!")).toBeInTheDocument();
    });

    it("renders More Games nav button linking to quiz-list", () => {
        renderScore(3);
        expect(screen.getByText("More Games!")).toBeInTheDocument();
    });

    it("renders share buttons", () => {
        renderScore(3);
        expect(screen.getByText("Share your score!")).toBeInTheDocument();
    });

    it("renders More Games nav button linking to quiz-list", () => {
        renderScore(3);
        const link = screen.getByText("More Games!");
        expect(link.closest("a")).toHaveAttribute("href", "/quiz-list");
    });
});
