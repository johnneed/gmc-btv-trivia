import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import GameList from "./game-list";
import gamesAdminReducer from "../../store/games/games.slice";
import editorReducer from "../../store/editor/editor.slice";
import settingsAdminReducer from "../../store/settings/settings.slice";

const { mockGame } = vi.hoisted(() => ({
    mockGame: {
        id: "g1",
        title: "Forest Trail Quiz",
        subtitle: undefined as string | undefined,
        author: "Jane",
        authorId: 1,
        publishDate: Date.now(),
        status: "draft" as const,
        questions: [],
        tags: [],
    },
}));

vi.mock("../../data/admin-api", () => ({
    fetchAllGames: vi.fn().mockResolvedValue({ items: [mockGame], total: 1 }),
    deleteGame: vi.fn().mockResolvedValue(undefined),
    seedGames: vi.fn().mockResolvedValue(undefined),
}));

const makeStore = () =>
    configureStore({
        reducer: {
            gamesAdmin: gamesAdminReducer,
            editor: editorReducer,
            settingsAdmin: settingsAdminReducer,
        },
    });

const renderGameList = () =>
    render(
        <Provider store={makeStore()}>
            <MemoryRouter initialEntries={["/games"]}>
                <Routes>
                    <Route path="/games" element={<GameList />} />
                    <Route path="/games/:id/edit" element={<div>EditScreen</div>} />
                    <Route path="/games/new" element={<div>NewScreen</div>} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );

describe("GameList", () => {
    it("does not show Edit button in row actions", async () => {
        renderGameList();
        await screen.findByText("Forest Trail Quiz");
        expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    });

    it("does not show Trash button in row actions", async () => {
        renderGameList();
        await screen.findByText("Forest Trail Quiz");
        expect(screen.queryByRole("button", { name: "Trash" })).toBeNull();
    });

    it("clicking a row cell navigates to the edit screen", async () => {
        renderGameList();
        await userEvent.click(await screen.findByText("Jane"));
        expect(screen.getByText("EditScreen")).toBeInTheDocument();
    });

    it("title button navigates to the edit screen", async () => {
        renderGameList();
        await userEvent.click(await screen.findByRole("button", { name: /Forest Trail Quiz/ }));
        expect(screen.getByText("EditScreen")).toBeInTheDocument();
    });
});

