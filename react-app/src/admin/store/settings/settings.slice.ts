import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    fetchSettings,
    updateSettings as apiUpdateSettings,
    fetchTriviaSmiths,
    grantAccess as apiGrantAccess,
    revokeAccess as apiRevokeAccess,
} from "../../data/admin-api";

export interface TriviaSmithUser {
    userId: number;
    displayName: string;
    roles: string[];
    isAdmin: boolean;
}

export interface SettingsAdminState {
    gamesPerPage: number;
    version: string;
    wpMinimum: string;
    phpMinimum: string;
    triviaSmiths: TriviaSmithUser[];
    status: "idle" | "loading" | "saving" | "failed";
    grantError: string | null;
}

const initialState: SettingsAdminState = {
    gamesPerPage: 10,
    version: "",
    wpMinimum: "",
    phpMinimum: "",
    triviaSmiths: [],
    status: "idle",
    grantError: null,
};

export const loadSettings = createAsyncThunk("settingsAdmin/load", async () => {
    const [settings, smiths] = await Promise.all([fetchSettings(), fetchTriviaSmiths()]);
    return { settings, smiths };
});

export const saveSettings = createAsyncThunk(
    "settingsAdmin/save",
    async (data: { gamesPerPage: number }) => apiUpdateSettings(data)
);

export const grantAccess = createAsyncThunk(
    "settingsAdmin/grant",
    async (username: string, { rejectWithValue }) => {
        try {
            return await apiGrantAccess(username);
        } catch (e: unknown) {
            return rejectWithValue((e as Error).message);
        }
    }
);

export const revokeAccess = createAsyncThunk(
    "settingsAdmin/revoke",
    async (userId: number) => {
        await apiRevokeAccess(userId);
        return userId;
    }
);

export const settingsAdminSlice = createSlice({
    name: "settingsAdmin",
    initialState,
    reducers: {
        clearGrantError: (state) => { state.grantError = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadSettings.pending, (state) => { state.status = "loading"; })
            .addCase(loadSettings.fulfilled, (state, action) => {
                state.status = "idle";
                state.gamesPerPage = action.payload.settings.gamesPerPage;
                state.version = action.payload.settings.version ?? "";
                state.wpMinimum = action.payload.settings.wpMinimum ?? "";
                state.phpMinimum = action.payload.settings.phpMinimum ?? "";
                state.triviaSmiths = action.payload.smiths;
            })
            .addCase(loadSettings.rejected, (state) => { state.status = "failed"; })
            .addCase(saveSettings.pending, (state) => { state.status = "saving"; })
            .addCase(saveSettings.fulfilled, (state, action) => {
                state.status = "idle";
                state.gamesPerPage = action.payload.gamesPerPage;
            })
            .addCase(grantAccess.fulfilled, (state, action) => {
                state.triviaSmiths = [...state.triviaSmiths, action.payload];
                state.grantError = null;
            })
            .addCase(grantAccess.rejected, (state, action) => {
                state.grantError = action.payload as string;
            })
            .addCase(revokeAccess.fulfilled, (state, action) => {
                state.triviaSmiths = state.triviaSmiths.filter((s) => s.userId !== action.payload);
            });
    },
});

export const { clearGrantError } = settingsAdminSlice.actions;
export default settingsAdminSlice.reducer;
