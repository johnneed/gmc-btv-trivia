import { vi, describe, it, expect } from "vitest";

vi.mock("framer-motion", async (importOriginal) => {
    const mod = await importOriginal<typeof import("framer-motion")>();
    return { ...mod, useReducedMotion: () => true };
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ScoreScreen from "./index";
import { createQuiz } from "../../domain/factories/quiz.factory";

const quiz = createQuiz({ id: "quiz-1", questions: Array.from({ length: 5 }, () => ({ id: "q", questionText: "Q", choices: [], correctAnswerIndex: 0, answerText: "" })) });

describe("ScoreScreen (reduced motion)", () => {
    it("renders score with useReducedMotion=true (covers motion ternary branches)", () => {
        render(
            <MemoryRouter>
                <ScoreScreen quiz={quiz} score={4} />
            </MemoryRouter>
        );
        expect(screen.getByText(/You got 4 out of 5/)).toBeInTheDocument();
    });
});
