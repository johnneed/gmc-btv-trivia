import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchTrivia } from "./trivia-api";

const mockQuizzes = [{ id: "1", title: "Test" }];

describe("fetchTrivia", () => {
    beforeEach(() => {
        vi.stubEnv("VITE_API_URL", "https://example.com/");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it("fetches from VITE_API_URL + trivia.json", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            json: async () => mockQuizzes,
        } as Response);

        await fetchTrivia();

        expect(fetch).toHaveBeenCalledWith("https://example.com/trivia.json");
    });

    it("returns Quiz[] directly with no sorting or filtering", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            json: async () => mockQuizzes,
        } as Response);

        const result = await fetchTrivia();

        expect(result).toEqual(mockQuizzes);
    });

    it("throws when VITE_API_URL is not defined", async () => {
        vi.stubEnv("VITE_API_URL", "");
        await expect(fetchTrivia()).rejects.toThrow("VITE_API_URL is not defined");
    });

    it("propagates network errors", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network failure"));
        await expect(fetchTrivia()).rejects.toThrow("Network failure");
    });

    it("returns empty array when response is empty array", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            json: async () => [],
        } as Response);
        const result = await fetchTrivia();
        expect(result).toEqual([]);
    });
});
