import ScoreReducer, { incrementScore, ScoreState, setScore } from "./score-slice";

const initialState = {
    scores: { "ABC-123": 2 }
} as ScoreState;
describe("score reducer", () => {

    it("should handle initial state", () => {
        expect(ScoreReducer(undefined, { type: "unknown" })).toEqual({
            scores: {}
        });
    });

    it("should handle incrementScore", () => {
        const actual = ScoreReducer(initialState, incrementScore("ABC-123"));
        expect(actual.scores).toEqual({ "ABC-123": 3 });
    });

    it("should handle setScore", () => {
        const actual = ScoreReducer(initialState, setScore({ quizId: "ABC-123", score: 5 }));
        expect(actual.scores).toEqual({ "ABC-123": 5 });
    });

    it("should handle incrementScore when no prior score (starts at 0)", () => {
        const actual = ScoreReducer({ scores: {} }, incrementScore("NEW-QUIZ"));
        expect(actual.scores["NEW-QUIZ"]).toBe(1);
    });
});
