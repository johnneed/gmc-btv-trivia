import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Must import AFTER stubbing window — set up before module imports
const mockConfig = { apiBase: "", nonce: "" };
Object.defineProperty(window, "trailTriviaConfig", {
    get: () => mockConfig.apiBase ? mockConfig : undefined,
    configurable: true,
});

import { fetchGames, fetchGame, fetchAllGames, UnauthorizedError } from "./trivia-api";

const BASE = "http://test.example/wp-json/trail-trivia/v1";
const mockQuizzes = [{ id: "1", title: "Test" }];

describe("apiBase() — URL source precedence", () => {
    beforeEach(() => {
        vi.stubEnv("VITE_API_BASE_URL", BASE);
        mockConfig.apiBase = "";
    });
    afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

    it("prefers window.trailTriviaConfig.apiBase when present", async () => {
        mockConfig.apiBase = "http://runtime.example/wp-json/trail-trivia/v1";
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => mockQuizzes } as Response);
        await fetchGames();
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("http://runtime.example"),
            expect.anything()
        );
    });

    it("falls back to VITE_API_BASE_URL when config absent", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => mockQuizzes } as Response);
        await fetchGames();
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining(BASE), expect.anything());
    });

    it("throws when both sources are absent/empty", async () => {
        vi.stubEnv("VITE_API_BASE_URL", "");
        await expect(fetchGames()).rejects.toThrow("API base URL is not configured");
    });
});

describe("fetchGames()", () => {
    beforeEach(() => { vi.stubEnv("VITE_API_BASE_URL", BASE); mockConfig.apiBase = ""; });
    afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

    it("calls {apiBase}/games", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => mockQuizzes } as Response);
        await fetchGames();
        expect(fetch).toHaveBeenCalledWith(`${BASE}/games`, expect.anything());
    });

    it("resolves with Quiz[] on 200", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => mockQuizzes } as Response);
        await expect(fetchGames()).resolves.toEqual(mockQuizzes);
    });

    it("passes an AbortSignal in fetch options", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => [] } as Response);
        await fetchGames();
        const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(options?.signal).toBeInstanceOf(AbortSignal);
    });

    it("throws UnauthorizedError on HTTP 401", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 401 } as Response);
        await expect(fetchGames()).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("throws generic Error on HTTP 500", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 500 } as Response);
        await expect(fetchGames()).rejects.toThrow("HTTP 500");
    });

    it("propagates abort (timeout) errors", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new DOMException("Aborted", "AbortError"));
        await expect(fetchGames()).rejects.toThrow("Aborted");
    });
});

describe("fetchGame(id)", () => {
    beforeEach(() => { vi.stubEnv("VITE_API_BASE_URL", BASE); mockConfig.apiBase = ""; });
    afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

    it("calls {apiBase}/games/{id}", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => mockQuizzes[0] } as Response);
        await fetchGame("quiz-1");
        expect(fetch).toHaveBeenCalledWith(`${BASE}/games/quiz-1`, expect.anything());
    });

    it("throws UnauthorizedError on 401", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 401 } as Response);
        await expect(fetchGame("quiz-1")).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("throws Error on 5xx", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 500 } as Response);
        await expect(fetchGame("quiz-1")).rejects.toThrow("HTTP 500");
    });
});

describe("fetchAllGames(nonce)", () => {
    beforeEach(() => { vi.stubEnv("VITE_API_BASE_URL", BASE); mockConfig.apiBase = ""; });
    afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

    it("calls {apiBase}/games/all", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => mockQuizzes } as Response);
        await fetchAllGames("my-nonce");
        expect(fetch).toHaveBeenCalledWith(`${BASE}/games/all`, expect.anything());
    });

    it("sends X-WP-Nonce header", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => [] } as Response);
        await fetchAllGames("my-nonce");
        const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
        expect((options?.headers as Record<string, string>)?.["X-WP-Nonce"]).toBe("my-nonce");
    });

    it("throws UnauthorizedError on 401", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 401 } as Response);
        await expect(fetchAllGames("bad-nonce")).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("throws Error on 5xx", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 500 } as Response);
        await expect(fetchAllGames("nonce")).rejects.toThrow("HTTP 500");
    });
});
