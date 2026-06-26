import React from "react";
import styles from "./styles.module.css";
import { Link } from "react-router-dom";

interface ActionButtonProps  {
    text: string;
    to: string;
    variant?: "dark" | "light";
    onClick?: () => void;
}

const ActionButton = ({ text, to, variant = "dark", onClick = () => void 0 }: ActionButtonProps) => {


    return (
        <Link
            onClick={onClick}
            className={`${styles.action_button} ${variant === "light" ? styles.light_button : styles.dark_button}`}
            to={to}>
            {text}
        </Link>
    );

};

export default ActionButton;