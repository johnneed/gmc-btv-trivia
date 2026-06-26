import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
export interface ScoreState {
    scores: { [quizId: string]: number };
}

const initialState: ScoreState = {
    scores: {}
};

export const scoreSlice = createSlice({
    name: "score",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        setScore: (state, action: PayloadAction<{ quizId: string, score: number }>) => {
            state.scores = { ...state.scores, [action.payload.quizId]: action.payload.score };
        },
        incrementScore: (state, action: PayloadAction<string>) => {
            const currentScore = state.scores[action.payload] || 0;
            state.scores = { ...state.scores, [action.payload]: currentScore + 1 };
        }
    }
});

export const {
    setScore,
    incrementScore
} = scoreSlice.actions;

export const selectScores = (state: RootState) => state.score.scores;

export default scoreSlice.reducer;
