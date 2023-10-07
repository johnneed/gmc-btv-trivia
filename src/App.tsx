import React from "react";
import "./App.css";
import {  HashRouter, Navigate, Route, Routes } from "react-router-dom";
import QuizScreen from "./features/quiz";
import HomeScreen from "./features/home";
import ScoreScreen from "./features/score";
import Loader from "./features/loader";
import QuizListScreen from "./features/quiz-list";
import { store } from "./app/store";
import { Provider } from "react-redux";



function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <Loader/>
                <HashRouter>
                    <Routes>
                        <Route path="/" Component={HomeScreen}/>
                        <Route path="/quiz-list" Component={QuizListScreen}/>
                        <Route path="/score/:qid" Component={ScoreScreen}/>
                        <Route path="/quiz/:qid" Component={QuizScreen}/>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </HashRouter>
            </div>
        </Provider>
    )
        ;
}

export default App;
