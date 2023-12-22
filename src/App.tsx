import React from "react";
import "./App.css";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import QuizScreen from "./features/quiz";
import HomeScreen from "./features/home";
import ScoreScreen from "./features/score";
import Loader from "./features/loader";
import QuizListScreen from "./features/quiz-list";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router";


function TriviaRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence >
            <Routes location={location} key={location.pathname}>
                <Route path="/" Component={HomeScreen}/>
                <Route path="/quiz-list" Component={QuizListScreen}/>
                <Route path="/score/:qid" Component={ScoreScreen}/>
                <Route path="/quiz/:qid/:questionIndex?" Component={QuizScreen}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </AnimatePresence>
    );
}


function App() {

    return (
        <Provider store={store}>
            <div className="App">
                <Loader/>
                <HashRouter>
                    <TriviaRoutes/>
                </HashRouter>
            </div>
        </Provider>
    )
        ;
}

export default App;
