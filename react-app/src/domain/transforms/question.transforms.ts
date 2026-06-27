import * as R from "ramda";
import type { Question } from "../types";

const isComplete = (question: Question): boolean =>
    R.allPass([
        (q: Question) => q.questionText.trim().length > 0,
        (q: Question) => q.choices.length === 4,
        (q: Question) => R.all((c) => c.text.trim().length > 0, q.choices),
    ])(question);

export { isComplete };
