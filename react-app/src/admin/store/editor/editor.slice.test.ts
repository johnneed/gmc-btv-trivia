import { describe, it, expect } from "vitest";
import editorReducer, { EditorState, updateGameField, setGame, clearEditor } from "./editor.slice";
import { createQuiz } from "../../../domain/factories/quiz.factory";
import { createQuestion } from "../../../domain/factories/question.factory";
import { createChoice } from "../../../domain/factories/choice.factory";

const completeQuestion = () => ({
    ...createQuestion({ questionText: "Q?" }),
    choices: [
        createChoice({ text: "A" }), createChoice({ text: "B" }),
        createChoice({ text: "C" }), createChoice({ text: "D" }),
    ],
});

const initial: EditorState = {
    game: null, savedGame: null, isDirty: false,
    autosaveStatus: "idle", autosaveTimestamp: null, publishGateOpen: false,
};

describe("editor slice", () => {
    it("setGame populates editor and marks clean", () => {
        const quiz = createQuiz();
        const state = editorReducer(initial, setGame(quiz));
        expect(state.game).toEqual(quiz);
        expect(state.isDirty).toBe(false);
    });

    it("updateGameField marks isDirty", () => {
        const state = editorReducer(
            { ...initial, game: createQuiz() },
            updateGameField({ title: "New Title" })
        );
        expect(state.isDirty).toBe(true);
        expect(state.game?.title).toBe("New Title");
    });

    it("publishGateOpen is true when all 5 questions are complete", () => {
        const quiz = createQuiz({
            questions: Array.from({ length: 5 }, () => completeQuestion()),
        });
        const state = editorReducer(initial, setGame(quiz));
        expect(state.publishGateOpen).toBe(true);
    });

    it("publishGateOpen is false when any question is incomplete", () => {
        const quiz = createQuiz({
            questions: Array.from({ length: 5 }, (_, i) =>
                i === 0 ? createQuestion({ questionText: "" }) : completeQuestion()
            ),
        });
        const state = editorReducer(initial, setGame(quiz));
        expect(state.publishGateOpen).toBe(false);
    });

    it("clearEditor resets to initial state", () => {
        const state = editorReducer({ ...initial, isDirty: true }, clearEditor());
        expect(state.isDirty).toBe(false);
        expect(state.game).toBeNull();
    });
});
