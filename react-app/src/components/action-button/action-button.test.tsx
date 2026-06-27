import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ActionButton from "./action-button";

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("ActionButton", () => {
    it("renders text", () => {
        wrap(<ActionButton text="Play" to="/" />);
        expect(screen.getByText("Play")).toBeInTheDocument();
    });

    it("renders as a link with the given href", () => {
        wrap(<ActionButton text="Go" to="/quiz-list" />);
        expect(screen.getByRole("link")).toHaveAttribute("href", "/quiz-list");
    });

    it("calls onClick when clicked", async () => {
        const onClick = vi.fn();
        wrap(<ActionButton text="Click" to="/" onClick={onClick} />);
        await userEvent.click(screen.getByRole("link"));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it("applies dark class by default", () => {
        wrap(<ActionButton text="Dark" to="/" variant="dark" />);
        expect(screen.getByRole("link").className).toContain("dark");
    });

    it("applies light class when variant=light", () => {
        wrap(<ActionButton text="Light" to="/" variant="light" />);
        expect(screen.getByRole("link").className).toContain("light");
    });
});
