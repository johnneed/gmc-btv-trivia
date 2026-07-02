import React, { useMemo } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import loaderReducer from "../../../features/loader/loader-slice";
import scoreReducer from "../../../features/score/score-slice";
import HomeScreen from "../../../features/home";
import QuizScreen from "../../../features/quiz";
import ScoreScreen from "../../../features/score";
import type { Quiz } from "../../../domain/types";

interface PreviewModalProps {
    open: boolean;
    quiz: Quiz;
    onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ open, quiz, onClose }) => {
    // Create a dedicated store for the preview so it doesn't pollute the admin store
    // and correctly contains the quiz being edited.
    const previewStore = useMemo(() => {
        return configureStore({
            reducer: {
                loader: loaderReducer,
                score: scoreReducer,
            },
            preloadedState: {
                loader: {
                    quizzes: [quiz],
                    quizTags: quiz.tags,
                    status: "idle",
                    selectedQuizTags: [],
                    selectedQuiz: null,
                },
                score: {
                    scores: {},
                },
            },
        });
    }, [quiz]);

    if (!open) return null;

    return (
        <div
            className="preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Game preview"
        >
            <button
                type="button"
                className="close-preview"
                onClick={onClose}
                aria-label="Close preview"
            >
                × Close Preview
            </button>

            <Provider store={previewStore}>
                <MemoryRouter initialEntries={["/"]}>
                    <Routes>
                        <Route path="/" element={<HomeScreen />} />
                        <Route path="/quiz/:qid" element={<QuizScreen />} />
                        <Route path="/score/:qid" element={<ScoreScreen />} />
                    </Routes>
                </MemoryRouter>
            </Provider>

            <style>{`
                .preview-modal {
                    position: fixed;
                    inset: 0;
                    z-index: 999999;
                    background: #f0f0f1;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                }
                .close-preview {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000000;
                    background: #2271b1;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                }
                .close-preview:hover {
                    background: #135e96;
                }
            `}</style>
        </div>
    );
};

export default PreviewModal;
