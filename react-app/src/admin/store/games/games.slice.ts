import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Quiz } from "../../../domain/types";
import { fetchAllGames, deleteGame as apiDeleteGame } from "../../data/admin-api";

export interface GamesAdminState {
    items: Quiz[];
    total: number;
    page: number;
    perPage: number;
    statusFilter: "all" | "published" | "draft";
    searchQuery: string;
    status: "idle" | "loading" | "failed";
}

const initialState: GamesAdminState = {
    items: [],
    total: 0,
    page: 1,
    perPage: 10,
    statusFilter: "all",
    searchQuery: "",
    status: "idle",
};

export const loadGames = createAsyncThunk(
    "gamesAdmin/load",
    async (_: void, { getState }) => {
        const state = (getState() as { gamesAdmin: GamesAdminState }).gamesAdmin;
        return fetchAllGames(state.page, state.perPage, state.statusFilter, state.searchQuery);
    }
);

export const removeGame = createAsyncThunk("gamesAdmin/remove", async (id: string) => {
    await apiDeleteGame(id);
    return id;
});

export const gamesAdminSlice = createSlice({
    name: "gamesAdmin",
    initialState,
    reducers: {
        setStatusFilter: (state, action: PayloadAction<GamesAdminState["statusFilter"]>) => {
            state.statusFilter = action.payload;
            state.page = 1;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.page = 1;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setPerPage: (state, action: PayloadAction<number>) => {
            state.perPage = action.payload;
            state.page = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadGames.pending, (state) => { state.status = "loading"; })
            .addCase(loadGames.fulfilled, (state, action) => {
                state.status = "idle";
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(loadGames.rejected, (state) => { state.status = "failed"; })
            .addCase(removeGame.fulfilled, (state, action) => {
                state.items = state.items.filter((g) => g.id !== action.payload);
                state.total = Math.max(0, state.total - 1);
            });
    },
});

export const { setStatusFilter, setSearchQuery, setPage, setPerPage } = gamesAdminSlice.actions;
export default gamesAdminSlice.reducer;
