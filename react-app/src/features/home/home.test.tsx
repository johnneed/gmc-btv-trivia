import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import HomeScreen from "./index";
import loaderReducer from "../loader/loader-slice";
import scoreReducer from "../score/score-slice";
import { createQuiz } from "../../domain/factories/quiz.factory";

const makeStore = (quizzes = [createQuiz({ title: "CDT Quiz" })]) =>
    configureStore({
        reducer: { loader: loaderReducer, score: scoreReducer },
        preloadedState: {
            loader: { quizzes, quizTags: [], status: "idle" as const, selectedQuizTags: [], selectedQuiz: null },
        },
    });

const wrap = (store = makeStore()) =>
    render(
        <Provider store={store}>
            <MemoryRouter><HomeScreen /></MemoryRouter>
        </Provider>
    );

describe("HomeScreen", () => {
    it("renders the Trail Trivia heading", () => {
        wrap();
        expect(screen.getByRole("heading", { name: "Trail Trivia" })).toBeInTheDocument();
    });

    it("shows the latest quiz title", () => {
        wrap();
        expect(screen.getByText("CDT Quiz")).toBeInTheDocument();
    });

    it("renders the message 'Test your trail smarts'", () => {
        wrap();
        expect(screen.getByText("Test your trail smarts")).toBeInTheDocument();
    });

    it("renders Play The Latest button", () => {
        wrap();
        expect(screen.getByText("Play The Latest")).toBeInTheDocument();
    });

    it("renders Choose Your Game button always", () => {
        wrap(makeStore([createQuiz({ title: "A" })]));
        expect(screen.getByText("Choose Your Game")).toBeInTheDocument();
    });

    it("renders without crashing when no quizzes loaded", () => {
        wrap(makeStore([]));
        expect(screen.getByRole("heading", { name: "Trail Trivia" })).toBeInTheDocument();
    });

    it("buttons appear before quiz title in DOM", () => {
        wrap();
        const buttons = screen.getByText("Play The Latest").closest("div")!;
        const title = screen.getByText("CDT Quiz");
        expect(buttons.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("renders without animation when reduced-motion is active", () => {
        vi.mock("framer-motion", async (importOriginal) => {
            const mod = await importOriginal<typeof import("framer-motion")>();
            return { ...mod, useReducedMotion: () => true };
        });
        wrap();
        expect(screen.getByRole("heading", { name: "Trail Trivia" })).toBeInTheDocument();
        vi.restoreAllMocks();
    });
});
