import React from "react";
import styles from "./styles.module.css";

import { useAppSelector } from "../../app/hooks";
import { selectScores } from "./score-slice";
import { Link, useParams } from "react-router-dom";
import { selectQuizzes } from "../loader/loader-slice";
import { scrollTop } from "../../libs/window-helpers";

const ScoreScreen = () => {

    const { qid } = useParams();
    const score = useAppSelector(selectScores)[qid || ""];
    const quizzes = useAppSelector(selectQuizzes);
    const quiz = quizzes.find((q) => q.id === qid);

    return (
        <>
            <div className={styles.score_screen}>
                <div className={styles.score_screen_header}>
                    <h1>Trail Trivia</h1>
                </div>
                {
                    (score === undefined || quiz === undefined)
                        ? (<>
                                <p className={styles.message}>Sorry, we couldn't find that quiz.</p>
                                <div className={styles.back_button}>
                                    <Link to={"/"}>Back to Trail Trivia</Link>
                                </div>
                            </>
                        ) :
                        (
                            <>
                                <p className={styles.message}>{`You got ${score} out of ${quiz.questions.length} right on the first try!`}</p>
                                <div className={styles.back_button}>
                                    <Link to={"/"}>Back to Trail Trivia</Link>
                                </div>
                            </>
                        )}
            </div>
            {quizzes.length > 1 && <Link onClick={scrollTop} className={styles.quiz_list} to={"/quiz-list"}>More
                Trivia!</Link>}
        </>
    );
};

export default ScoreScreen;