import { describe, it, expect } from "vitest";
import { useAppDispatch, useAppSelector } from "./hooks";

describe("app hooks smoke", () => {
    it("useAppDispatch is a function", () => expect(typeof useAppDispatch).toBe("function"));
    it("useAppSelector is a function", () => expect(typeof useAppSelector).toBe("function"));
});
