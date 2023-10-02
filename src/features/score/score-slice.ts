import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";


export interface ScoreState {
    currentScore: number;
}

const initialState: ScoreState = {
    currentScore: 0
};


export const scoreSlice = createSlice({
    name: "score",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        setScore: (state, action: PayloadAction<number>) => {
            state.currentScore = action.payload;
        }
    },
});

export const {
    setScore
} = scoreSlice.actions;

export const selectScore = (state: RootState) => state.score.currentScore;
 
export default scoreSlice.reducer;
