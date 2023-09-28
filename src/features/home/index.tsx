import React from "react";
import "./styles.css";
import logo from "./logo.svg";
import { useAppSelector } from "../../app/hooks";
import { selectQuizzes } from "../loader/loaderSlice";
// import { selectCount } from "../counter/counterSlice";
import * as R from "ramda";
import type { Quiz } from "../../models/types";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
    const navigate = useNavigate();

    const sortedQuizzes = R.compose(
        R.sort((a: Quiz, b: Quiz) => (b.publishDate - a.publishDate)),
        useAppSelector
    )(selectQuizzes);

    const latestQuiz = sortedQuizzes[0];

    const handleClick = ()=> {
        navigate("/quiz/" + latestQuiz?.id);
    };


    return (
        <div className={"home-screen"}>
            <div className={"home-screen_header"}>
                <img src={logo} className="App-logo" alt="logo"/>
                <h1>GMC BTV TRAIL TRIVIA</h1>
            </div>
            <div className={"home-screen_latest-quiz"}>
                <button onClick={handleClick} className={"home-screen_play-button"}>
                    <span>{"Test yourself with this week's quiz"}</span>
                    <span>{latestQuiz?.title || ""}</span>
                </button>
            </div>
        </div>
    );
};

export default HomeScreen;