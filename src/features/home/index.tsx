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
            <div className={styles.home_screen}>
                <div className={styles.home_screen_logo}>
                    <span><LogoCompassOnly/></span>
                    <span><LogoSansCompass/></span>
                </div>
                <div className={styles.home_screen_header}>
                    <h1>Trail Trivia</h1>
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
                    {latestQuiz?.author && <p>This week's quiz master is: <br/>{latestQuiz?.author}</p>}
                </div>
            </div>
            {quizzes.length > 1 && <Link className={styles.quiz_list} to={"/quiz-list"}>More Trivia!</Link>}
        </>
    );
};

export default HomeScreen;