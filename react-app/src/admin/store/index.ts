import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import gamesAdminReducer from "./games/games.slice";
import editorReducer from "./editor/editor.slice";
import settingsAdminReducer from "./settings/settings.slice";

export const adminStore = configureStore({
    reducer: {
        gamesAdmin: gamesAdminReducer,
        editor: editorReducer,
        settingsAdmin: settingsAdminReducer,
    },
});

export type AdminRootState = ReturnType<typeof adminStore.getState>;
export type AdminDispatch = typeof adminStore.dispatch;

export const useAdminDispatch = () => useDispatch<AdminDispatch>();
export const useAdminSelector: TypedUseSelectorHook<AdminRootState> = useSelector;
