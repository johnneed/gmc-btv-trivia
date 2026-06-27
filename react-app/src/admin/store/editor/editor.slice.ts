import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Quiz } from "../../../domain/types";
import { isComplete } from "../../../domain/transforms/question.transforms";
import { fetchGame, createGame, updateGame } from "../../data/admin-api";

export type AutosaveStatus = "idle" | "saving" | "saved" | "failed";

export interface EditorState {
    game: Quiz | null;
    savedGame: Quiz | null;
    isDirty: boolean;
    autosaveStatus: AutosaveStatus;
    autosaveTimestamp: number | null;
    publishGateOpen: boolean;
}

const initialState: EditorState = {
    game: null,
    savedGame: null,
    isDirty: false,
    autosaveStatus: "idle",
    autosaveTimestamp: null,
    publishGateOpen: false,
};

const computeGate = (game: Quiz | null): boolean =>
    game !== null && game.questions.length === 5 && game.questions.every(isComplete);

export const loadGame = createAsyncThunk("editor/load", async (id: string) =>
    fetchGame(id)
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
                state.game = { ...state.game!, ...action.payload };
                state.isDirty = false;
                state.autosaveStatus = "saved";
                state.autosaveTimestamp = Date.now();
            })
            .addCase(saveGameThunk.rejected, (state) => {
                state.autosaveStatus = "failed";
            });
    },
});

export const { setGame, updateGameField, setAutosaveStatus, clearEditor } = editorSlice.actions;
export default editorSlice.reducer;
