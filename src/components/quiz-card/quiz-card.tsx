import React from "react";
import type { Quiz } from "../../models/types";
import styles from "./styles.module.css";
import { Link } from "react-router-dom";

interface QuizCardProps {
    quiz: Quiz;
    children: any;
}

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};
const QuizCard = ({ children, quiz  }: QuizCardProps) => {
    const publishedDateString = new Date(quiz.publishDate).toLocaleDateString("en-us", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    return (
        <Link onClick={scrollToTop} className={styles.quiz_card} to={`/quiz/${quiz.id}`}>
            <span className={styles.quiz_card_title}>{quiz.title}</span>
            <span className={styles.quiz_card_image}>
                {children}
            </span>
            <span>
                <span className={styles.quiz_card_date}>{publishedDateString}</span>
                <span className={styles.quiz_card_author}>{`by ${quiz.author}`}</span>
            </span>
        </Link>
    );

};

export default QuizCard;