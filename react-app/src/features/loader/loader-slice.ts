import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { fetchTrivia } from "../../data/trivia-api";
import { filterPublished, sortByDateDesc } from "../../domain/transforms/quiz.transforms";
import type { Quiz } from "../../domain/types";
import * as R from "ramda";

export interface LoaderState {
    quizzes: Quiz[];
    quizTags: string[];
    status: "idle" | "loading" | "failed";
    selectedQuizTags: string[];
    selectedQuiz: string | null;
}

const initialState: LoaderState = {
    quizzes: [],
    quizTags: [],
    status: "idle",
    selectedQuizTags: [],
    selectedQuiz: null,
};

export const fetchQuizzes = createAsyncThunk("loader/loadQuizzes", async () => {
    const raw = await fetchTrivia();
    return sortByDateDesc(filterPublished(raw));
});

const extractQuizTags = R.compose(
    Array.from as (s: Set<string>) => string[],
    (t: string[]) => new Set(t),
    R.flatten as (a: string[][]) => string[],
    R.map((q: Quiz) => q.tags)
);

export const loaderSlice = createSlice({
    name: "loader",
    initialState,
    reducers: {
        loadQuizzes: (state, action: PayloadAction<Quiz[]>) => {
            state.quizzes = action.payload;
            state.quizTags = extractQuizTags(action.payload);
        },
        setQuiz: (state, action: PayloadAction<string>) => {
            state.selectedQuiz = action.payload;
        },
        unsetQuiz: (state) => {
            state.selectedQuiz = null;
        },
        addQuizTag: (state, action: PayloadAction<string>) => {
            state.selectedQuizTags = Array.from(new Set([...state.selectedQuizTags, action.payload]));
        },
        removeQuizTag: (state, action: PayloadAction<string>) => {
            state.selectedQuizTags = state.selectedQuizTags.filter((x) => x !== action.payload);
        },
        clearQuizTags: (state) => {
            state.selectedQuizTags = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuizzes.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchQuizzes.fulfilled, (state, action) => {
                state.status = "idle";
                state.quizzes = action.payload;
                state.quizTags = extractQuizTags(action.payload);
            })
            .addCase(fetchQuizzes.rejected, (state) => {
                // status="failed" is read by the loader feature component to show an error message
                state.status = "failed";
            });
    },
});

export const { addQuizTag, clearQuizTags, removeQuizTag, setQuiz, unsetQuiz } =
    loaderSlice.actions;

export const selectQuizzes = (state: RootState) => state.loader.quizzes;
export const selectLatestQuiz = (state: RootState) => state.loader.quizzes[0];
export const selectQuizTags = (state: RootState) => state.loader.quizTags;
export const selectStatus = (state: RootState) => state.loader.status;

export default loaderSlice.reducer;
