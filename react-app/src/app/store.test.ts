import { describe, it, expect } from "vitest";
import { store } from "./store";

describe("store smoke", () => {
    it("has loader and score slices", () => {
        const state = store.getState();
        expect(state).toHaveProperty("loader");
        expect(state).toHaveProperty("score");
    });
});
