import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PublishSidebar from "./publish-sidebar";

const baseProps = {
    status: "draft" as const,
    publishDate: Date.now(),
    author: "Jane",
    publishGateOpen: true,
    autosaveStatus: "idle" as const,
    autosaveTimestamp: null,
    isDirty: false,
    onSaveDraft: vi.fn(),
    onPublish: vi.fn(),
    onToggleStatus: vi.fn(),
    onTrash: vi.fn(),
    onPreview: vi.fn(),
};

describe("PublishSidebar", () => {
    it("renders Publish button enabled when gate is open", () => {
        render(<PublishSidebar {...baseProps} publishGateOpen={true} />);
        // exact text match: status="draft" → button says "Publish"
        const btn = screen.getByRole("button", { name: "Publish" });
        expect(btn).not.toBeDisabled();
    });

    it("renders Publish button disabled when gate is closed", () => {
        render(<PublishSidebar {...baseProps} publishGateOpen={false} />);
        const btn = screen.getByRole("button", { name: "Publish" });
        expect(btn).toBeDisabled();
    });

    it("shows saved autosave status", () => {
        render(<PublishSidebar {...baseProps} autosaveStatus="saved" autosaveTimestamp={Date.now()} />);
        expect(screen.getByText(/Draft saved at/)).toBeInTheDocument();
    });

    it("shows failed autosave status in red", () => {
        render(<PublishSidebar {...baseProps} autosaveStatus="failed" />);
        expect(screen.getByText(/Draft save failed/)).toBeInTheDocument();
    });
});
