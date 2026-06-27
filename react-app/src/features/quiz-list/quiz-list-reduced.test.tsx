import { vi, describe, it, expect } from "vitest";

// Mock must be hoisted — covers the reduceMotion=true branch of motion.div ternaries
vi.mock("framer-motion", async (importOriginal) => {
    const mod = await importOriginal<typeof import("framer-motion")>();
    return { ...mod, useReducedMotion: () => true };
});

import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import QuizListScreen from "./index";
import loaderReducer from "../loader/loader-slice";
import scoreReducer from "../score/score-slice";
import { createQuiz } from "../../domain/factories/quiz.factory";

const quizzes = Array.from({ length: 6 }, (_, i) => createQuiz({ title: `Quiz ${i}` }));
const makeStore = () =>
    configureStore({
        reducer: { loader: loaderReducer, score: scoreReducer },
        preloadedState: {
            loader: { quizzes, quizTags: [], status: "idle" as const, selectedQuizTags: [], selectedQuiz: null },
        },
    });

describe("QuizListScreen (reduced motion)", () => {
    it("renders correctly with useReducedMotion=true", () => {
        render(<Provider store={makeStore()}><MemoryRouter><QuizListScreen /></MemoryRouter></Provider>);
        expect(screen.getByText("Quiz 0")).toBeInTheDocument();
    });
});
