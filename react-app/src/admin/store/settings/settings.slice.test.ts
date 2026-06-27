import { describe, it, expect } from "vitest";
import settingsReducer, { SettingsAdminState, clearGrantError } from "./settings.slice";

const initial: SettingsAdminState = {
    gamesPerPage: 10, version: "", wpMinimum: "", phpMinimum: "",
    triviaSmiths: [], status: "idle", grantError: null,
};

describe("settingsAdmin slice", () => {
    it("clearGrantError clears error", () => {
        const state = settingsReducer({ ...initial, grantError: "not found" }, clearGrantError());
        expect(state.grantError).toBeNull();
    });

    it("initial state has gamesPerPage 10", () => {
        expect(settingsReducer(undefined, { type: "unknown" }).gamesPerPage).toBe(10);
    });
});
