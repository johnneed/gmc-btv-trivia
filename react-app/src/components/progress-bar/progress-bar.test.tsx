import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressBar from "./progress-bar";

describe("ProgressBar", () => {
    it("has role=progressbar", () => {
        render(<ProgressBar current={1} total={5} />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("sets aria-valuenow to current", () => {
        render(<ProgressBar current={3} total={5} />);
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
    });

    it("sets aria-valuemin to 1", () => {
        render(<ProgressBar current={1} total={5} />);
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemin", "1");
    });

    it("sets aria-valuemax to total", () => {
        render(<ProgressBar current={1} total={5} />);
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "5");
    });

    it("defaults aria-label to 'Question N of M'", () => {
        render(<ProgressBar current={2} total={5} />);
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Question 2 of 5");
    });

    it("uses provided label when given", () => {
        render(<ProgressBar current={2} total={5} label="Step 2 of 5" />);
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Step 2 of 5");
    });
});
