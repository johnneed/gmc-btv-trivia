import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Carousel from "./carousel";
import { createQuiz } from "../../domain/factories/quiz.factory";
import { createQuestion } from "../../domain/factories/question.factory";
import { createChoice } from "../../domain/factories/choice.factory";

const makeQuestion = (text: string) =>
    createQuestion({
        questionText: text,
        choices: [
            createChoice({ text: "A" }),
            createChoice({ text: "B" }),
            createChoice({ text: "C" }),
            createChoice({ text: "D" }),
        ],
        correctAnswerIndex: 0,
        answerText: "Because A.",
    });

const makeQuiz = () =>
    createQuiz({
        questions: Array.from({ length: 5 }, (_, i) => makeQuestion(`Question ${i + 1}`)),
    });

const renderCarousel = (questionIndex = 0) =>
    render(
        <MemoryRouter>
            <Carousel quiz={makeQuiz()} questionIndex={questionIndex} incrementScore={vi.fn()} />
        </MemoryRouter>
    );

describe("Carousel — QuestionComponent ARIA", () => {
    it("renders question text inside an h2", () => {
        renderCarousel();
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Question 1");
    });

    it("wraps choices in a group role", () => {
        renderCarousel();
        expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("group has aria-labelledby matching the h2 id", () => {
        renderCarousel();
        const heading = screen.getByRole("heading", { level: 2 });
        const group = screen.getByRole("group");
        expect(heading).toHaveAttribute("id");
        expect(group).toHaveAttribute("aria-labelledby", heading.getAttribute("id"));
    });

    it("all four choice buttons are keyboard-activatable (rendered as <button>)", () => {
        renderCarousel();
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThanOrEqual(4);
    });
});

describe("Carousel — interaction", () => {
    it("shows answer reveal after a correct choice is selected", async () => {
        const user = userEvent.setup();
        renderCarousel();
        const buttons = screen.getAllByRole("button");
        await user.click(buttons[0]);
        expect(screen.getByText("Huzzah!")).toBeInTheDocument();
    });

    it("does not show answer reveal after incorrect selection", async () => {
        const user = userEvent.setup();
        renderCarousel();
        const buttons = screen.getAllByRole("button");
        await user.click(buttons[1]); // incorrect (correctAnswerIndex = 0)
        expect(screen.queryByText("Huzzah!")).not.toBeInTheDocument();
    });

    it("shows score link on last question after correct answer", async () => {
        const user = userEvent.setup();
        const quiz = makeQuiz();
        render(
            <MemoryRouter>
                <Carousel quiz={quiz} questionIndex={4} incrementScore={vi.fn()} />
            </MemoryRouter>
        );
        const buttons = screen.getAllByRole("button");
        await user.click(buttons[0]);
        expect(screen.getByText(/survived the quiz/)).toBeInTheDocument();
    });

    it("shows Next Question link on non-last question after answer", async () => {
        const user = userEvent.setup();
        renderCarousel(0);
        const buttons = screen.getAllByRole("button");
        await user.click(buttons[0]);
        expect(screen.getByText(/Next Question/)).toBeInTheDocument();
    });

    it("renders AnswerComponent with image when answerImage is set", async () => {
        const user = userEvent.setup();
        const quiz = createQuiz({
            questions: [
                { ...makeQuestion("Q1"), answerImage: "https://example.com/img.jpg", answerImageAlt: "Alt text" },
                ...Array.from({ length: 4 }, (_, i) => makeQuestion(`Q${i + 2}`)),
            ],
        });
        render(<MemoryRouter><Carousel quiz={quiz} questionIndex={0} incrementScore={vi.fn()} /></MemoryRouter>);
        const buttons = screen.getAllByRole("button");
        await user.click(buttons[0]);
        expect(screen.getByRole("img")).toBeInTheDocument();
    });
});
