import React from "react";
import styles from "./styles.module.css";
import { QuizCard } from "../../components/quiz-card";
import { useAppSelector } from "../../app/hooks";
import { selectQuizzes } from "../loader/loader-slice";
import bear from "../../assets/images/bear.svg";
import tent from "../../assets/images/tent.svg";
import compass from "../../assets/images/compass.svg";
import mountain from "../../assets/images/mountain.svg";
import mapleLeaf from "../../assets/images/maple-leaf.svg";
import backpack from "../../assets/images/backpack.svg";
import { Link } from "react-router-dom";

const assignGraphic = (index: number) => {
    switch (0) {
        case (index % 6):
            return bear;
        case(index % 5):
            return compass;
        case(index % 4):
            return tent;
        case(index % 3):
            return mountain;
        case(index % 2):
            return mapleLeaf;
        default:
            return backpack;
    }
};

const QuizListScreen = () => {
    const quizzes = useAppSelector(selectQuizzes);
    return (
        <div className={styles.home_screen}>
            <div className={styles.home_screen_header}>
                <h1><Link to ='/'>GMC-BTV Trail Trivia</Link></h1>
                <div className={styles.quiz_cards}>
                    {quizzes.map((q, i) => (<div className={styles.quiz_card_container}><QuizCard key={q.id} quiz={q}
                                                                                                  image={assignGraphic(i)}/>
                    </div>))}
                </div>
            </div>

        </div>
    );
};

export default QuizListScreen;