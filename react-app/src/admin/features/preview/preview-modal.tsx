import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import type { Quiz } from "../../../domain/types";
import loaderReducer from "../../../features/loader/loader-slice";
import scoreReducer from "../../../features/score/score-slice";
import QuizScreen from "../../../features/quiz";

interface PreviewModalProps {
    open: boolean;
    quiz: Quiz;
    onClose: () => void;
}

const PreviewModal = ({ open, quiz, onClose }: PreviewModalProps) => {
    if (!open) return null;

    // Mini store seeded with the quiz from the editor's current form state
    const previewStore = configureStore({
        reducer: { loader: loaderReducer, score: scoreReducer },
        preloadedState: {
            loader: {
                quizzes: [quiz],
                quizTags: quiz.tags ?? [],
                status: "idle" as const,
                selectedQuizTags: [],
                selectedQuiz: quiz.id,
            },
        },
    });

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Game preview"
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)",
                zIndex: 99997, overflow: "auto",
            }}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Close preview"
                style={{
                    position: "fixed", top: 16, right: 16, fontSize: 24,
                    background: "none", border: "none", color: "#fff", cursor: "pointer", zIndex: 99999,
                }}
            >
                × Close Preview
            </button>
            <div style={{ paddingTop: 60 }}>
                <Provider store={previewStore}>
                    <MemoryRouter initialEntries={[`/quiz/${quiz.id}/0`]}>
                        <Routes>
                            <Route path="/quiz/:qid/:questionIndex?" Component={QuizScreen} />
                        </Routes>
                    </MemoryRouter>
                </Provider>
            </div>
        </div>
    );
};

export default PreviewModal;
