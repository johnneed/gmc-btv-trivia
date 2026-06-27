import { describe, it, expect } from "vitest";
import { isComplete } from "./question.transforms";
import { createQuestion } from "../factories/question.factory";
import { createChoice } from "../factories/choice.factory";

const filledChoices = [
    createChoice({ text: "A" }),
    createChoice({ text: "B" }),
    createChoice({ text: "C" }),
    createChoice({ text: "D" }),
];

// Factory enforces its own choices — override via spread after creation
const q = (text: string, choices = filledChoices) => ({
    ...createQuestion({ questionText: text }),
    choices,
});

describe("isComplete", () => {
    it("returns true for a question with non-empty text and 4 filled choices", () => {
        expect(isComplete(q("What?"))).toBe(true);
    });

    it("returns false when questionText is empty", () => {
        expect(isComplete(q(""))).toBe(false);
    });

    it("returns false when questionText is only whitespace", () => {
        expect(isComplete(q("   "))).toBe(false);
    });

    it("returns false when any choice has empty text", () => {
        const choices = [
            createChoice({ text: "A" }),
            createChoice({ text: "" }),
            createChoice({ text: "C" }),
            createChoice({ text: "D" }),
        ];
        expect(isComplete(q("What?", choices))).toBe(false);
    });

    it("returns false when any choice has whitespace-only text", () => {
        const choices = [
            createChoice({ text: "A" }),
            createChoice({ text: "  " }),
            createChoice({ text: "C" }),
            createChoice({ text: "D" }),
        ];
        expect(isComplete(q("What?", choices))).toBe(false);
    });

    it("returns false when there are fewer than 4 choices", () => {
        expect(isComplete(q("What?", filledChoices.slice(0, 3)))).toBe(false);
    });
});
