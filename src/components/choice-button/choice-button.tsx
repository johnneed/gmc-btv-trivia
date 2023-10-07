import React, { useState } from "react";
import type { Choice } from "../../models/types";
import styles from "./styles.module.css";
import { RightAnswer } from "../../assets/images/right-answer";
import { WrongAnswer } from "../../assets/images/wrong-answer";
import { NotAnswered } from "../../assets/images/not-answered";

import * as R from "ramda";

interface ChoiceProps {
    choice: Choice,
    onClick: (isCorrect: boolean) => void
    isCorrect: boolean
}

const ChoiceButton = ({ choice, onClick, isCorrect }: ChoiceProps) => {

    const [hasBeenSelected, setHasBeenSelected] = useState(false);
    const icon = R.cond([
        [() => hasBeenSelected && isCorrect, R.always(<RightAnswer/>)],
        [() => hasBeenSelected && !isCorrect, R.always(<WrongAnswer/>)],
        [R.T, R.always(<NotAnswered/>)]])();

    const handleClick = () => {
        onClick(isCorrect);
        if (!isCorrect) {
            setHasBeenSelected(true);
        }
    };

    return (
        <div className={styles.choice}>
            <div>{icon}</div>
            <div>
                <button disabled={hasBeenSelected}
                    className={hasBeenSelected && isCorrect ? styles.huzzah : styles.waiting_for_clicks}
                    onClick={handleClick}>
                <span>{choice.text}</span>
            </button>
            </div>
        </div>
    );

};

export default ChoiceButton;