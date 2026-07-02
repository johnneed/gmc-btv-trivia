import React, { useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import carouselStyles from "../../../components/carousel/styles.module.css";
import loaderReducer from "../../../features/loader/loader-slice";
import scoreReducer from "../../../features/score/score-slice";
import QuizScreen from "../../../features/quiz";
import ScoreScreen from "../../../features/score";
import type { Quiz } from "../../../domain/types";

interface PreviewModalProps {
    open: boolean;
    quiz: Quiz;
    onClose: () => void;
}

const PreviewModalContent = ({ quiz, onClose }: Omit<PreviewModalProps, "open">) => {
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
                <MemoryRouter initialEntries={[`/quiz/${quiz.id}/0`]}>
                    <div className="preview-content">
                        <div className="preview-player-shell">
                        <Routes>
                            <Route path="/quiz/:qid/:questionIndex?" element={<QuizScreen />} />
                            <Route path="/score/:qid" element={<ScoreScreen previewMode={true} />} />
                        </Routes>
                        </div>
                    </div>
                </MemoryRouter>
            </Provider>

            <style>{`
                @import url('https://fonts.googleapis.com/css?family=Tilt+Neon&display=swap');
                @import url('https://fonts.googleapis.com/css?family=Henny+Penny&display=swap');

                .preview-modal {
                    position: fixed;
                    inset: 0;
                    z-index: 999999;
                    background: #fff;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                }
                .preview-content {
                    flex: 1;
                    width: 100%;
                    max-width: 100vw;
                    margin: 0 auto;
                    padding: 0 16px 32px;
                    box-sizing: border-box;
                }
                .preview-player-shell {
                    text-align: center;
                    max-width: 80rem;
                    margin: 0 auto;
                    padding: 1rem 0;
                }
                .preview-player-shell p,
                .preview-player-shell h2,
                .preview-player-shell h4,
                .preview-player-shell button,
                .preview-player-shell a,
                .preview-player-shell figcaption {
                    line-height: 1.45;
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
                /* Ensure the content inside preview modal is visible and doesn't conflict with admin styles */
                .preview-modal h1, .preview-modal h2, .preview-modal p {
                    color: #1d2327;
                }
                .preview-player-shell .${carouselStyles.huzzah} {
                    margin: 0 0 1rem 0;
                    line-height: 1.15;
                    text-align: center;
                }
                .preview-player-shell .${carouselStyles.answer_box},
                .preview-player-shell .${carouselStyles.answer_box_no_image} {
                    margin-top: 1rem;
                }
                .preview-player-shell .${carouselStyles.answer_text} {
                    padding-top: 0.75rem;
                }
                .preview-player-shell .${carouselStyles.answer_text} > p,
                .preview-player-shell .${carouselStyles.answer_box_no_image} > div > p {
                    line-height: 1.6;
                    margin: 0 0 1rem 0;
                }
                .preview-player-shell .${carouselStyles.answer_text} > p:last-child,
                .preview-player-shell .${carouselStyles.answer_box_no_image} > div > p:last-child {
                    margin-bottom: 0;
                }
                .preview-player-shell .${carouselStyles.next_question} {
                    display: block;
                    width: fit-content;
                    max-width: calc(100% - 2rem);
                    margin: 0 auto;
                    line-height: 1.35;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

const PreviewModal: React.FC<PreviewModalProps> = ({ open, quiz, onClose }) => {
    const onCloseRef = useRef(onClose);
    const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return;

        const container = document.createElement("div");
        const root = createRoot(container);

        containerRef.current = container;
        rootRef.current = root;
        document.body.appendChild(container);

        return () => {
            rootRef.current = null;
            containerRef.current = null;
            queueMicrotask(() => {
                root.unmount();
                container.remove();
            });
        };
    }, [open]);

    useEffect(() => {
        if (!open || !rootRef.current) return;

        rootRef.current.render(
            <PreviewModalContent
                quiz={quiz}
                onClose={() => onCloseRef.current()}
            />
        );
    }, [open, quiz]);

    return null;
};

export default PreviewModal;
