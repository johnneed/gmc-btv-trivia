import { describe, it, expect, vi } from "vitest";
import { scrollTop } from "./window-helpers";

describe("scrollTop", () => {
    it("calls window.scrollTo(0, 0)", () => {
        const spy = vi.spyOn(window, "scrollTo").mockImplementation(() => void 0);
        scrollTop();
        expect(spy).toHaveBeenCalledWith(0, 0);
        spy.mockRestore();
    });
});
