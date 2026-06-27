import * as R from "ramda";
import type Quiz from "../types/quiz.type";

const sortByDateDesc = R.sort<Quiz>(R.descend(R.prop("publishDate")));

const filterPublished = R.filter<Quiz>((q) => q.publishDate <= Date.now());

const filterByStatus = (status: Quiz["status"]) =>
    R.filter<Quiz>((q) => q.status === status);

export { sortByDateDesc, filterPublished, filterByStatus };
