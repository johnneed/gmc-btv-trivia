import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SocialButtons from "./social-buttons";

describe("SocialButtons", () => {
    it("renders without crashing", () => {
        render(<SocialButtons />);
        expect(screen.getByText("Share your score!")).toBeInTheDocument();
    });

    it("renders share buttons", () => {
        const { container } = render(<SocialButtons />);
        // react-share renders <button> or <a> elements
        const interactive = container.querySelectorAll("button, a");
        expect(interactive.length).toBeGreaterThan(0);
    });
});
