import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import QuizCard from "./quiz-card";
import { createQuiz } from "../../domain/factories/quiz.factory";

const quiz = createQuiz({ title: "CDT Quiz", id: "quiz-1" });

describe("QuizCard", () => {
    it("renders the quiz title", () => {
        render(<MemoryRouter><QuizCard quiz={quiz}><span>icon</span></QuizCard></MemoryRouter>);
        expect(screen.getByText("CDT Quiz")).toBeInTheDocument();
    });

    it("renders a link to /quiz/:id", () => {
        render(<MemoryRouter><QuizCard quiz={quiz}><span>icon</span></QuizCard></MemoryRouter>);
        expect(screen.getByRole("link")).toHaveAttribute("href", "/quiz/quiz-1");
    });

    it("renders children slot", () => {
        render(<MemoryRouter><QuizCard quiz={quiz}><span data-testid="icon">icon</span></QuizCard></MemoryRouter>);
        expect(screen.getByTestId("icon")).toBeInTheDocument();
    });
});
