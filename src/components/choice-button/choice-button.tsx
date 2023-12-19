import React, { useState } from "react";
import type { Choice } from "../../models/types";
import styles from "./styles.module.css";
import wrongAnswer from "../../assets/images/wrong-answer.svg";

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
        <div className={`${styles.choice} ${hasBeenSelected ? styles.ahh_too_bad : styles.pick_me}`} style={{ backgroundImage: `url(${wrongAnswer})` }}>
            <div className={styles.button_container}>
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