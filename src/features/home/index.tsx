import React from "react";
import styles from "./styles.module.css";
import { LogoSansCompass } from "../../assets/images/logo-sans-compass";
import { LogoCompassOnly } from "../../assets/images/logo-compass-only";
import { useAppSelector } from "../../app/hooks";
import { selectLatestQuiz, selectQuizzes } from "../loader/loader-slice";
import { Link, useNavigate } from "react-router-dom";
import { date2String } from "../../libs/date-helpers";

const HomeScreen = () => {
    const navigate = useNavigate();

    const latestQuiz = useAppSelector(selectLatestQuiz);
    const quizzes = useAppSelector(selectQuizzes);
    const handleClick = () => {
        navigate("/quiz/" + latestQuiz?.id);
    };

    return (
        <>
            {quizzes.length > 1 && <Link className={styles.quiz_list} to={"/quiz-list"}>More Trivia</Link>}
            <div className={styles.home_screen}>
                <div className={styles.home_screen_logo}>
                    <span className={styles.non_spinny_logo}><LogoCompassOnly/></span>
                    <span className={styles.spinny_logo}><LogoSansCompass/></span>
                </div>
                <div className={styles.home_screen_header}>
                    <h1>GMC-BTV Trail Trivia</h1>
                </div>
                <p className={styles.message}>{"A new trivia challenge every Friday"}</p>
                <p className={styles.quiz_title}>{latestQuiz?.title || ""}</p>
                <div className={styles.latest_quiz}>
                    <button onClick={handleClick} className={styles.play_button}>
                        <span>{"Play"}</span>
                    </button>
                </div>
                <div>
                    <p>{date2String(latestQuiz?.publishDate)}</p>
                    {latestQuiz?.author && <p>Quiz courtesy of {latestQuiz?.author}</p>}
                </div>
            </div>
        </>
    )
        ;
};

export default HomeScreen;