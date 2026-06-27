import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmationDialog from "./confirmation-dialog";

describe("ConfirmationDialog", () => {
    it("renders nothing when closed", () => {
        const { container } = render(<ConfirmationDialog open={false} message="Delete?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
        expect(container.querySelector("[role='alertdialog']")).toBeNull();
    });

    it("renders message when open", () => {
        render(<ConfirmationDialog open={true} message="Delete this?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByText("Delete this?")).toBeInTheDocument();
    });

    it("calls onConfirm when Confirm button clicked", async () => {
        const onConfirm = vi.fn();
        render(<ConfirmationDialog open={true} message="Sure?" onConfirm={onConfirm} onCancel={vi.fn()} />);
        await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
        expect(onConfirm).toHaveBeenCalledOnce();
    });

    it("calls onCancel when Cancel button clicked", async () => {
        const onCancel = vi.fn();
        render(<ConfirmationDialog open={true} message="Sure?" onConfirm={vi.fn()} onCancel={onCancel} />);
        await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
        expect(onCancel).toHaveBeenCalledOnce();
    });
});
