import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

Object.defineProperty(window, "trailTriviaAdminConfig", {
    value: { apiBase: "http://test.example/wp-json/trail-trivia/v1", nonce: "test-nonce", currentUser: { id: 1, displayName: "Admin", isAdmin: true } },
    configurable: true,
});

import { fetchSettings, updateSettings, fetchAllGames } from "./admin-api";

describe("admin-api", () => {
    beforeEach(() => { vi.spyOn(globalThis, "fetch"); });
    afterEach(() => { vi.restoreAllMocks(); });

    it("fetchSettings calls GET /settings with nonce header", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({ gamesPerPage: 10 }) } as Response);
        await fetchSettings();
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/settings"),
            expect.objectContaining({ headers: expect.objectContaining({ "X-WP-Nonce": "test-nonce" }) })
        );
    });

    it("updateSettings calls PUT /settings", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({ gamesPerPage: 20 }) } as Response);
        const result = await updateSettings({ gamesPerPage: 20 });
        expect(result.gamesPerPage).toBe(20);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/settings"), expect.objectContaining({ method: "PUT" }));
    });

    it("fetchAllGames calls GET /games/all with page params", async () => {
        const mockRes = { ok: true, json: async () => [], headers: { get: () => "5" } } as unknown as Response;
        vi.mocked(fetch).mockResolvedValueOnce(mockRes);
        const result = await fetchAllGames(1, 10, "all", "");
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/games/all"), expect.anything());
        expect(result.items).toEqual([]);
        expect(result.total).toBe(5);
    });
});
