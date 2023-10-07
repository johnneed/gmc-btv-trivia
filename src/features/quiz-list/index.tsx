import React from "react";
import styles from "./styles.module.css";
import { QuizCard } from "../../components/quiz-card";
import { useAppSelector } from "../../app/hooks";
import { selectQuizzes } from "../loader/loader-slice";
import { Bear } from "../../assets/images/bear";
import { Tent } from "../../assets/images/tent";
import { Compass } from "../../assets/images/compass";
import { Mountain } from "../../assets/images/mountain";
import { MapleLeaf } from "../../assets/images/maple-leaf";
import { Backpack } from "../../assets/images/backpack";
import { Link } from "react-router-dom";

const assignGraphic = (index: number) => {
    switch (0) {
        case (index % 6):
            return <Bear/>;
        case(index % 5):
            return <Compass/>;
        case(index % 4):
            return <Tent/>;
        case(index % 3):
            return <Mountain/>;
        case(index % 2):
            return <MapleLeaf/>;
        default:
            return <Backpack/>;
    }
};

const QuizListScreen = () => {
    const quizzes = useAppSelector(selectQuizzes);
    return (
        <div className={styles.home_screen}>
            <div className={styles.home_screen_header}>
                <h1><Link to="/">GMC-BTV Trail Trivia</Link></h1>
                <div className={styles.quiz_cards}>
                    {quizzes.map((q, i) => (
                        <div className={styles.quiz_card_container}>
                            <QuizCard key={q.id} quiz={q}>
                                {assignGraphic(i)}
                            </QuizCard>
                    </div>))}
                </div>
            </div>
        </div>
    );
};

export default QuizListScreen;