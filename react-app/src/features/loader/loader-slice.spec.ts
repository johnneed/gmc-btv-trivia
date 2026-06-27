import loaderReducer, { LoaderState, setQuiz, addQuizTag, removeQuizTag, clearQuizTags, unsetQuiz, loaderSlice } from "./loader-slice";

const initialState: LoaderState = {
    quizzes: [],
    quizTags: [],
    status: "idle",
    selectedQuizTags: [],
    selectedQuiz: null,
};

describe("loader reducer", () => {
    it("should handle initial state", () => {
        expect(loaderReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle setQuiz", () => {
        const actual = loaderReducer(initialState, setQuiz("ABC-123"));
        expect(actual.selectedQuiz).toEqual("ABC-123");
    });

    it("should handle unsetQuiz", () => {
        const withQuiz = { ...initialState, selectedQuiz: "ABC" };
        expect(loaderReducer(withQuiz, unsetQuiz()).selectedQuiz).toBeNull();
    });

    it("should handle addQuizTag — adds a tag", () => {
        const actual = loaderReducer(initialState, addQuizTag("hiking"));
        expect(actual.selectedQuizTags).toContain("hiking");
    });

    it("should handle addQuizTag — deduplicates", () => {
        const withTag = loaderReducer(initialState, addQuizTag("hiking"));
        const deduped = loaderReducer(withTag, addQuizTag("hiking"));
        expect(deduped.selectedQuizTags).toEqual(["hiking"]);
    });

    it("should handle removeQuizTag", () => {
        const withTag = { ...initialState, selectedQuizTags: ["hiking", "trail"] };
        const actual = loaderReducer(withTag, removeQuizTag("hiking"));
        expect(actual.selectedQuizTags).toEqual(["trail"]);
    });

    it("should handle clearQuizTags", () => {
        const withTags = { ...initialState, selectedQuizTags: ["a", "b"] };
        expect(loaderReducer(withTags, clearQuizTags()).selectedQuizTags).toEqual([]);
    });

    it("fulfilled action sets quizzes and extracts quizTags", () => {
        const { loadQuizzes } = loaderSlice.actions;
        const quiz = { id: "1", title: "T", author: "", authorId: 0, publishDate: 0, status: "published" as const, questions: [], tags: ["nature"] };
        const state = loaderReducer(initialState, loadQuizzes([quiz]));
        expect(state.quizzes).toHaveLength(1);
        expect(state.quizTags).toContain("nature");
    });
});
