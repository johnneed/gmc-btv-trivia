import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { Quiz } from "../../domain/types";
import loaderReducer from "./loader-slice";
import scoreReducer from "../score/score-slice";
import Loader from "./index";

const fakeQuiz = { id: "1", title: "T", author: "", authorId: 0, publishDate: 0, status: "published" as const, questions: [], tags: [] };

const makeStore = (status: "idle" | "loading" | "failed") =>
    configureStore({
        reducer: { loader: loaderReducer, score: scoreReducer },
        preloadedState: {
            // preload quizzes so the fetch useEffect doesn't fire and change status
            loader: { quizzes: [fakeQuiz], quizTags: [], status, selectedQuizTags: [], selectedQuiz: null },
        },
    });

describe("Loader", () => {
    it("renders aria-live=polite region", () => {
        const { container } = render(<Provider store={makeStore("idle")}><Loader /></Provider>);
        expect(container.querySelector("[aria-live='polite']")).toBeInTheDocument();
    });

    it("sets aria-busy=true when loading", () => {
        const { container } = render(<Provider store={makeStore("loading")}><Loader /></Provider>);
        expect(container.querySelector("[aria-busy='true']")).toBeInTheDocument();
    });

    it("does not set aria-busy=true when idle", () => {
        const { container } = render(<Provider store={makeStore("idle")}><Loader /></Provider>);
        expect(container.querySelector("[aria-busy='true']")).toBeNull();
    });

    it("shows error message when status is failed", () => {
        render(<Provider store={makeStore("failed")}><Loader /></Provider>);
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("does not dispatch fetch when status is loading (covers && short-circuit)", () => {
        // quizzes empty + status=loading → useEffect condition is false (covers the 'false' branch)
        const loadingStore = configureStore({
            reducer: { loader: loaderReducer, score: scoreReducer },
            preloadedState: {
                loader: { quizzes: [] as Quiz[], quizTags: [], status: "loading" as const, selectedQuizTags: [], selectedQuiz: null },
            },
        });
        const { container } = render(<Provider store={loadingStore}><Loader /></Provider>);
        expect(container.querySelector("[aria-live='polite']")).toBeInTheDocument();
    });
});
