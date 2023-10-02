import React from "react";
import styles from "./styles.module.css";
import logo_sans_compass from "../../assets/images/logo_sans_compass.svg";
import logo_compass_only from "../../assets/images/logo_compass_only.svg";
import { useAppSelector } from "../../app/hooks";
import { selectLatestQuiz } from "../loader/loader-slice";
// import { selectCount } from "../counter/counterSlice";
import { useNavigate } from "react-router-dom";
import { date2String } from "../../libs/date-helpers";

const HomeScreen = () => {
    const navigate = useNavigate();

    const latestQuiz = useAppSelector(selectLatestQuiz);

    const handleClick = () => {
        navigate("/quiz/" + latestQuiz?.id);
    };

    return (
        <div className={styles.home_screen}>
            <div className={styles.home_screen_logo} style={{ backgroundImage: `url(${logo_compass_only})` }}>
                <img src={logo_sans_compass} className={styles.spinny_logo} alt="logo"/>
            </div>
            <div className={styles.home_screen_header}>
                <h1>GMC-BTV Trail Trivia</h1>
            </div>
            <p className={styles.message}>{"Test your trail smarts with this week's quiz"}</p>
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
    );
};

export default HomeScreen;