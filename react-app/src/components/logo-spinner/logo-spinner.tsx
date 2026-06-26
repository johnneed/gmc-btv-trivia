import React from "react";

import styles from "./styles.module.css";

import { LogoCompassOnly } from "../../assets/images/logo-compass-only";
import { LogoSansCompass } from "../../assets/images/logo-sans-compass";


const LogoSpinner = () => {


    return (
        <div className={styles.logo_spinner}>
            <span><LogoCompassOnly/></span>
            <span><LogoSansCompass/></span>
        </div>
    );

};

export default LogoSpinner;