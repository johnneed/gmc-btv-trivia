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

    // Update: green only when dirty. Publish: green when gate open.
    const primaryActive = status === "published" ? isDirty : publishGateOpen;
    const primaryClass = `btn ${primaryActive ? "btn-publish" : "btn-secondary"}`;
    const primaryDisabled = !primaryActive || !publishGateOpen;

    return (
        <div className="metabox" role="complementary" aria-label="Publish options">
            {autosaveStatus !== "idle" && (
                <div className="publish-misc">
                    <span className="autosave" style={{ color: autosaveStatus === "failed" ? "#d63638" : undefined }}>
                        {autosaveStatus === "saving" && "Saving…"}
                        {autosaveStatus === "saved" && autosaveTimestamp && `Saved at ${formatTime(autosaveTimestamp)}`}
                        {autosaveStatus === "failed" && "Save failed — check connection"}
                    </span>
                </div>
            )}

            <div className="publish-misc">
                <div className="pub-row">
                    <span className="pub-label">Status</span>
                    <span className="pub-value">
                        <span className={`status-dot ${status === "published" ? "status-pub" : "status-draft-text"}`} />
                        {status === "published" ? "Published" : "Draft"}
                        <button type="button" className="pub-change" onClick={onToggleStatus}>Change</button>
                    </span>
                </div>
                <div className="pub-row">
                    <span className="pub-label">Published</span>
                    <span className="pub-value">{new Date(publishDate).toLocaleDateString()}</span>
                </div>
                <div className="pub-row">
                    <span className="pub-label">Author</span>
                    <span className="pub-value">{author}</span>
                </div>
            </div>

            <div className="publish-actions">
                <button type="button" className="preview-game-btn" onClick={onPreview}>▶ Preview Game</button>
                <button type="button" className="btn btn-secondary" onClick={onSaveDraft}>Save Draft</button>
                <button
                    type="button"
                    className={primaryClass}
                    onClick={onPublish}
                    disabled={primaryDisabled}
                    title={!publishGateOpen ? gateTitle : undefined}
                    aria-disabled={primaryDisabled}
                >
                    {status === "published" ? "Update" : "Publish"}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onTrash}
                    aria-label="Move to trash"
                    style={{ color: "var(--wp-red)", borderColor: "var(--wp-red)", marginTop: 4 }}
                >
                    Move to Trash
                </button>
            </div>
        </div>
    );
};

export default PublishSidebar;
