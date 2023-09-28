import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { fetchTrivia } from "./loaderAPI";
import type { Question, Quiz } from "../../models/types";
import * as R from "ramda";
import { quizFactory } from "../../models/factories";

export interface LoaderState {
    quizzes: Quiz[];
    quizTags: string[];
    questionTags: string[];
    status: "idle" | "loading" | "failed";
    selectedQuestionTags: Set<string>;
    selectedQuizTags: Set<string>;
    selectedQuiz: string | null;
}

const initialState: LoaderState = {
    quizzes: [],
    quizTags: [],
    questionTags: [],
    status: "idle",
    selectedQuestionTags: new Set(),
    selectedQuizTags: new Set(),
    selectedQuiz: null
};

export const fetchQuizzes = createAsyncThunk(
    "loader/loadQuizzes",
    async () => {
        const response = await fetchTrivia();
        return  R.map(quizFactory)(response.quizzes);
    }
);

export const loaderSlice = createSlice({
    name: "loader",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        loadQuizzes: (state, action: PayloadAction<Quiz[]>) => {
            const extractQuizTags = R.compose(Array.from<string>, (t: string[]) => new Set(t), R.flatten, R.map((q: Quiz) => q.tags));
            const extractQuestionTags = R.compose(
                Array.from<string>,
                (t: string[]) => new Set(t),
                R.flatten,
                R.map((q: Question) => q.tags),
                R.flatten,
                R.map((q: Quiz) => q.questions)
            );
            state.quizzes = action.payload;
            state.quizTags = extractQuizTags(action.payload);
            state.questionTags = extractQuestionTags(action.payload);
        },
        setQuiz: (state, action: PayloadAction<string>) => {
            state.selectedQuiz = action.payload;
        },
        unsetQuiz: (state) => {
            state.selectedQuiz = null;
        },
        addQuizTag: (state, action: PayloadAction<string>) => {
            state.selectedQuizTags.add(action.payload);
        },
        removeQuizTag: (state, action: PayloadAction<string>) => {
            state.selectedQuizTags.delete(action.payload);
        },
        clearQuizTags: (state) => {
            state.selectedQuizTags.clear();
        },
        addQuestionTag: (state, action: PayloadAction<string>) => {
            state.selectedQuestionTags.add(action.payload);
        },
        removeQuestionTag: (state, action: PayloadAction<string>) => {
            state.selectedQuestionTags.delete(action.payload);
        },
        clearQuestionTags: (state) => {
            state.selectedQuestionTags.clear();
        }
    },
    // The `extraReducers` field lets the slice handle actions defined elsewhere,
    // including actions generated by createAsyncThunk or in other slices.
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuizzes.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchQuizzes.fulfilled, (state, action) => {
                state.status = "idle";
                state.quizzes = action.payload;
            })
            .addCase(fetchQuizzes.rejected, (state) => {
                state.status = "failed";
            });
    }
});

export const {
    addQuestionTag,
    clearQuestionTags,
    removeQuestionTag,
    clearQuizTags,
    removeQuizTag,
    addQuizTag,
    setQuiz,
    unsetQuiz
} = loaderSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.loader.value)`
export const selectQuizzes = (state: RootState) => state.loader.quizzes;
export const selectQuizTags = (state: RootState) => state.loader.quizTags;
export const selectQuestionTags = (state: RootState) => state.loader.questionTags;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd =
//     (amount: number): AppThunk =>
//         (dispatch, getState) => {
//             const currentValue = selectCount(getState());
//             if (currentValue % 2 === 1) {
//                 dispatch(incrementByAmount(amount));
//             }
//         };

export default loaderSlice.reducer;
