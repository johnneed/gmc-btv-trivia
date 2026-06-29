import React, { useState } from "react";
import type { Question, Choice } from "../../../domain/types";
import AnswerImageUploader from "../answer-image-uploader/answer-image-uploader";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface QuestionCardProps {
    question: Question;
    index: number;
    onChange: (q: Question) => void;
    uploadingQuestionId: string | null;
    uploadError: string | null;
    onImageUpload: (questionId: string, questionIndex: number, file: File) => void;
    onImageSideload: (questionId: string, questionIndex: number, url: string) => void;
    onImageRemove: (questionIndex: number) => void;
}

const LETTERS = ["A", "B", "C", "D"];

const QuestionCard = ({ question, index, onChange, uploadingQuestionId, uploadError, onImageUpload, onImageSideload, onImageRemove }: QuestionCardProps) => {
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
        <div ref={setNodeRef} style={style} className={`q-card${expanded ? " open" : ""}`}>
            <div
                className="q-card-head"
                onClick={() => setExpanded(!expanded)}
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(!expanded); } }}
                aria-label={expanded ? "Collapse question" : "Expand question"}
            >
                <span
                    {...attributes}
                    {...listeners}
                    className="drag-handle"
                    aria-label={`Drag to reorder question ${index + 1}`}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => e.stopPropagation()}
                >
                    ⠿
                </span>
                <span className="q-num">{String(index + 1).padStart(2, "0")}</span>
                <div className="q-card-preview">
                    <div className="q-preview-text">{question.questionText || <em className="q-preview-text empty">Empty question</em>}</div>
                    {!expanded && correctAnswer?.text && (
                        <div className="q-preview-correct">✓ {correctAnswer.text}</div>
                    )}
                </div>
                <span className="q-expand-icon" aria-hidden="true">▼</span>
            </div>

            <div className="q-card-body">
                    <div className="field">
                        <label>Question text</label>
                        <textarea
                            value={question.questionText}
                            onChange={(e) => onChange({ ...question, questionText: e.target.value })}
                            rows={3}
                            aria-label="Question text"
                        />
                    </div>

                    <div className="field">
                        <label className="choices-legend">
                            Choices — <strong>select the correct answer</strong>
                        </label>
                        {question.choices.map((c, ci) => {
                            const isCorrect = question.correctAnswerIndex === ci;
                            return (
                                <div key={c.id} className={`choice-row${isCorrect ? " correct" : ""}`}>
                                    <button
                                        type="button"
                                        className="choice-letter"
                                        onClick={() => onChange({ ...question, correctAnswerIndex: ci })}
                                        aria-pressed={isCorrect}
                                        aria-label={`Mark choice ${LETTERS[ci]} as correct`}
                                        title="Set Answer as Correct"
                                    >
                                        {LETTERS[ci]}
                                    </button>
                                    <input
                                        type="text"
                                        value={c.text}
                                        placeholder={`Choice ${ci + 1}`}
                                        onChange={(e) => updateChoice(ci, e.target.value)}
                                        aria-label={`Choice ${ci + 1} text`}
                                    />
                                    <span className={`choice-indicator${isCorrect ? " choice-correct" : " choice-wrong"}`} aria-hidden="true">
                                        {isCorrect ? "✓" : "✕"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="field">
                        <label>Answer explanation</label>
                        <textarea
                            value={question.answerText}
                            onChange={(e) => onChange({ ...question, answerText: e.target.value })}
                            rows={3}
                            aria-label="Answer explanation"
                        />
                    </div>

                    <div className="field">
                        <label>Answer image</label>
                        <AnswerImageUploader
                            imageId={question.answerImageId}
                            imageUrl={question.answerImage}
                            imageAlt={question.answerImageAlt}
                            imageCaption={question.answerImageCaption}
                            isUploading={uploadingQuestionId === question.id}
                            error={uploadingQuestionId === null ? uploadError : null}
                            onFileSelect={(file) => onImageUpload(question.id, index, file)}
                            onUrlSubmit={(url) => onImageSideload(question.id, index, url)}
                            onRemove={() => onImageRemove(index)}
                            onAltChange={(alt) => onChange({ ...question, answerImageAlt: alt })}
                            onCaptionChange={(caption) => onChange({ ...question, answerImageCaption: caption })}
                        />
                    </div>
            </div>
        </div>
    );
};

export default QuestionCard;
