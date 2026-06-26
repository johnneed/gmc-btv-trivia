import React, { useEffect } from "react";


import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchQuizzes, selectQuizzes, selectStatus } from "./loader-slice";
import "./styles.css";

const Loader = () => {
    const quizzes = useAppSelector(selectQuizzes);
    const fetchStatus = useAppSelector(selectStatus);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if ((quizzes || []).length === 0 && fetchStatus === "idle") {
            dispatch(fetchQuizzes());
        }
    }, []);
    return (<></>);
};

export default Loader;