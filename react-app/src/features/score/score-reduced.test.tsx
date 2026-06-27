import { vi, describe, it, expect } from "vitest";

vi.mock("framer-motion", async (importOriginal) => {
    const mod = await importOriginal<typeof import("framer-motion")>();
    return { ...mod, useReducedMotion: () => true };
});

import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ScoreScreen from "./index";
import loaderReducer from "../loader/loader-slice";
import scoreReducer from "../score/score-slice";
import { createQuiz } from "../../domain/factories/quiz.factory";

const quiz = createQuiz({ id: "quiz-1", questions: Array.from({ length: 5 }, () => ({ id: "q", questionText: "Q", choices: [], correctAnswerIndex: 0, answerText: "" })) });

const makeStore = () =>
    configureStore({
        reducer: { loader: loaderReducer, score: scoreReducer },
        preloadedState: {
            loader: { quizzes: [quiz], quizTags: [], status: "idle" as const, selectedQuizTags: [], selectedQuiz: null },
            score: { scores: { "quiz-1": 4 } },
        },
    });

describe("ScoreScreen (reduced motion)", () => {
    it("renders score with useReducedMotion=true (covers motion ternary branches)", () => {
        render(
            <Provider store={makeStore()}>
                <MemoryRouter initialEntries={["/score/quiz-1"]}>
                    <Routes><Route path="/score/:qid" Component={ScoreScreen} /></Routes>
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText(/You got 4 out of 5/)).toBeInTheDocument();
    });
});
