import React from "react";
import styles from "./styles.module.css";

interface ProgressBarProps {
    current: number;
    total: number;
    label?: string;
}

const ProgressBar = ({ current, total, label }: ProgressBarProps) => (
    <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={label ?? `Question ${current} of ${total}`}
        className={styles.track}
    >
        <div className={styles.fill} style={{ width: `${(current / total) * 100}%` }} />
    </div>
);

export default ProgressBar;
