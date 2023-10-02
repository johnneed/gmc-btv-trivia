import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import loaderReducer from "../features/loader/loader-slice";
import counterReducer from "../features/counter/counterSlice";
import scoreReducer from "../features/score/score-slice";
export const store = configureStore({
    reducer: {
        counter: counterReducer,
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
