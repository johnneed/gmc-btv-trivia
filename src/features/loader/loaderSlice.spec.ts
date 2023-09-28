import loaderReducer, { LoaderState, setQuiz } from "./loaderSlice";

const initialState = {
    quizzes: [],
    quizTags: [],
    questionTags: [],
    status: "idle",
    selectedQuestionTags: [],
    selectedQuizTags: [],
    selectedQuiz: null
} as LoaderState;
describe("loader reducer", () => {

    it("should handle initial state", () => {
        expect(loaderReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle setQuiz", () => {
        const actual = loaderReducer(initialState, setQuiz("ABC-123"));
        expect(actual.selectedQuiz).toEqual("ABC-123");
    });

});
