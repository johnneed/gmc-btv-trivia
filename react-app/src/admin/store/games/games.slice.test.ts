import { describe, it, expect } from "vitest";
import gamesReducer, {
    GamesAdminState, setStatusFilter, setSearchQuery, setPage, setPerPage,
} from "./games.slice";

const initial: GamesAdminState = {
    items: [], total: 0, page: 1, perPage: 10,
    statusFilter: "all", searchQuery: "", status: "idle",
};

describe("gamesAdmin slice", () => {
    it("setStatusFilter updates filter and resets to page 1", () => {
        const state = gamesReducer({ ...initial, page: 3 }, setStatusFilter("draft"));
        expect(state.statusFilter).toBe("draft");
        expect(state.page).toBe(1);
    });

    it("setSearchQuery updates query and resets page", () => {
        const state = gamesReducer({ ...initial, page: 2 }, setSearchQuery("CDT"));
        expect(state.searchQuery).toBe("CDT");
        expect(state.page).toBe(1);
    });

    it("setPage updates page", () => {
        expect(gamesReducer(initial, setPage(3)).page).toBe(3);
    });

    it("setPerPage updates perPage and resets page", () => {
        const state = gamesReducer({ ...initial, page: 3 }, setPerPage(5));
        expect(state.perPage).toBe(5);
        expect(state.page).toBe(1);
    });
});
