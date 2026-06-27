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
import { loadGame, updateGameField, saveGameThunk, setGame, clearEditor } from "../../store/editor/editor.slice";
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
    const [trashOpen, setTrashOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const autosaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    if (!editor.game) return <div>Loading…</div>;

    const game = editor.game;

    return (
        <div className="trail-trivia-editor wrap">
            <div className="trail-trivia-editor-toolbar">
                <a href="#/games" onClick={(e) => { e.preventDefault(); navigate("/games"); }}>
                    ← All Games
                </a>
            </div>

            <div className="trail-trivia-editor-layout">
                <div className="trail-trivia-editor-main">
                    <div className="trail-trivia-title-inputs">
                        <input
                            type="text"
                            value={game.title}
                            onChange={(e) => dispatch(updateGameField({ title: e.target.value }))}
                            placeholder="Game title"
                            className="trail-trivia-title-input"
                            aria-label="Game title"
                        />
                        <input
                            type="text"
                            value={game.subtitle ?? ""}
                            onChange={(e) => dispatch(updateGameField({ subtitle: e.target.value }))}
                            placeholder="Subtitle (optional)"
                            aria-label="Game subtitle"
                        />
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
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <div className="trail-trivia-tags-section">
                        <h3>Tags</h3>
                        <TagInput
                            tags={game.tags}
                            onChange={(tags) => dispatch(updateGameField({ tags }))}
                        />
                    </div>
                </div>

                <aside className="trail-trivia-editor-sidebar">
                    <PublishSidebar
                        status={game.status as "draft" | "published"}
                        publishDate={game.publishDate}
                        author={game.author}
                        publishGateOpen={editor.publishGateOpen}
                        autosaveStatus={editor.autosaveStatus}
                        autosaveTimestamp={editor.autosaveTimestamp}
                        isDirty={editor.isDirty}
                        onSaveDraft={() => handleSave("draft")}
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
