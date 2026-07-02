import React, { useState } from "react";
import type { Question, Quiz } from "../../domain/types";
import { ChoiceButton } from "../choice-button";
import styles from "./styles.module.css";
import { Link } from "react-router-dom";
import { splitOnCarriageReturn } from "../../libs/string-helpers";
import { scrollTop } from "../../libs/window-helpers";
import { motion, useReducedMotion } from "framer-motion";

interface CarouselProps {
    quiz: Quiz;
    questionIndex?: number;
    incrementScore: () => void;
    onNext?: (nextIndex: number) => void;
    onComplete?: () => void;
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
        <h2 id={`question-${question.id}`} className={styles.question_text}>{question.questionText}</h2>
        <div role="group" aria-labelledby={`question-${question.id}`} className={styles.choices_container}>
            {question.choices.map((c, index) => (
                <ChoiceButton key={index} choice={c} isCorrect={index === question.correctAnswerIndex}
                              onClick={handleSelect}/>))}
        </div>
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
                    <div className={styles.answer_text}>
                        {splitOnCarriageReturn(question.answerText).map((text, i) => (<p key={i}>{text}</p>))}
                    </div>
                </article>
            )
        }
    </div>
);


const Carousel = ({ quiz, incrementScore, questionIndex = 0, onNext, onComplete }: CarouselProps) => {
    const reduceMotion = useReducedMotion();
    const [isCurrentQuestionAnswered, setIsCurrentQuestionAnswered] = useState(false);
    const [isFirstTry, setIsFirstTry] = useState(true);

    const handleSelect = (isAnswer: boolean) => {
        if (isAnswer) {
            setIsCurrentQuestionAnswered(true);
            if (isFirstTry) {
                incrementScore();
            }
            scrollTop();
        } else {
            setIsFirstTry(false);
        }
    };


    const nextQuestion = () => {
        setIsCurrentQuestionAnswered(false);
        setIsFirstTry(true);
        scrollTop();
    };

    const currentQuestion = quiz.questions[questionIndex];
    if (!currentQuestion) {
        return <div className={styles.carousel}><p>No question found.</p></div>;
    }

    return (
        <motion.div initial={reduceMotion ? false : { translateX: "101vw" }} animate={reduceMotion ? false : { translateX: "0vw" }}>
            <div className={styles.carousel}>
                {
                    isCurrentQuestionAnswered
                        ? (
                            <>
                                <AnswerComponent isLast={questionIndex === quiz.questions.length}
                                                 handleNext={nextQuestion}
                                                 question={currentQuestion}/>
                                <div>
                                    {
                                        questionIndex >= quiz.questions.length - 1
                                            ? (
                                                <div className={styles.congratulations}>
                                                    <div>
                                                        <span>{"🎉"}</span>
                                                        <span>
                                                    {onComplete
                                                        ? (
                                                            <button className={styles.congrats_text}
                                                                    style={{ background: "none" }}
                                                                    onClick={() => { onComplete(); scrollTop(); }}>
                                                                You survived the quiz!<br/>
                                                                Checkout your score.
                                                            </button>
                                                        )
                                                        : (
                                                            <Link onClick={scrollTop} className={styles.congrats_text}
                                                                  to={`/score/${quiz.id}`}>
                                                                You survived the quiz!<br/>
                                                                Checkout your score.
                                                            </Link>
                                                        )
                                                    }
                                                    </span>
                                                        <span>{"🎉"}</span>
                                                    </div>
                                                </div>
                                            )
                                            : (
                                                onNext
                                                    ? (
                                                        <button className={styles.next_question}
                                                                style={{ background: "none" }}
                                                                onClick={() => { nextQuestion(); onNext(questionIndex + 1); }}>
                                                            Next Question <span>{"▷"}</span>
                                                        </button>
                                                    )
                                                    : (
                                                        <Link to={`/quiz/${quiz.id}/${questionIndex + 1}`}
                                                              className={styles.next_question} onClick={() => nextQuestion()}>
                                                            Next Question <span>{"▷"}</span>
                                                        </Link>
                                                    )
                                            )
                                    }
                                </div>
                            </>
                        )

                        : (
                            <QuestionComponent handleSelect={handleSelect}
                                               question={currentQuestion}/>
                        )
                }
            </div>
        </motion.div>
    );
};

export default Carousel;
