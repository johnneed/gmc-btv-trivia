import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import loaderReducer from "../features/loader/loader-slice";
import scoreReducer from "../features/score/score-slice";
export const store = configureStore({
    reducer: {
        loader: loaderReducer,
        score: scoreReducer
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
