import React, { useEffect } from "react";
import styles from "./styles.module.css";
import { useAppSelector } from "../../app/hooks";
import { selectScores } from "./score-slice";
import { useParams } from "react-router-dom";
import { selectQuizzes } from "../loader/loader-slice";
import { scrollTop } from "../../libs/window-helpers";
import { SocialButtons } from "../../components/social-buttons";
import { ActionButton } from "../../components/action-button";
import { motion, useReducedMotion } from "framer-motion";

const ScoreScreen = () => {
    const reduceMotion = useReducedMotion();
    const { qid } = useParams();
    useEffect(() => { document.title = "Trail Trivia — Your Score"; }, []);
    const score = useAppSelector(selectScores)[qid || ""];
    const quizzes = useAppSelector(selectQuizzes);
    const quiz = quizzes.find((q) => q.id === qid);

    return (
        <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={reduceMotion ? false : { opacity: 1 }} exit={reduceMotion ? undefined : { opacity: 0 }}>
            <div className={styles.score_screen}>
                <div className={styles.score_screen_header}>
                    <h1>Trail Trivia</h1>
                </div>
                <div aria-live="assertive">
                    {
                        (score === undefined || quiz === undefined)
                            ? (<p className={styles.message}>Congratulations!</p>)
                            : (<p className={styles.message}>
                                {`You got ${score} out of ${quiz.questions.length} right on the first try!`}
                            </p>)
                    }
                </div>
                <div className={styles.score_screen_share_buttons}>
                    <SocialButtons/>
                </div>
                <div className={styles.nav_buttons}>
                    <ActionButton onClick={scrollTop} text="Past Games" variant="dark" to={"/quiz-list"}/>
                    <ActionButton variant={"light"} to={"/"} text={"◁ Back to Trail Trivia"}/>
                </div>
            </div>
        </motion.div>
    );
};

export default ScoreScreen;
