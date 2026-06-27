import React, { useEffect } from "react";

interface LightboxProps {
    open: boolean;
    src: string;
    alt: string;
    onClose: () => void;
}

const Lightbox = ({ open, src, alt, onClose }: LightboxProps) => {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999,
            }}
            onClick={onClose}
        >
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Close image preview"
                style={{ position: "absolute", top: 16, right: 16, fontSize: 24, background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            >
                ×
            </button>
            <img
                src={src}
                alt={alt}
                style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

export default Lightbox;
