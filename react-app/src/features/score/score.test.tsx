import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ScoreScreen, { ScoreScreenRoute } from "./index";
import styles from "./styles.module.css";
import loaderReducer from "../loader/loader-slice";
import scoreReducer from "../score/score-slice";
import { createQuiz } from "../../domain/factories/quiz.factory";

const quiz = createQuiz({ id: "quiz-1", questions: Array.from({ length: 5 }, () => ({ id: "q", questionText: "Q", choices: [], correctAnswerIndex: 0, answerText: "" })) });

describe("ScoreScreen", () => {
    it("renders score message when score is available", () => {
        render(<MemoryRouter><ScoreScreen quiz={quiz} score={3} /></MemoryRouter>);
        expect(screen.getByText(/You got 3 out of 5/)).toBeInTheDocument();
    });

    it("renders fallback message when no score or quiz provided", () => {
        render(<MemoryRouter><ScoreScreen /></MemoryRouter>);
        expect(screen.getByText("Congratulations!")).toBeInTheDocument();
    });

    it("renders More Games nav button linking to quiz-list", () => {
        render(<MemoryRouter><ScoreScreen quiz={quiz} score={3} /></MemoryRouter>);
        const link = screen.getByText("More Games!");
        expect(link.closest("a")).toHaveAttribute("href", "/quiz-list");
    });

    it("renders share buttons", () => {
        render(<MemoryRouter><ScoreScreen quiz={quiz} score={3} /></MemoryRouter>);
        expect(screen.getByText("Share your score!")).toBeInTheDocument();
    });

    it("hides More Games button and adds top spacing when showMoreGames is false", () => {
        const { container } = render(<ScoreScreen quiz={quiz} score={3} showMoreGames={false} />);
        expect(screen.queryByText("More Games!")).toBeNull();
        expect(container.querySelector(`.${styles.preview_score_screen}`)).not.toBeNull();
    });

    it("renders without a Router when showMoreGames is false", () => {
        expect(() => render(<ScoreScreen quiz={quiz} score={3} showMoreGames={false} />)).not.toThrow();
    });
});

describe("ScoreScreenRoute", () => {
    const makeStore = (score?: number) =>
        configureStore({
            reducer: { loader: loaderReducer, score: scoreReducer },
            preloadedState: {
                loader: { quizzes: [quiz], quizTags: [], status: "idle" as const, selectedQuizTags: [], selectedQuiz: null },
                score: { scores: score !== undefined ? { "quiz-1": score } : {} as Record<string, number> },
            },
        });

    const renderRoute = (score?: number) =>
        render(
            <Provider store={makeStore(score)}>
                <MemoryRouter initialEntries={["/score/quiz-1"]}>
                    <Routes>
                        <Route path="/score/:qid" element={<ScoreScreenRoute />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

    it("resolves quiz and score from the URL param and Redux store", () => {
        renderRoute(3);
        expect(screen.getByText(/You got 3 out of 5/)).toBeInTheDocument();
    });

    it("shows the More Games nav button for the live route", () => {
        renderRoute(3);
        expect(screen.getByText("More Games!")).toBeInTheDocument();
    });
});
