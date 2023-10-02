import React, { useEffect } from "react";


import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {   fetchQuizzes, selectQuizzes  } from "./loader-slice";
import "./styles.css";

 const Loader = () => {
    const quizzes = useAppSelector(selectQuizzes);
    const dispatch = useAppDispatch();

    useEffect(()=>{
        if((quizzes || []).length === 0){
            dispatch(fetchQuizzes());
        }
    },[quizzes, dispatch]);
    return (<></>);
};

export default Loader;