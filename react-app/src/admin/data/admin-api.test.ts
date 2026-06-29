import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

Object.defineProperty(window, "trailTriviaAdminConfig", {
    value: { apiBase: "http://test.example/wp-json/trail-trivia/v1", nonce: "test-nonce", currentUser: { id: 1, displayName: "Admin", isAdmin: true } },
    configurable: true,
});

import { fetchSettings, updateSettings, fetchAllGames, uploadAnswerImage, sideloadAnswerImageFromUrl } from "./admin-api";

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

    describe("uploadAnswerImage", () => {
        it("returns MediaAttachment on success", async () => {
            const attachment = { id: 42, url: "http://example.com/img.jpg", alt: "" };
            vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => attachment } as Response);
            const file = new File(["x"], "img.jpg", { type: "image/jpeg" });
            const result = await uploadAnswerImage(file);
            expect(result).toEqual(attachment);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/media/upload"),
                expect.objectContaining({ method: "POST" })
            );
        });

        it("throws on trivia_upload_no_file error", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ code: "trivia_upload_no_file", message: "No file provided." }),
            } as Response);
            await expect(uploadAnswerImage(new File([], ""))).rejects.toThrow("No file provided.");
        });

        it("throws on trivia_upload_invalid_type error", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ code: "trivia_upload_invalid_type", message: "Invalid type." }),
            } as Response);
            await expect(uploadAnswerImage(new File(["x"], "doc.pdf"))).rejects.toThrow("Invalid type.");
        });

        it("throws on trivia_upload_failed error", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ code: "trivia_upload_failed", message: "Upload failed." }),
            } as Response);
            await expect(uploadAnswerImage(new File(["x"], "img.jpg"))).rejects.toThrow("Upload failed.");
        });
    });

    describe("sideloadAnswerImageFromUrl", () => {
        it("returns MediaAttachment on success", async () => {
            const attachment = { id: 43, url: "http://example.com/dl.jpg", alt: "" };
            vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => attachment } as Response);
            const result = await sideloadAnswerImageFromUrl("https://example.com/remote.jpg");
            expect(result).toEqual(attachment);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/media/from-url"),
                expect.objectContaining({ method: "POST" })
            );
        });

        it("throws on trivia_url_timeout", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ code: "trivia_url_timeout", message: "Timed out." }),
            } as Response);
            await expect(sideloadAnswerImageFromUrl("https://slow.example.com/img.jpg")).rejects.toThrow("Timed out.");
        });

        it("throws on trivia_url_not_image", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ code: "trivia_url_not_image", message: "Not an image." }),
            } as Response);
            await expect(sideloadAnswerImageFromUrl("https://example.com/page.html")).rejects.toThrow("Not an image.");
        });

        it("throws on trivia_url_sideload_failed", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ code: "trivia_url_sideload_failed", message: "Sideload failed." }),
            } as Response);
            await expect(sideloadAnswerImageFromUrl("https://example.com/img.jpg")).rejects.toThrow("Sideload failed.");
        });
    });
});
