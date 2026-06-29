import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import type { Question } from "../../../domain/types";
import { createQuiz } from "../../../domain/factories/quiz.factory";
import { createQuestion } from "../../../domain/factories/question.factory";
import { useAdminDispatch, useAdminSelector } from "../../store";
import { loadGame, updateGameField, saveGameThunk, setGame, clearEditor, uploadQuestionImage, sideloadQuestionImage } from "../../store/editor/editor.slice";
import { removeGame } from "../../store/games/games.slice";
import QuestionCard from "../../components/question-card/question-card";
import TagInput from "../../components/tag-input/tag-input";
import PublishSidebar from "../../components/publish-sidebar/publish-sidebar";
import ConfirmationDialog from "../../components/confirmation-dialog/confirmation-dialog";
import PreviewModal from "../preview/preview-modal";

const AUTOSAVE_MS = 60_000;

const GameEditor = () => {
    const { id } = useParams<{ id?: string }>();
    const dispatch = useAdminDispatch();
    const navigate = useNavigate();
    const editor = useAdminSelector((s) => s.editor);
    const uploadingQuestionId = useAdminSelector((s) => s.editor.uploadingQuestionId);
    const uploadError = useAdminSelector((s) => s.editor.uploadError);
    const [trashOpen, setTrashOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [unpublishOpen, setUnpublishOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingUnpublish = useRef(false);
    const autosaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevAutosaveStatus = useRef(editor.autosaveStatus);

    // Load or initialise game
    useEffect(() => {
        if (id) {
            dispatch(loadGame(id));
        } else {
            const blank = createQuiz({
                status: "draft",
                questions: Array.from({ length: 5 }, () => createQuestion()),
            });
            dispatch(setGame(blank));
        }
        return () => { dispatch(clearEditor()); };
    }, [id, dispatch]);

    // Show notice when save completes
    useEffect(() => {
        if (prevAutosaveStatus.current !== "saved" && editor.autosaveStatus === "saved" && editor.game) {
            const msg = pendingUnpublish.current
                ? "Game unpublished."
                : editor.game.status === "published" ? "Game updated." : "Draft saved.";
            pendingUnpublish.current = false;
            setNotice(msg);
            if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
            noticeTimerRef.current = setTimeout(() => setNotice(null), 4000);
        }
        prevAutosaveStatus.current = editor.autosaveStatus;
    }, [editor.autosaveStatus, editor.game]);

    // Autosave
    useEffect(() => {
        autosaveRef.current = setInterval(() => {
            if (editor.isDirty) dispatch(saveGameThunk());
        }, AUTOSAVE_MS);
        return () => { if (autosaveRef.current) clearInterval(autosaveRef.current); };
    }, [editor.isDirty, dispatch]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !editor.game) return;
        const oldIndex = editor.game.questions.findIndex((q) => q.id === active.id);
        const newIndex = editor.game.questions.findIndex((q) => q.id === over.id);
        const reordered = arrayMove(editor.game.questions, oldIndex, newIndex) as Question[];
        dispatch(updateGameField({ questions: reordered }));
    };

    const handleSave = (status?: "draft" | "published") => {
        if (status) dispatch(updateGameField({ status }));
        dispatch(saveGameThunk());
    };

    const handleSaveDraft = () => {
        if (editor.game?.status === "published") {
            setUnpublishOpen(true);
        } else {
            handleSave("draft");
        }
    };

    const handleConfirmUnpublish = () => {
        setUnpublishOpen(false);
        pendingUnpublish.current = true;
        handleSave("draft");
    };

    const handleToggleStatus = () => {
        if (!editor.game) return;
        const next = editor.game.status === "published" ? "draft" : "published";
        dispatch(updateGameField({ status: next }));
        dispatch(saveGameThunk());
    };

    const handleTrash = async () => {
        if (!editor.game?.id) return;
        await dispatch(removeGame(editor.game.id));
        navigate("/games");
    };

    const handleImageUpload = (questionId: string, questionIndex: number, file: File) => {
        dispatch(uploadQuestionImage({ questionId, questionIndex, file }));
    };

    const handleImageSideload = (questionId: string, questionIndex: number, url: string) => {
        dispatch(sideloadQuestionImage({ questionId, questionIndex, url }));
    };

    const handleImageRemove = (questionIndex: number) => {
        if (!editor.game) return;
        const questions = editor.game.questions.map((q, i) =>
            i === questionIndex
                ? { ...q, answerImageId: 0, answerImage: "", answerImageAlt: "", answerImageCaption: "" }
                : q
        ) as typeof editor.game.questions;
        dispatch(updateGameField({ questions }));
    };

    if (!editor.game) return <div>Loading…</div>;

    const game = editor.game;

    return (
        <div className="wrap">
            {notice && (
                <div className="notice success" role="alert" aria-live="polite">
                    <span>{notice}</span>
                    <button className="notice-dismiss" type="button" onClick={() => setNotice(null)} aria-label="Dismiss">×</button>
                </div>
            )}
            <div className="editor-bar">
                <button type="button" className="back-link" onClick={() => navigate("/games")}>
                    ← All Games
                </button>
                <span className="autosave">
                    {editor.autosaveStatus === "saving" && "Saving…"}
                    {editor.autosaveStatus === "saved" && editor.autosaveTimestamp && `Saved at ${new Date(editor.autosaveTimestamp).toLocaleTimeString()}`}
                    {editor.autosaveStatus === "failed" && "Save failed"}
                </span>
            </div>

            <div className="editor-layout">
                <div>
                    <div className="title-box">
                        <input
                            id="game-title"
                            type="text"
                            value={game.title}
                            onChange={(e) => dispatch(updateGameField({ title: e.target.value }))}
                            placeholder="Game title"
                            aria-label="Game title"
                        />
                        <input
                            id="game-subtitle"
                            type="text"
                            value={game.subtitle ?? ""}
                            onChange={(e) => dispatch(updateGameField({ subtitle: e.target.value }))}
                            placeholder="Subtitle (optional)"
                            aria-label="Game subtitle"
                        />
                    </div>

                    <div className="questions-box">
                        <div className="questions-head">
                            <h2>Questions</h2>
                        </div>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext
                                items={game.questions.map((q) => q.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {game.questions.map((q, i) => (
                                    <QuestionCard
                                        key={q.id}
                                        question={q}
                                        index={i}
                                        onChange={(updated) => {
                                            const questions = game.questions.map((orig, idx) =>
                                                idx === i ? updated : orig
                                            ) as typeof game.questions;
                                            dispatch(updateGameField({ questions }));
                                        }}
                                        uploadingQuestionId={uploadingQuestionId}
                                        uploadError={uploadError}
                                        onImageUpload={handleImageUpload}
                                        onImageSideload={handleImageSideload}
                                        onImageRemove={handleImageRemove}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>

                    <div className="metabox">
                        <div className="metabox-head"><h2>Tags</h2></div>
                        <div className="metabox-body">
                            <TagInput
                                tags={game.tags}
                                onChange={(tags) => dispatch(updateGameField({ tags }))}
                            />
                        </div>
                    </div>
                </div>

                <aside>
                    <PublishSidebar
                        status={game.status as "draft" | "published"}
                        publishDate={game.publishDate}
                        author={game.author}
                        publishGateOpen={editor.publishGateOpen}
                        autosaveStatus={editor.autosaveStatus}
                        autosaveTimestamp={editor.autosaveTimestamp}
                        isDirty={editor.isDirty}
                        onSaveDraft={handleSaveDraft}
                        onPublish={() => handleSave("published")}
                        onToggleStatus={handleToggleStatus}
                        onTrash={() => setTrashOpen(true)}
                        onPreview={() => setPreviewOpen(true)}
                    />
                </aside>
            </div>

            <ConfirmationDialog
                open={trashOpen}
                message="Move this game to trash? You can recover it from the WordPress Trash."
                onConfirm={handleTrash}
                onCancel={() => setTrashOpen(false)}
            />

            <ConfirmationDialog
                open={unpublishOpen}
                message="Saving as a draft will unpublish this game. Players will no longer be able to see it. Continue?"
                onConfirm={handleConfirmUnpublish}
                onCancel={() => setUnpublishOpen(false)}
            />

            {previewOpen && (
                <PreviewModal
                    open={previewOpen}
                    quiz={game}
                    onClose={() => setPreviewOpen(false)}
                />
            )}
        </div>
    );
};

export default GameEditor;
