import React from "react";
import type { AutosaveStatus } from "../../store/editor/editor.slice";

interface PublishSidebarProps {
    status: "draft" | "published";
    publishDate: number;
    author: string;
    publishGateOpen: boolean;
    autosaveStatus: AutosaveStatus;
    autosaveTimestamp: number | null;
    isDirty: boolean;
    onSaveDraft: () => void;
    onPublish: () => void;
    onToggleStatus: () => void;
    onTrash: () => void;
    onPreview: () => void;
}

const formatTime = (ms: number) =>
    new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const PublishSidebar = ({
    status, publishDate, author, publishGateOpen,
    autosaveStatus, autosaveTimestamp, isDirty,
    onSaveDraft, onPublish, onToggleStatus, onTrash, onPreview,
}: PublishSidebarProps) => {
    const gateTitle = publishGateOpen
        ? undefined
        : "Complete all 5 questions (non-empty question text and all 4 choices) to enable publishing";

    const autosaveText = autosaveStatus === "saved" && autosaveTimestamp
        ? `Draft saved at ${formatTime(autosaveTimestamp)}`
        : autosaveStatus === "failed"
        ? "Draft save failed — check your connection"
        : autosaveStatus === "saving"
        ? "Saving…"
        : "";

    return (
        <div className="trail-trivia-publish-sidebar" role="complementary" aria-label="Publish options">
            <div className="trail-trivia-autosave-status" style={{ color: autosaveStatus === "failed" ? "#d63638" : undefined }}>
                {autosaveText}
            </div>

            <div className="trail-trivia-status-row">
                <span>Status: <strong>{status === "published" ? "Published" : "Draft"}</strong></span>
                <button type="button" onClick={onToggleStatus} aria-label="Toggle publish status">
                    Change
                </button>
            </div>

            <div>
                <span>Published: {new Date(publishDate).toLocaleDateString()}</span>
            </div>

            <div>
                <span>Author: {author}</span>
            </div>

            <div className="trail-trivia-sidebar-actions">
                <button type="button" onClick={onPreview}>Preview Game</button>
                <button type="button" onClick={onSaveDraft}>Save Draft</button>
                <button
                    type="button"
                    onClick={onPublish}
                    disabled={!publishGateOpen}
                    title={gateTitle}
                    aria-disabled={!publishGateOpen}
                    className="button-primary"
                >
                    {status === "published" ? "Update" : "Publish"}
                </button>
            </div>

            <div className="trail-trivia-trash-action">
                <button
                    type="button"
                    onClick={onTrash}
                    aria-label="Move to trash"
                    style={{ color: "#d63638", border: "1px solid #d63638", background: "none" }}
                >
                    🗑 Move to Trash
                </button>
            </div>
        </div>
    );
};

export default PublishSidebar;
