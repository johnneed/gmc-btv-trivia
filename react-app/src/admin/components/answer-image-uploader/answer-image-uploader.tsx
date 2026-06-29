import React, { useRef, useState } from "react";
import styles from "./styles.module.css";

interface AnswerImageUploaderProps {
    imageId: number | undefined;
    imageUrl: string | undefined;
    imageAlt: string | undefined;
    imageCaption: string | undefined;
    isUploading: boolean;
    error: string | null;
    onFileSelect: (file: File) => void;
    onUrlSubmit?: (url: string) => void;
    onRemove: () => void;
    onAltChange: (alt: string) => void;
    onCaptionChange: (caption: string) => void;
}

const AnswerImageUploader = ({
    imageId,
    imageUrl,
    imageAlt,
    imageCaption,
    isUploading,
    error,
    onFileSelect,
    onUrlSubmit,
    onRemove,
    onAltChange,
    onCaptionChange,
}: AnswerImageUploaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [urlValue, setUrlValue] = useState("");

    const hasImage = (imageId && imageId > 0) || !!imageUrl;

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileSelect(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect(file);
    };

    const handleUrlSubmit = () => {
        const trimmed = urlValue.trim();
        if (trimmed && onUrlSubmit) onUrlSubmit(trimmed);
    };

    return (
        <div className={styles.layout}>
            {/* Left column — fixed square preview */}
            <div className={styles.previewCol}>
                {hasImage ? (
                    <>
                        <button
                            type="button"
                            className={styles.previewBtn}
                            aria-label="View full-size image"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                        >
                            {isUploading && <span role="status" className={styles.spinner} aria-label="Uploading…" />}
                        </button>
                        <button
                            type="button"
                            className={styles.removeBtn}
                            aria-label="Remove answer image"
                            onClick={onRemove}
                        >
                            Remove image
                        </button>
                    </>
                ) : (
                    <div className={`${styles.previewStub}${isUploading ? ` ${styles.uploading}` : ""}`}>
                        {isUploading
                            ? <span role="status" className={styles.spinner} aria-label="Uploading…" />
                            : <span className={styles.stubIcon} aria-hidden="true">🖼</span>
                        }
                    </div>
                )}
            </div>

            {/* Right column — controls */}
            <div className={styles.controlsCol}>
                <div
                    role="region"
                    aria-label="Answer image upload area"
                    className={`${styles.dropzone}${dragging ? ` ${styles.dragging}` : ""}${isUploading ? ` ${styles.uploading}` : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <span>Drag image here or </span>
                    <button
                        type="button"
                        className={styles.browseBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        Browse
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        aria-label="Upload image from computer"
                        disabled={isUploading}
                        onChange={handleFileChange}
                    />
                </div>

                <div className={styles.urlRow}>
                    <input
                        type="url"
                        className={styles.urlInput}
                        aria-label="Or enter image URL to download"
                        value={urlValue}
                        onChange={(e) => setUrlValue(e.target.value)}
                        disabled={isUploading}
                        placeholder="https://example.com/image.jpg"
                    />
                    {onUrlSubmit !== undefined && (
                        <button
                            type="button"
                            onClick={handleUrlSubmit}
                            disabled={isUploading}
                            aria-label="Use URL"
                        >
                            Use URL
                        </button>
                    )}
                </div>

                {error && <p role="alert" className={styles.error}>{error}</p>}

                <label className={styles.metaLabel}>
                    Alt text
                    <input
                        type="text"
                        value={imageAlt ?? ""}
                        onChange={(e) => onAltChange(e.target.value)}
                        aria-label="Image alt text"
                        placeholder="Describe the image"
                    />
                </label>
                <label className={styles.metaLabel}>
                    Caption
                    <input
                        type="text"
                        value={imageCaption ?? ""}
                        onChange={(e) => onCaptionChange(e.target.value)}
                        aria-label="Image caption"
                        placeholder="Optional caption"
                    />
                </label>
            </div>
        </div>
    );
};

export default AnswerImageUploader;
