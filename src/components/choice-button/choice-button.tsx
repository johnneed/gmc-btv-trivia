import React, { useState } from "react";
import type { Choice } from "../../models/types";
import styles from "./styles.module.css";
import rightAnswer from "../../assets/images/right-answer.svg";
import wrongAnswer from "../../assets/images/wrong-answer.svg";
import notAnswered from "../../assets/images/not-answered.svg";

import * as R from "ramda";

interface ChoiceProps {
    choice: Choice,
    onClick: (isCorrect: boolean) => void
    isCorrect: boolean
}

const ChoiceButton = ({ choice, onClick, isCorrect }: ChoiceProps) => {

    const [hasBeenSelected, setHasBeenSelected] = useState(false);
    const icon = R.cond([
        [() => hasBeenSelected && isCorrect, R.always(rightAnswer)],
        [() => hasBeenSelected && !isCorrect, R.always(wrongAnswer)],
        [R.T, R.always(notAnswered)]])();

    const handleClick = () => {
        onClick(isCorrect);
        if (!isCorrect) {
            setHasBeenSelected(true);
        }
    };

    return (
        <div className={styles.choice}>
            <img className={styles.icon} src={icon} alt={"Answer Icon"}/>
            <button disabled={hasBeenSelected}
                    className={hasBeenSelected && isCorrect ? styles.huzzah : styles.waiting_for_clicks}
                    onClick={handleClick}>
                <span>{choice.text}</span>
            </button>
        </div>
    );

};

export default ChoiceButton;