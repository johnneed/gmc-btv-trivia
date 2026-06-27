import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TagInput from "./tag-input";

describe("TagInput", () => {
    it("renders existing tags as chips", () => {
        render(<TagInput tags={["hiking", "trail"]} onChange={vi.fn()} />);
        expect(screen.getByText("hiking")).toBeInTheDocument();
        expect(screen.getByText("trail")).toBeInTheDocument();
    });

    it("adds tag on Enter key", async () => {
        const onChange = vi.fn();
        render(<TagInput tags={[]} onChange={onChange} />);
        const input = screen.getByRole("textbox");
        await userEvent.type(input, "nature{Enter}");
        expect(onChange).toHaveBeenCalledWith(["nature"]);
    });

    it("removes tag on × click", async () => {
        const onChange = vi.fn();
        render(<TagInput tags={["hiking"]} onChange={onChange} />);
        await userEvent.click(screen.getByRole("button", { name: "Remove hiking" }));
        expect(onChange).toHaveBeenCalledWith([]);
    });
});
