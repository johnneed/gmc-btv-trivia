import React, { useState } from "react";
import type { Choice } from "../../models/types";
import styles from "./styles.module.css";

interface ChoiceProps {
    choice: Choice,
    onClick: (isCorrect: boolean) => void
    isCorrect: boolean
};

const ChoiceButton = ({ choice, onClick, isCorrect }: ChoiceProps) => {

    const [hasBeenSelected, setHasBeenSelected] = useState(false);

    const handleClick = () => {
        onClick(isCorrect);
        if (!isCorrect) {
            setHasBeenSelected(true);
        }
    };

    return (
        <div className={styles.choice}>
            <button disabled={hasBeenSelected}
                    className={hasBeenSelected && isCorrect ? styles.huzzah : styles.waiting_for_clicks}
                    onClick={handleClick}>
                <span>{choice.text}</span>
            </button>
        </div>
    );

};

export default ChoiceButton;