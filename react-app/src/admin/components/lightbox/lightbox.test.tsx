import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Lightbox from "./lightbox";

describe("Lightbox", () => {
    it("renders nothing when closed", () => {
        const { container } = render(<Lightbox open={false} src="x.jpg" alt="x" onClose={vi.fn()} />);
        expect(container.querySelector("[role='dialog']")).toBeNull();
    });

    it("renders img when open", () => {
        render(<Lightbox open={true} src="https://example.com/img.jpg" alt="Test" onClose={vi.fn()} />);
        expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("calls onClose when × button clicked", async () => {
        const onClose = vi.fn();
        render(<Lightbox open={true} src="x.jpg" alt="x" onClose={onClose} />);
        const closeBtn = screen.getByRole("button", { name: /close/i });
        closeBtn.click();
        expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose on Escape key", () => {
        const onClose = vi.fn();
        render(<Lightbox open={true} src="x.jpg" alt="x" onClose={onClose} />);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(onClose).toHaveBeenCalledOnce();
    });
});
