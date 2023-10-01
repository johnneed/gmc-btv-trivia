import React from "react";
import styles from "./styles.module.css";
import logo_sans_compass from "../../assets/images/logo_sans_compass.svg";
import logo_compass_only from "../../assets/images/logo_compass_only.svg";
import { useAppSelector } from "../../app/hooks";
import { selectQuizzes } from "../loader/loaderSlice";
// import { selectCount } from "../counter/counterSlice";
import * as R from "ramda";
import type { Quiz } from "../../models/types";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
    const navigate = useNavigate();

    const sortedQuizzes = R.compose(
        R.sort((a: Quiz, b: Quiz) => (b.publishDate - a.publishDate)),
        useAppSelector
    )(selectQuizzes);

    const latestQuiz = sortedQuizzes[0];

    const handleClick = () => {
        navigate("/quiz/" + latestQuiz?.id);
    };

    return (
        <div className={styles.home_screen}>
            <div className={styles.home_screen_header}>
                <h1>GMC-BTV Trail Trivia</h1>
            </div>
            <div className={styles.home_screen_logo} style={{ backgroundImage: `url(${logo_compass_only})` }}>
                <img src={logo_sans_compass} className={styles.spinny_logo} alt="logo"/>
            </div>
            <div className={styles.latest_quiz}>
                <button onClick={handleClick} className={styles.play_button}>
                    <span>{"Test your trail smarts with this week's quiz"}</span>
                    <span>{latestQuiz?.title || ""}</span>
                </button>
            </div>
        </div>
    );
};

export default HomeScreen;