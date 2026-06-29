import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AnswerImageUploader from "./answer-image-uploader";

const noop = () => undefined;
const baseProps = {
    imageId: undefined,
    imageUrl: undefined,
    imageAlt: undefined,
    imageCaption: undefined,
    isUploading: false,
    error: null,
    onFileSelect: noop,
    onRemove: noop,
    onAltChange: noop,
    onCaptionChange: noop,
};

describe("AnswerImageUploader", () => {
    // ---- US1: file upload path ----

    it("renders drop zone with accessible region label", () => {
        render(<AnswerImageUploader {...baseProps} />);
        expect(screen.getByRole("region", { name: /answer image upload area/i })).toBeTruthy();
    });

    it("renders Browse file input with accessible label", () => {
        render(<AnswerImageUploader {...baseProps} />);
        expect(screen.getByLabelText(/upload image from computer/i)).toBeTruthy();
    });

    it("fires onFileSelect when a file is dropped", () => {
        const onFileSelect = vi.fn();
        render(<AnswerImageUploader {...baseProps} onFileSelect={onFileSelect} />);
        const dropzone = screen.getByRole("region", { name: /answer image upload area/i });
        const file = new File(["x"], "trail.jpg", { type: "image/jpeg" });
        fireEvent.drop(dropzone, { dataTransfer: { files: [file], types: ["Files"] } });
        expect(onFileSelect).toHaveBeenCalledWith(file);
    });

    it("shows loading state and disables file input when isUploading", () => {
        render(<AnswerImageUploader {...baseProps} isUploading={true} />);
        const fileInput = screen.getByLabelText(/upload image from computer/i) as HTMLInputElement;
        expect(fileInput.disabled).toBe(true);
        expect(screen.getByRole("status")).toBeTruthy();
    });

    it("shows error message in role=alert when error prop is set", () => {
        render(<AnswerImageUploader {...baseProps} error="Upload failed." />);
        const alert = screen.getByRole("alert");
        expect(alert.textContent).toContain("Upload failed.");
    });

    it("does not show error when error is null", () => {
        render(<AnswerImageUploader {...baseProps} error={null} />);
        expect(screen.queryByRole("alert")).toBeNull();
    });

    // ---- US2: URL input path ----

    it("renders URL input with accessible label", () => {
        render(<AnswerImageUploader {...baseProps} />);
        expect(screen.getByLabelText(/enter image url/i)).toBeTruthy();
    });

    it("fires onUrlSubmit with trimmed value on button click", () => {
        const onUrlSubmit = vi.fn();
        render(<AnswerImageUploader {...baseProps} onUrlSubmit={onUrlSubmit} />);
        const input = screen.getByLabelText(/enter image url/i) as HTMLInputElement;
        fireEvent.change(input, { target: { value: "  https://example.com/img.jpg  " } });
        fireEvent.click(screen.getByRole("button", { name: /use url/i }));
        expect(onUrlSubmit).toHaveBeenCalledWith("https://example.com/img.jpg");
    });

    it("disables Use URL button when isUploading", () => {
        render(<AnswerImageUploader {...baseProps} onUrlSubmit={noop} isUploading={true} />);
        const btn = screen.getByRole("button", { name: /use url/i }) as HTMLButtonElement;
        expect(btn.disabled).toBe(true);
    });

    it("does not render URL section when onUrlSubmit is not provided", () => {
        render(<AnswerImageUploader {...baseProps} onUrlSubmit={undefined} />);
        expect(screen.queryByRole("button", { name: /use url/i })).toBeNull();
    });

    // ---- US3: thumbnail + remove ----

    it("shows thumbnail and Remove button when imageUrl is provided", () => {
        render(<AnswerImageUploader {...baseProps} imageId={42} imageUrl="http://example.com/img.jpg" imageAlt="trail" />);
        expect(screen.getByAltText("trail")).toBeTruthy();
        expect(screen.getByRole("button", { name: /remove answer image/i })).toBeTruthy();
    });

    it("fires onRemove when Remove button is clicked", () => {
        const onRemove = vi.fn();
        render(<AnswerImageUploader {...baseProps} imageId={42} imageUrl="http://x.com/img.jpg" imageAlt="" onRemove={onRemove} />);
        fireEvent.click(screen.getByRole("button", { name: /remove answer image/i }));
        expect(onRemove).toHaveBeenCalled();
    });

    it("does not show thumbnail or Remove button when no imageUrl", () => {
        render(<AnswerImageUploader {...baseProps} />);
        expect(screen.queryByRole("button", { name: /remove answer image/i })).toBeNull();
    });

    it("renders alt text input when image is present", () => {
        render(<AnswerImageUploader {...baseProps} imageId={1} imageUrl="http://x.com/img.jpg" imageAlt="desc" />);
        expect(screen.getByDisplayValue("desc")).toBeTruthy();
    });

    it("renders caption input when image is present", () => {
        render(<AnswerImageUploader {...baseProps} imageId={1} imageUrl="http://x.com/img.jpg" imageCaption="Cap" />);
        expect(screen.getByDisplayValue("Cap")).toBeTruthy();
    });

    it("fires onAltChange when alt input changes", () => {
        const onAltChange = vi.fn();
        render(<AnswerImageUploader {...baseProps} imageId={1} imageUrl="http://x.com/img.jpg" imageAlt="old" onAltChange={onAltChange} />);
        fireEvent.change(screen.getByDisplayValue("old"), { target: { value: "new" } });
        expect(onAltChange).toHaveBeenCalledWith("new");
    });
});
