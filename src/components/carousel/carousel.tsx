import React, { useState } from "react";
import type { Question, Quiz } from "../../models/types";
import { ChoiceButton } from "../choice-button";
import styles from "./styles.module.css";
import { Link } from "react-router-dom";
import { splitOnCarriageReturn } from "../../libs/string-helpers";

interface CarouselProps {
    quiz: Quiz;
    incrementScore: () => void;
}

interface AnswerBoxProps {
    question: Question;
    handleNext: () => void;
    isLast: boolean;
}

interface QuestionBoxProps {
    question: Question;
    handleSelect: (x: boolean) => void;
}


const QuestionComponent = ({ question, handleSelect }: QuestionBoxProps) => (
    <article className={styles.question_box}>
        <div className={styles.question_text}>{question.questionText}</div>
        {question.choices.map((c, index) => (
            <ChoiceButton key={index} choice={c} isCorrect={index === question.correctAnswerIndex}
                          onClick={handleSelect}/>))}
    </article>
);

const AnswerComponent = ({ question }: AnswerBoxProps) => (
    <div className={styles.answer}>
        <h4 className={styles.huzzah}>Huzzah!</h4>
        {question.answerImage
            ? (
                <article className={styles.answer_box}>
                    <div className={styles.answer_picture}>
                    <figure>
                        <img src={question.answerImage} alt={question.answerImageAlt}/>
                        <figcaption>{question.answerImageCaption}</figcaption>
                    </figure>
                    </div>
                    <div className={styles.answer_text}>
                        {splitOnCarriageReturn(question.answerText).map((text, i) => (<p key={i}>{text}</p>))}
                    </div>
                </article>
            )
            : (
                <article className={styles.answer_box_no_image}>
                    <div>
                        {splitOnCarriageReturn(question.answerText).map((text, i) => (<p key={i}>{text}</p>))}
                    </div>
                </article>
            )
        }
    </div>
);


const Carousel = ({ quiz, incrementScore }: CarouselProps) => {

    const [questionIndex, setQuestionIndex] = useState(0);
    const [isCurrentQuestionAnswered, setIsCurrentQuestionAnswered] = useState(false);
    const [isFirstTry, setIsFirstTry] = useState(true);
    const handleSelect = (isAnswer: boolean) => {
        if (isAnswer) {
            setIsCurrentQuestionAnswered(true);
            if (isFirstTry) {
                incrementScore();
            }
        } else {
            setIsFirstTry(false);
        }
    };

    const nextQuestion = () => {
        setQuestionIndex(questionIndex + 1);
        setIsCurrentQuestionAnswered(false);
        setIsFirstTry(true);
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
                                        ? (
                                            <div className={styles.congratulations}>
                                                <div>
                                                    <span>{"🎉"}</span>
                                                    <span>
                                                    <Link className={styles.congrats_text} to={`/score/${quiz.id}`}>
                                                        Congratulations!<br/>
                                                        You survived the quiz.<br/>
                                                        Checkout your score.
                                                    </Link>
                                                    </span>
                                                    <span>{"🎉"}</span>
                                                </div>
                                            </div>
                                        )
                                        : (
                                            <button className={styles.next_question} onClick={() => nextQuestion()}>
                                                Next Question <span>{"\u2192"}</span>
                                            </button>
                                        )
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