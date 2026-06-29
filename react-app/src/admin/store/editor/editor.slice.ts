import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Quiz, Question } from "../../../domain/types";
import { isComplete } from "../../../domain/transforms/question.transforms";
import { fetchGame, createGame, updateGame, uploadAnswerImage, sideloadAnswerImageFromUrl } from "../../data/admin-api";

export type AutosaveStatus = "idle" | "saving" | "saved" | "failed";

export interface EditorState {
    game: Quiz | null;
    savedGame: Quiz | null;
    isDirty: boolean;
    autosaveStatus: AutosaveStatus;
    autosaveTimestamp: number | null;
    publishGateOpen: boolean;
    uploadingQuestionId: string | null;
    uploadError: string | null;
}

const initialState: EditorState = {
    game: null,
    savedGame: null,
    isDirty: false,
    autosaveStatus: "idle",
    autosaveTimestamp: null,
    publishGateOpen: false,
    uploadingQuestionId: null,
    uploadError: null,
};

const computeGate = (game: Quiz | null): boolean =>
    game !== null && game.questions.length === 5 && game.questions.every(isComplete);

export const loadGame = createAsyncThunk("editor/load", async (id: string) =>
    fetchGame(id)
);

type ImageUploadArgs = { questionId: string; questionIndex: number; file: File };
type ImageSideloadArgs = { questionId: string; questionIndex: number; url: string };

const applyImageToState = (state: EditorState, index: number, id: number, url: string): void => {
    if (!state.game) return;
    const questions = state.game.questions.map((q, i) =>
        i === index ? { ...q, answerImageId: id, answerImage: url } : q
    ) as Question[];
    state.game = { ...state.game, questions };
    state.isDirty = true;
};

export const uploadQuestionImage = createAsyncThunk(
    "editor/uploadQuestionImage",
    async ({ questionIndex, file }: ImageUploadArgs) => {
        const attachment = await uploadAnswerImage(file);
        return { questionIndex, attachment };
    }
);

export const sideloadQuestionImage = createAsyncThunk(
    "editor/sideloadQuestionImage",
    async ({ questionIndex, url }: ImageSideloadArgs) => {
        const attachment = await sideloadAnswerImageFromUrl(url);
        return { questionIndex, attachment };
    }
);

export const saveGameThunk = createAsyncThunk(
    "editor/save",
    async (_: void, { getState }) => {
        const state = (getState() as { editor: EditorState }).editor;
        if (!state.game) throw new Error("No game to save");
        if (state.game.id) {
            return updateGame(state.game.id, state.game);
        }
        return createGame(state.game);
    }
);

export const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        setGame: (state, action: PayloadAction<Quiz | null>) => {
            state.game = action.payload;
            state.savedGame = action.payload;
            state.isDirty = false;
            state.publishGateOpen = computeGate(action.payload);
        },
        updateGameField: (state, action: PayloadAction<Partial<Quiz>>) => {
            if (!state.game) return;
            state.game = { ...state.game, ...action.payload };
            state.isDirty = true;
            state.publishGateOpen = computeGate(state.game);
        },
        setAutosaveStatus: (state, action: PayloadAction<AutosaveStatus>) => {
            state.autosaveStatus = action.payload;
            if (action.payload === "saved") {
                state.autosaveTimestamp = Date.now();
            }
        },
        clearEditor: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadGame.fulfilled, (state, action) => {
                state.game = action.payload;
                state.savedGame = action.payload;
                state.isDirty = false;
                state.publishGateOpen = computeGate(action.payload);
            })
            .addCase(saveGameThunk.pending, (state) => {
                state.autosaveStatus = "saving";
            })
            .addCase(saveGameThunk.fulfilled, (state, action) => {
                state.savedGame = action.payload;
                state.game = state.game ? { ...state.game, ...action.payload } : action.payload;
                state.isDirty = false;
                state.autosaveStatus = "saved";
                state.autosaveTimestamp = Date.now();
            })
            .addCase(saveGameThunk.rejected, (state) => {
                state.autosaveStatus = "failed";
            })
            .addCase(uploadQuestionImage.pending, (state, action) => {
                state.uploadingQuestionId = action.meta.arg.questionId;
                state.uploadError = null;
            })
            .addCase(uploadQuestionImage.fulfilled, (state, action) => {
                state.uploadingQuestionId = null;
                applyImageToState(state, action.payload.questionIndex, action.payload.attachment.id, action.payload.attachment.url);
            })
            .addCase(uploadQuestionImage.rejected, (state, action) => {
                state.uploadingQuestionId = null;
                state.uploadError = action.error.message ?? "Upload failed.";
            })
            .addCase(sideloadQuestionImage.pending, (state, action) => {
                state.uploadingQuestionId = action.meta.arg.questionId;
                state.uploadError = null;
            })
            .addCase(sideloadQuestionImage.fulfilled, (state, action) => {
                state.uploadingQuestionId = null;
                applyImageToState(state, action.payload.questionIndex, action.payload.attachment.id, action.payload.attachment.url);
            })
            .addCase(sideloadQuestionImage.rejected, (state, action) => {
                state.uploadingQuestionId = null;
                state.uploadError = action.error.message ?? "Download failed.";
            });
    },
});

export const { setGame, updateGameField, setAutosaveStatus, clearEditor } = editorSlice.actions;
export default editorSlice.reducer;
