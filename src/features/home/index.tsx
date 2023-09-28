import React from "react";
import "./styles.css";
import logo from "./logo.svg";
import { useAppSelector } from "../../app/hooks";
import { selectQuizzes } from "../loader/loaderSlice";
// import { selectCount } from "../counter/counterSlice";
import * as R from "ramda";
import type { Quiz } from "../../models/types";

const HomeScreen = () => {
    const sortedQuizzes = R.compose(
        R.sort((a: Quiz, b: Quiz) => (b.publishDate.getTime() - a.publishDate.getTime())),
        useAppSelector
    )(selectQuizzes);
    console.log(JSON.stringify(sortedQuizzes));
    return (
        <div className={"home-screen"}>
            <div className={"home-screen_header"}><img src={logo} className="App-logo" alt="logo"/><h1>GMC BTV TRAIL
                TRIVIA</h1></div>
            <div className={"home-screen_latest-quiz"}>
                <div>{(sortedQuizzes)[0].title}</div>
            </div>
        </div>
    );
};

export default HomeScreen;