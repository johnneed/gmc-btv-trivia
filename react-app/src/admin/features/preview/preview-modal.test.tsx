import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from "vitest";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { createQuiz } from "../../../domain/factories/quiz.factory";
import { createChoice } from "../../../domain/factories/choice.factory";
import { createQuestion } from "../../../domain/factories/question.factory";
import PreviewModal from "./preview-modal";

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
    id: "test-quiz",
    title: "Test Quiz",
    subtitle: "Test Subtitle",
    questions: Array.from({ length: 5 }, (_, i) => makeQuestion(`Q${i + 1}`)),
});

describe("PreviewModal", () => {
    let scrollToSpy: MockInstance<[x: number, y: number], void>;

    beforeEach(() => {
        scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => void 0);
    });

    afterEach(() => {
        scrollToSpy.mockRestore();
    });

    test("starts preview at first question inside existing admin router", async () => {
        const { unmount } = render(
            <MemoryRouter>
                <PreviewModal
                    open={true}
                    quiz={quiz}
                    onClose={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(await screen.findByText("Q1")).toBeInTheDocument();
        expect(screen.queryByText("Play The Latest")).toBeNull();
        expect(document.querySelector(".preview-player-shell")).not.toBeNull();

        await act(async () => {
            unmount();
            await Promise.resolve();
        });
    });

    test("closes when close button clicked", async () => {
        const onClose = vi.fn();

        const { unmount } = render(
            <MemoryRouter>
                <PreviewModal
                    open={true}
                    quiz={quiz}
                    onClose={onClose}
                />
            </MemoryRouter>
        );

        await userEvent.click(screen.getByRole("button", { name: /close preview/i }));
        expect(onClose).toHaveBeenCalledTimes(1);

        await act(async () => {
            unmount();
            await Promise.resolve();
        });
    });

    test("hides More Games button on preview score screen", async () => {
        const user = userEvent.setup();
        const { unmount } = render(
            <MemoryRouter>
                <PreviewModal
                    open={true}
                    quiz={quiz}
                    onClose={vi.fn()}
                />
            </MemoryRouter>
        );

        for (let index = 0; index < quiz.questions.length; index += 1) {
            await user.click(await screen.findByRole("button", { name: "A" }));

            if (index < quiz.questions.length - 1) {
                await user.click(await screen.findByRole("link", { name: /next question/i }));
            } else {
                await user.click(await screen.findByRole("link", { name: /checkout your score/i }));
            }
        }

        expect(await screen.findByText(/You got 5 out of 5/)).toBeInTheDocument();
        expect(screen.queryByText("More Games!")).toBeNull();

        await act(async () => {
            unmount();
            await Promise.resolve();
        });
    });
});
