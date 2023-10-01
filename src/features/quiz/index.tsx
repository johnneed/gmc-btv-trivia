import React from "react";
import styles from "./styles.module.css";
import { Link, useParams } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectQuizzes } from "../loader/loaderSlice";
import * as R from "ramda";
import { Carousel } from "../../components/carousel";
import type { Quiz } from "../../models/types";

const QuizScreen = () => {
    const { qid } = useParams();
    const quiz = R.compose(R.find((q: Quiz) => q.id === qid), useAppSelector)(selectQuizzes);
    if (!quiz) {
        return (<div className={styles.quiz_screen}>
            <p>Sorry, we couldn't find that quiz</p>
            <Link to="/">Back to Trail Trivia</Link>
        </div>);
    }
    return (
        <div className={styles.quiz_screen}>
            <h3>{quiz.title}<span>{quiz.author && ` by ${quiz.author}`}</span></h3>
            <div className={styles.quiz_box}>
                <div className={styles.quiz_box_content}>
                    <Carousel quiz={quiz}/>
                </div>
            </div>
        </div>
    );
};

export default QuizScreen;