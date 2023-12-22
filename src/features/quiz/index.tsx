import React, { useEffect } from "react";
import styles from "./styles.module.css";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectQuizzes } from "../loader/loader-slice";
import * as R from "ramda";
import { Carousel } from "../../components/carousel";
import type { Quiz } from "../../models/types";
import { incrementScore, setScore } from "../score/score-slice";

const QuizScreen = () => {
    const { qid, questionIndex   } = useParams();
    const quiz = R.compose(R.find((q: Quiz) => q.id === qid), useAppSelector)(selectQuizzes);
    const dispatch = useAppDispatch();
    const qIndex =  isNaN(Number(questionIndex)) ? 0 : Number(questionIndex);
    useEffect(() => {
        if (!qIndex && qid) {
            dispatch(setScore({ quizId: qid, score: 0 }));
        }
    }, [dispatch, qid, qIndex]);

    if (!quiz) {
        return (<div className={styles.quiz_screen}>
            <p>Sorry, we couldn't find that quiz</p>
            <Link to="/">Back to Trail Trivia</Link>
        </div>);
    }


    return (
        <div className={styles.quiz_screen}>
            <div className={styles.quiz_box}>
                <div className={styles.quiz_box_content}>
                    <Carousel incrementScore={() => dispatch(incrementScore(quiz.id))} quiz={quiz} questionIndex={qIndex}/>
                </div>
            </div>
            {quiz.questions.filter(q => Boolean(q.answerImage)).map(q => <img alt={"preload"} key={q.id} src={q.answerImage} style={{ display: "none" }}/>)}
        </div>
    );
};

export default QuizScreen;