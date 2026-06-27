import React, { useState } from "react";
import Lightbox from "../lightbox/lightbox";

interface ImagePreviewProps {
    url: string;
    alt: string;
}

const ImagePreview = ({ url, alt }: ImagePreviewProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!url) return null;

    return (
        <>
            <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="trail-trivia-image-preview-btn"
                aria-label="View full-size image"
            >
                <img
                    src={url}
                    alt={alt}
                    width={160}
                    height={120}
                    style={{ objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.border = "1px dashed red"; }}
                />
            </button>
            <Lightbox
                open={lightboxOpen}
                src={url}
                alt={alt}
                onClose={() => setLightboxOpen(false)}
            />
        </>
    );
};

export default ImagePreview;
