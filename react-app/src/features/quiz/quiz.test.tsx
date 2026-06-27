import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import QuizScreen from "./index";
import loaderReducer from "../loader/loader-slice";
import scoreReducer from "../score/score-slice";
import { createQuiz } from "../../domain/factories/quiz.factory";
import { createQuestion } from "../../domain/factories/question.factory";
import { createChoice } from "../../domain/factories/choice.factory";

const makeQuestion = (text: string) => ({
    ...createQuestion({ questionText: text }),
    choices: [
        createChoice({ text: "A" }),
        createChoice({ text: "B" }),
        createChoice({ text: "C" }),
        createChoice({ text: "D" }),
    ],
});

const quiz = createQuiz({
    id: "quiz-1",
    title: "CDT Quiz",
    questions: Array.from({ length: 5 }, (_, i) => makeQuestion(`Q${i + 1}`)),
});

const makeStore = (quizzes = [quiz]) =>
    configureStore({
        reducer: { loader: loaderReducer, score: scoreReducer },
        preloadedState: {
            loader: { quizzes, quizTags: [], status: "idle" as const, selectedQuizTags: [], selectedQuiz: null },
        },
    });

const renderQuiz = (quizId = "quiz-1", store = makeStore()) =>
    render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[`/quiz/${quizId}/0`]}>
                <Routes>
                    <Route path="/quiz/:qid/:questionIndex?" Component={QuizScreen} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );

describe("QuizScreen", () => {
    it("renders first question text", () => {
        renderQuiz();
        expect(screen.getByText("Q1")).toBeInTheDocument();
    });

    it("renders ProgressBar", () => {
        renderQuiz();
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("shows not-found message for unknown quiz id", () => {
        renderQuiz("unknown-id");
        expect(screen.getByText(/couldn't find that quiz/)).toBeInTheDocument();
    });
});
