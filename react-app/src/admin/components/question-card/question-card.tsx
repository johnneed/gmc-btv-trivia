import React, { useState } from "react";
import type { Question, Choice } from "../../../domain/types";
import { createChoice } from "../../../domain/factories/choice.factory";
import { createQuestion } from "../../../domain/factories/question.factory";
import ImagePreview from "../image-preview/image-preview";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface QuestionCardProps {
    question: Question;
    index: number;
    onChange: (q: Question) => void;
}

const QuestionCard = ({ question, index, onChange }: QuestionCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });

    const style = { transform: CSS.Transform.toString(transform), transition };

    const updateChoice = (ci: number, text: string) => {
        const choices = question.choices.map((c, i) =>
            i === ci ? { ...c, text } : c
        ) as [Choice, Choice, Choice, Choice];
        onChange({ ...question, choices });
    };

    const correctAnswer = question.choices[question.correctAnswerIndex];

    return (
        <div ref={setNodeRef} style={style} className="trail-trivia-question-card">
            <div className="trail-trivia-card-header">
                <span
                    {...attributes}
                    {...listeners}
                    className="trail-trivia-drag-handle"
                    aria-label={`Drag to reorder question ${index + 1}`}
                    role="button"
                    tabIndex={0}
                >
                    ⋮⋮
                </span>
                <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpanded(!expanded)}
                    className="trail-trivia-card-toggle"
                >
                    <strong>{String(index + 1).padStart(2, "0")} </strong>
                    {expanded ? "▲" : "▼"}{" "}
                    {question.questionText || "(empty question)"}
                    {!expanded && correctAnswer && (
                        <span className="trail-trivia-card-preview"> — {correctAnswer.text}</span>
                    )}
                </button>
            </div>

            {expanded && (
                <div className="trail-trivia-card-body">
                    <label>
                        Question text
                        <textarea
                            value={question.questionText}
                            onChange={(e) => onChange({ ...question, questionText: e.target.value })}
                            rows={3}
                        />
                    </label>

                    <fieldset>
                        <legend>Choices (select the correct answer)</legend>
                        {question.choices.map((c, ci) => (
                            <div key={c.id} className="trail-trivia-choice-row">
                                <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={question.correctAnswerIndex === ci}
                                    onChange={() => onChange({ ...question, correctAnswerIndex: ci })}
                                    aria-label={`Mark choice ${ci + 1} as correct`}
                                />
                                <input
                                    type="text"
                                    value={c.text}
                                    placeholder={`Choice ${ci + 1}`}
                                    onChange={(e) => updateChoice(ci, e.target.value)}
                                    aria-label={`Choice ${ci + 1} text`}
                                />
                            </div>
                        ))}
                    </fieldset>

                    <label>
                        Answer explanation
                        <textarea
                            value={question.answerText}
                            onChange={(e) => onChange({ ...question, answerText: e.target.value })}
                            rows={3}
                        />
                    </label>

                    <label>
                        Answer image URL
                        <input
                            type="url"
                            value={question.answerImage ?? ""}
                            onChange={(e) => onChange({ ...question, answerImage: e.target.value })}
                            placeholder="https://..."
                        />
                    </label>
                    <ImagePreview url={question.answerImage ?? ""} alt={question.answerImageAlt ?? ""} />

                    <label>
                        Image alt text
                        <input
                            type="text"
                            value={question.answerImageAlt ?? ""}
                            onChange={(e) => onChange({ ...question, answerImageAlt: e.target.value })}
                        />
                    </label>

                    <label>
                        Image caption
                        <input
                            type="text"
                            value={question.answerImageCaption ?? ""}
                            onChange={(e) => onChange({ ...question, answerImageCaption: e.target.value })}
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default QuestionCard;
