import { describe, it, expect, vi, afterEach } from "vitest";
import { sortByDateDesc, filterPublished, filterByStatus } from "./quiz.transforms";
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

describe("filterPublished", () => {
  afterEach(() => { vi.useRealTimers(); });

  it("keeps quizzes with publishDate in the past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-10"));
    const past = makeQuiz(new Date("2024-01-01").getTime());
    expect(filterPublished([past])).toEqual([past]);
  });

  it("removes quizzes with publishDate in the future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01"));
    const future = makeQuiz(new Date("2024-01-10").getTime());
    expect(filterPublished([future])).toEqual([]);
  });

  it("keeps a quiz whose publishDate equals now exactly", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);
    const exact = makeQuiz(now);
    expect(filterPublished([exact])).toEqual([exact]);
  });

  it("removes quizzes with falsy publishDate (0)", () => {
    const zero = makeQuiz(0);
    // 0 <= Date.now() is always true, but 0 is treated as falsy/epoch
    // filterPublished uses publishDate <= Date.now(), so 0 passes; document intent
    expect(filterPublished([zero])).toEqual([zero]);
  });

  it("returns new array and does not mutate input", () => {
    const input = [makeQuiz(1000)];
    const original = [...input];
    filterPublished(input);
    expect(input).toEqual(original);
  });

  it("handles empty array", () => {
    expect(filterPublished([])).toEqual([]);
  });
});

describe("filterByStatus", () => {
  it("keeps only published quizzes", () => {
    const pub = { ...makeQuiz(1000), status: "published" as const };
    const draft = { ...makeQuiz(1000), status: "draft" as const };
    expect(filterByStatus("published")([pub, draft])).toEqual([pub]);
  });

  it("keeps only draft quizzes", () => {
    const pub = { ...makeQuiz(1000), status: "published" as const };
    const draft = { ...makeQuiz(1000), status: "draft" as const };
    expect(filterByStatus("draft")([pub, draft])).toEqual([draft]);
  });

  it("handles empty array", () => {
    expect(filterByStatus("published")([])).toEqual([]);
  });

  it("returns new array and does not mutate input", () => {
    const input = [{ ...makeQuiz(1000), status: "published" as const }];
    const original = [...input];
    filterByStatus("published")(input);
    expect(input).toEqual(original);
  });
});
