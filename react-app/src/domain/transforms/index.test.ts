import { describe, it, expect } from "vitest";
import * as transforms from "./index";

describe("transforms barrel", () => {
    it("exports sortByDateDesc", () => expect(typeof transforms.sortByDateDesc).toBe("function"));
    it("exports filterPublished", () => expect(typeof transforms.filterPublished).toBe("function"));
    it("exports filterByStatus", () => expect(typeof transforms.filterByStatus).toBe("function"));
    it("exports isComplete", () => expect(typeof transforms.isComplete).toBe("function"));
});
