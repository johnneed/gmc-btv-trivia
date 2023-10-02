import React from "react";
import styles from "./styles.module.css";
import logo_sans_compass from "../../assets/images/logo_sans_compass.svg";
import logo_compass_only from "../../assets/images/logo_compass_only.svg";
import { useAppSelector } from "../../app/hooks";
import { selectScore } from "./score-slice";
import { Link, useNavigate } from "react-router-dom";
const ScoreScreen = () => {
    const navigate = useNavigate();
    const score = useAppSelector(selectScore);
    return (
        <div className={styles.score_screen}>
            <div className={styles.score_screen_header}>
                <h1>GMC-BTV Trail Trivia</h1>
            </div>
            <p className={styles.message}>{`You got ${score} out of ${quiz.questions.length} right on the first try`</p>
            <p className={styles.quiz_title}>{latestQuiz?.title || ""}</p>
            <div className={styles.latest_quiz}>
                <Link to={"/"}>Back to Trail Trivia</Link>
            </div>

        </div>
    );
};

export default ScoreScreen;