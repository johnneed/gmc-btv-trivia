import React, { useState } from "react";

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

const TagInput = ({ tags, onChange }: TagInputProps) => {
    const [input, setInput] = useState("");

    const addTag = () => {
        const trimmed = input.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInput("");
    };

    const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

    return (
        <div className="trail-trivia-tag-input">
            <ul role="list" style={{ display: "flex", flexWrap: "wrap", gap: 4, listStyle: "none", padding: 0 }}>
                {tags.map((tag) => (
                    <li key={tag} role="listitem" className="trail-trivia-tag-chip">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            aria-label={`Remove ${tag}`}
                        >
                            ×
                        </button>
                    </li>
                ))}
            </ul>
            <div style={{ display: "flex", gap: 4 }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag…"
                    aria-label="New tag"
                />
                <button type="button" onClick={addTag}>Add</button>
            </div>
        </div>
    );
};

export default TagInput;
