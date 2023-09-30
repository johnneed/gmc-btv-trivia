import React from "react";
import "./styles.css";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectQuizzes } from "../loader/loaderSlice";
import * as R from "ramda";
import { Carousel } from "../../components/carousel";
import type { Quiz } from "../../models/types";

const QuizScreen = () => {
    const { qid } = useParams();
    const quiz = R.compose(R.find((q: Quiz) => q.id === qid), useAppSelector)(selectQuizzes);
    if(!quiz) {
        return (<div>Could Not Find Quiz</div>);
    }
    return (
        <div className={"quiz-screen"}>
            <h3>{quiz.title}</h3>
            <Carousel quiz={quiz}/>
        </div>
    );
};

export default QuizScreen;