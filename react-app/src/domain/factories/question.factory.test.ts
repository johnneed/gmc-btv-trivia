import { describe, it, expect } from "vitest";
import { createQuestion } from "./question.factory";

describe("createQuestion", () => {
  it("returns a Question with a non-empty UUID id", () => {
    const q = createQuestion();
    expect(q.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("always returns exactly 4 choices", () => {
    expect(createQuestion().choices).toHaveLength(4);
  });

  it("each of the 4 default choices has a unique UUID id", () => {
    const ids = createQuestion().choices.map((c) => c.id);
    expect(new Set(ids).size).toBe(4);
  });

  it("correctAnswerIndex defaults to 0", () => {
    expect(createQuestion().correctAnswerIndex).toBe(0);
  });

  it("questionText defaults to empty string", () => {
    expect(createQuestion().questionText).toBe("");
  });

  it("answerText defaults to empty string", () => {
    expect(createQuestion().answerText).toBe("");
  });

  it("merges overrides without losing unspecified fields", () => {
    const q = createQuestion({ questionText: "What?" });
    expect(q.questionText).toBe("What?");
    expect(q.choices).toHaveLength(4);
    expect(q.id).toBeTruthy();
  });

  it("choices invariant holds even if overrides supply fewer than 4 choices", () => {
    // The factory enforces exactly 4 choices regardless of what overrides say
    const q = createQuestion({ choices: [] as any });
    expect(q.choices).toHaveLength(4);
  });
});
