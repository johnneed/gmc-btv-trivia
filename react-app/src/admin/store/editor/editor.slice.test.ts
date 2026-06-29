import { describe, it, expect } from "vitest";
import editorReducer, { EditorState, updateGameField, setGame, clearEditor, uploadQuestionImage, sideloadQuestionImage } from "./editor.slice";
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
    uploadingQuestionId: null, uploadError: null,
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

    it("updateGameField with answerImageId:0 clears image from question", () => {
        const q = completeQuestion();
        const quiz = createQuiz({ questions: Array.from({ length: 5 }, (_, i) => i === 0 ? { ...q, answerImageId: 7, answerImage: "http://x.com/img.jpg" } : completeQuestion()) });
        const state = editorReducer(
            { ...initial, game: quiz },
            updateGameField({ questions: quiz.questions.map((orig, i) => i === 0 ? { ...orig, answerImageId: 0, answerImage: "" } : orig) as typeof quiz.questions })
        );
        expect(state.game?.questions[0].answerImageId).toBe(0);
        expect(state.game?.questions[0].answerImage).toBe("");
    });

    describe("uploadQuestionImage thunk", () => {
        it("pending sets uploadingQuestionId and clears uploadError", () => {
            const state = editorReducer(
                { ...initial, uploadError: "prev error" },
                { type: uploadQuestionImage.pending.type, meta: { arg: { questionId: "q1", questionIndex: 0, file: new File([], "") } } }
            );
            expect(state.uploadingQuestionId).toBe("q1");
            expect(state.uploadError).toBeNull();
        });

        it("fulfilled clears uploadingQuestionId", () => {
            const state = editorReducer(
                { ...initial, uploadingQuestionId: "q1" },
                { type: uploadQuestionImage.fulfilled.type, payload: { questionIndex: 0, attachment: { id: 42, url: "http://x.com/img.jpg", alt: "" } }, meta: { arg: { questionId: "q1", questionIndex: 0, file: new File([], "") } } }
            );
            expect(state.uploadingQuestionId).toBeNull();
        });

        it("rejected clears uploadingQuestionId and sets uploadError", () => {
            const state = editorReducer(
                { ...initial, uploadingQuestionId: "q1" },
                { type: uploadQuestionImage.rejected.type, meta: { arg: { questionId: "q1", questionIndex: 0, file: new File([], "") } }, error: { message: "Upload failed." } }
            );
            expect(state.uploadingQuestionId).toBeNull();
            expect(state.uploadError).toBe("Upload failed.");
        });
    });

    describe("sideloadQuestionImage thunk", () => {
        it("pending sets uploadingQuestionId and clears uploadError", () => {
            const state = editorReducer(
                { ...initial, uploadError: "prev" },
                { type: sideloadQuestionImage.pending.type, meta: { arg: { questionId: "q2", questionIndex: 1, url: "https://x.com/img.jpg" } } }
            );
            expect(state.uploadingQuestionId).toBe("q2");
            expect(state.uploadError).toBeNull();
        });

        it("rejected sets uploadError", () => {
            const state = editorReducer(
                { ...initial, uploadingQuestionId: "q2" },
                { type: sideloadQuestionImage.rejected.type, meta: { arg: { questionId: "q2", questionIndex: 1, url: "" } }, error: { message: "Timed out." } }
            );
            expect(state.uploadError).toBe("Timed out.");
        });
    });
});
