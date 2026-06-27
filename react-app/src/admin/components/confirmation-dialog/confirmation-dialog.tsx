import React, { useEffect } from "react";

interface ConfirmationDialogProps {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationDialog = ({ open, message, onConfirm, onCancel }: ConfirmationDialogProps) => {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-message"
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99998,
            }}
        >
            <div style={{ background: "#fff", padding: 24, borderRadius: 4, maxWidth: 400 }}>
                <p id="confirm-dialog-message">{message}</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                    <button type="button" onClick={onCancel}>Cancel</button>
                    <button type="button" onClick={onConfirm} style={{ background: "#d63638", color: "#fff" }}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
