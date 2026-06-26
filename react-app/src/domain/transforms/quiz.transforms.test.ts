import { describe, it, expect } from "vitest";
import { sortByDateDesc } from "./quiz.transforms";
import type Quiz from "../types/quiz.type";

const makeQuiz = (publishDate: number): Quiz => ({
  id: "id",
  title: "",
  author: "",
  authorId: 0,
  publishDate,
  status: "draft",
  questions: [],
  tags: [],
});

describe("sortByDateDesc", () => {
  it("returns quizzes sorted newest-first when publishDate differs", () => {
    const older = makeQuiz(1000);
    const newer = makeQuiz(2000);
    expect(sortByDateDesc([older, newer])).toEqual([newer, older]);
  });

  it("returns a new array and does not mutate the input", () => {
    const input = [makeQuiz(1000), makeQuiz(2000)];
    const original = [...input];
    sortByDateDesc(input);
    expect(input).toEqual(original);
  });

  it("handles empty array input", () => {
    expect(sortByDateDesc([])).toEqual([]);
  });

  it("handles single-element array", () => {
    const q = makeQuiz(500);
    expect(sortByDateDesc([q])).toEqual([q]);
  });

  it("two quizzes with identical publishDate: both present in output", () => {
    const a = makeQuiz(1000);
    const b = makeQuiz(1000);
    const result = sortByDateDesc([a, b]);
    expect(result).toHaveLength(2);
  });
});
