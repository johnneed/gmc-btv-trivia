import { describe, it, expect } from "vitest";
import { splitOnCarriageReturn } from "./string-helpers";

describe("splitOnCarriageReturn", () => {
    it("splits on newline", () => {
        expect(splitOnCarriageReturn("a\nb")).toEqual(["a", "b"]);
    });

    it("splits on carriage return", () => {
        expect(splitOnCarriageReturn("a\rb")).toEqual(["a", "b"]);
    });

    it("single string with no newline returns single-element array", () => {
        expect(splitOnCarriageReturn("hello")).toEqual(["hello"]);
    });

    it("filters out blank lines", () => {
        expect(splitOnCarriageReturn("a\n\nb")).toEqual(["a", "b"]);
    });

    it("empty string returns empty array", () => {
        expect(splitOnCarriageReturn("")).toEqual([]);
    });
});
