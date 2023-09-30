import React, { useState } from "react";
import type { Question, Quiz } from "../../models/types";
import { ChoiceButton } from "../choice-button";
import styles from "./styles.module.css";
import { Link } from "react-router-dom";

interface CarouselProps {
    quiz: Quiz;
};

interface AnswerBoxProps {
    question: Question;
    handleNext: () => void;
    isLast: boolean;
};

interface QuestionBoxProps {
    question: Question;
    handleSelect: (x: boolean) => void;
};


const QuestionComponent = ({ question, handleSelect }: QuestionBoxProps) => (
    <article className={styles.question_box}>
        <div>{question.questionText}</div>
        <div>
            {question.choices.map((c, index) => (
                <ChoiceButton key={index} choice={c} isCorrect={index === question.correctAnswerIndex}
                              onClick={handleSelect}/>))}
        </div>
    </article>
);

const AnswerComponent = ({ question }: AnswerBoxProps) => (
    <article className={styles.answer_box}>
        <div><img src={question.answerImage} alt={question.answerImageAlt}/></div>
        <div>{question.answerText}</div>
    </article>
);


const Carousel = ({ quiz }: CarouselProps) => {

    const [questionIndex, setQuestionIndex] = useState(0);
    const [isCurrentQuestionAnswered, setIsCurrentQuestionAnswered] = useState(false);
    const handleSelect = (isAnswer: boolean) => {
        if (isAnswer) {
            setIsCurrentQuestionAnswered(true);
        }
    };

    const nextQuestion = () => {
        setQuestionIndex(questionIndex + 1);
        setIsCurrentQuestionAnswered(false);
    };

    return (
        <div className={styles.carousel}>
            {
                isCurrentQuestionAnswered
                    ? (
                        <>
                            <AnswerComponent isLast={questionIndex === quiz.questions.length}
                                             handleNext={nextQuestion}
                                             question={quiz.questions[questionIndex]}/>
                            <div>
                                {
                                    questionIndex >= quiz.questions.length - 1
                                        ? (<Link to={"/"}>Congratulations!</Link>)
                                        : (<button onClick={() => nextQuestion()}>Next Question</button>)
                                }
                            </div>
                        </>
                    )

                    : (
                        <QuestionComponent handleSelect={handleSelect}
                                           question={quiz.questions[questionIndex]}/>
                    )
            }
        </div>
    );
};

export default Carousel;