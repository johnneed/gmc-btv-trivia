import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuestionCard from "./question-card";
import { createQuestion } from "../../../domain/factories/question.factory";
import { createChoice } from "../../../domain/factories/choice.factory";

const noop = () => undefined;

const makeQuestion = () => ({
    ...createQuestion({ questionText: "What is 2+2?" }),
    choices: [createChoice({ text: "3" }), createChoice({ text: "4" }), createChoice({ text: "5" }), createChoice({ text: "6" })],
});

const baseProps = {
    question: makeQuestion(),
    index: 0,
    onChange: noop,
    uploadingQuestionId: null,
    uploadError: null,
    onImageUpload: noop,
    onImageSideload: noop,
    onImageRemove: noop,
};

describe("QuestionCard", () => {
    it("renders question number and collapses body by default", () => {
        render(<QuestionCard {...baseProps} />);
        expect(screen.getByText(/01/)).toBeTruthy();
        expect(screen.queryByLabelText(/question text/i)).toBeNull();
    });

    it("expands card body on toggle click", () => {
        render(<QuestionCard {...baseProps} />);
        fireEvent.click(screen.getByRole("button", { name: /01/i }));
        expect(screen.getByRole("region", { name: /answer image upload area/i })).toBeTruthy();
    });

    it("passes isUploading to AnswerImageUploader when uploadingQuestionId matches", () => {
        const q = makeQuestion();
        render(<QuestionCard {...baseProps} question={q} uploadingQuestionId={q.id} />);
        fireEvent.click(screen.getByRole("button", { name: /01/i }));
        const fileInput = screen.getByLabelText(/upload image from computer/i) as HTMLInputElement;
        expect(fileInput.disabled).toBe(true);
    });

    it("calls onImageUpload when a file is dropped", () => {
        const onImageUpload = vi.fn();
        const q = makeQuestion();
        render(<QuestionCard {...baseProps} question={q} onImageUpload={onImageUpload} />);
        fireEvent.click(screen.getByRole("button", { name: /01/i }));
        const dropzone = screen.getByRole("region", { name: /answer image upload area/i });
        const file = new File(["x"], "img.jpg", { type: "image/jpeg" });
        fireEvent.drop(dropzone, { dataTransfer: { files: [file], types: ["Files"] } });
        expect(onImageUpload).toHaveBeenCalledWith(q.id, 0, file);
    });
});
