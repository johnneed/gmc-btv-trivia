import React, { useEffect } from "react";
import styles from "./styles.module.css";
import { LogoSpinner } from "../../components/logo-spinner";
import { useAppSelector } from "../../app/hooks";
import { selectLatestQuiz } from "../loader/loader-slice";
import { date2String } from "../../libs/date-helpers";
import { scrollTop } from "../../libs/window-helpers";
import { ActionButton } from "../../components/action-button";
import { motion, useReducedMotion } from "framer-motion";

const HomeScreen = () => {
    const reduceMotion = useReducedMotion();
    const latestQuiz = useAppSelector(selectLatestQuiz);
    useEffect(() => { document.title = "Trail Trivia"; }, []);

    return (
        <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={reduceMotion ? false : { opacity: 1 }} exit={reduceMotion ? undefined : { opacity: 0 }}>
            <div className={styles.home_screen}>
                <p className={styles.message}>{"Test your trail smarts"}</p>
                <div className={styles.home_screen_header}>
                    <h1>Trail Trivia</h1>
                    <LogoSpinner/>
                </div>
                <div className={styles.latest_quiz}>
                    <ActionButton onClick={scrollTop} text={"Choose Your Game"} to={"/quiz-list"} variant={"light"}/>
                    <ActionButton text={"Play The Latest"} to={`/quiz/${latestQuiz?.id}`} variant={"dark"}/>
                </div>
                <p className={styles.quiz_title}>{latestQuiz?.title || ""}</p>
                <p className={styles.quiz_subtitle}>{latestQuiz?.subtitle || ""}</p>
                <p className={styles.author}>{date2String(latestQuiz?.publishDate)}</p>
            </div>
        </motion.div>
    );
};

export default HomeScreen;