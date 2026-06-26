import * as R from "ramda";
import type Quiz from "../types/quiz.type";

const sortByDateDesc = R.sort<Quiz>(R.descend(R.prop("publishDate")));

export { sortByDateDesc };
