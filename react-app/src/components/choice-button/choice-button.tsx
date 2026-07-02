import React, { useState } from "react";
import type { Choice } from "../../domain/types";
import styles from "./styles.module.css";

interface ChoiceProps {
    choice: Choice,
    onClick: (isCorrect: boolean) => void
    isCorrect: boolean
}


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
            <div
                className={`${styles.button_container} ${hasBeenSelected ? styles.ahh_too_bad : ""}`}
            >
                <button
                    disabled={hasBeenSelected}
                    onClick={handleClick}>
                    <span><span>{choice.text}</span></span>
                </button>
            </div>
        </div>
    );

};

export default ChoiceButton;