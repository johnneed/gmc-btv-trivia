import React from "react";
import styles from "./styles.module.css";
import { LogoSpinner } from "../../components/logo-spinner";
import { useAppSelector } from "../../app/hooks";
import { selectLatestQuiz, selectQuizzes } from "../loader/loader-slice";
import { date2String } from "../../libs/date-helpers";
import { scrollTop } from "../../libs/window-helpers";
import { ActionButton } from "../../components/action-button";
import { motion } from "framer-motion";

const HomeScreen = () => {

    const latestQuiz = useAppSelector(selectLatestQuiz);
    const quizzes = useAppSelector(selectQuizzes);



    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={styles.home_screen}>
                <p className={styles.message}>{"A new trivia challenge every Friday"}</p>
                <div className={styles.home_screen_header}>
                    <h1>Trail Trivia</h1>
                    <LogoSpinner/>
                </div>
                <p className={styles.quiz_title}>{latestQuiz?.title || ""}</p>
                <p className={styles.quiz_subtitle}>{latestQuiz?.subtitle || ""}</p>
                <div className={styles.latest_quiz}>
                    <ActionButton text={"Play"} to={`/quiz/${latestQuiz?.id}`} variant={"dark"}/>

                    {quizzes.length > 1 &&
                        <ActionButton onClick={scrollTop} text={"Past Games"} to={"/quiz-list"}
                                      variant={"light"}/>}
                </div>
                <div>
                    <p>{date2String(latestQuiz?.publishDate)}</p>
                    {latestQuiz?.author && <p>This week's quiz master is: <br/>{latestQuiz?.author}</p>}
                </div>
            </div>
        </motion.div>
    );
};

export default HomeScreen;