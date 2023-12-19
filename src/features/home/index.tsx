import React from "react";
import styles from "./styles.module.css";
import { LogoSpinner } from "../../components/logo-spinner";
import { useAppSelector } from "../../app/hooks";
import { selectLatestQuiz, selectQuizzes } from "../loader/loader-slice";
import { Link, useNavigate } from "react-router-dom";
import { date2String } from "../../libs/date-helpers";
import { scrollTop } from "../../libs/window-helpers";

const HomeScreen = () => {
    const navigate = useNavigate();

    const latestQuiz = useAppSelector(selectLatestQuiz);
    const quizzes = useAppSelector(selectQuizzes);


    return (
        <>
            <div className={styles.home_screen}>
                <p className={styles.message}>{"A new trivia challenge every Friday"}</p>
                <div className={styles.home_screen_header}>
                    <h1>Trail Trivia</h1>
                    <LogoSpinner/>
                </div>
                <p className={styles.quiz_title}>{latestQuiz?.title || ""}</p>
                <p className={styles.quiz_subtitle}>{latestQuiz?.subtitle || ""}</p>
                <div className={styles.latest_quiz}>
                    <Link className={styles.play_button} to={`/quiz/${latestQuiz?.id}`}>{"Play"}</Link>
                    {quizzes.length > 1 &&
                        <Link onClick={scrollTop} className={styles.quiz_list_button} to={"/quiz-list"}>More Trivia!</Link>}
                </div>




                <div>
                    <p>{date2String(latestQuiz?.publishDate)}</p>
                    {latestQuiz?.author && <p>This week's quiz master is: <br/>{latestQuiz?.author}</p>}
                </div>
            </div>

        </>
    );
};

export default HomeScreen;