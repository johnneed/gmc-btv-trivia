import { describe, it, expect } from "vitest";
import { createQuiz } from "./quiz.factory";

describe("createQuiz", () => {
  it("returns a Quiz with a non-empty UUID id", () => {
    expect(createQuiz().id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("status defaults to 'draft'", () => {
    expect(createQuiz().status).toBe("draft");
  });

  it("publishDate defaults to a number close to Date.now()", () => {
    const before = Date.now();
    const q = createQuiz();
    const after = Date.now();
    expect(q.publishDate).toBeGreaterThanOrEqual(before);
    expect(q.publishDate).toBeLessThanOrEqual(after);
  });

  it("authorId defaults to 0", () => {
    expect(createQuiz().authorId).toBe(0);
  });

  it("questions defaults to empty array", () => {
    expect(createQuiz().questions).toEqual([]);
  });

  it("tags defaults to empty array", () => {
    expect(createQuiz().tags).toEqual([]);
  });

  it("merges overrides: title override applied", () => {
    const q = createQuiz({ title: "AT in Maine" });
    expect(q.title).toBe("AT in Maine");
    expect(q.status).toBe("draft");
  });

  it("returned object has no 'image' field", () => {
    const q = createQuiz() as Record<string, unknown>;
    expect(q).not.toHaveProperty("image");
  });
});
