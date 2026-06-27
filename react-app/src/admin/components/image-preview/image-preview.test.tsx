import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ImagePreview from "./image-preview";

describe("ImagePreview", () => {
    it("renders nothing when url is empty", () => {
        const { container } = render(<ImagePreview url="" alt="" />);
        expect(container.querySelector("img")).toBeNull();
    });

    it("renders thumbnail when url is provided", () => {
        render(<ImagePreview url="https://example.com/img.jpg" alt="Test image" />);
        expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("thumbnail has correct dimensions", () => {
        render(<ImagePreview url="https://example.com/img.jpg" alt="Test" />);
        const img = screen.getByRole("img");
        expect(img).toHaveAttribute("width", "160");
        expect(img).toHaveAttribute("height", "120");
    });
});
