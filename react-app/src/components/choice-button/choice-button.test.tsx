import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChoiceButton from "./choice-button";
import { createChoice } from "../../domain/factories/choice.factory";

const choice = createChoice({ text: "Option A" });

describe("ChoiceButton", () => {
    it("renders choice text", () => {
        render(<ChoiceButton choice={choice} isCorrect={true} onClick={vi.fn()} />);
        expect(screen.getByText("Option A")).toBeInTheDocument();
    });

    it("calls onClick(true) when the correct answer is clicked", async () => {
        const onClick = vi.fn();
        render(<ChoiceButton choice={choice} isCorrect={true} onClick={onClick} />);
        await userEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledWith(true);
    });

    it("calls onClick(false) when an incorrect answer is clicked", async () => {
        const onClick = vi.fn();
        render(<ChoiceButton choice={choice} isCorrect={false} onClick={onClick} />);
        await userEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledWith(false);
    });

    it("button is disabled after incorrect selection", async () => {
        render(<ChoiceButton choice={choice} isCorrect={false} onClick={vi.fn()} />);
        const button = screen.getByRole("button");
        await userEvent.click(button);
        expect(button).toBeDisabled();
    });

    it("button is not disabled after correct selection", async () => {
        render(<ChoiceButton choice={choice} isCorrect={true} onClick={vi.fn()} />);
        const button = screen.getByRole("button");
        await userEvent.click(button);
        expect(button).not.toBeDisabled();
    });
});
