import React from "react";
import "./App.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import QuizScreen from "./features/quiz";
import HomeScreen from "./features/home";
import ScoreScreen from "./features/score";
import Loader from "./features/loader";

const router = createBrowserRouter([
        {
            path: "/",
            element: (<HomeScreen/>),
            errorElement: (<Navigate to="/" replace={true}/>)
        },
        {
            path: "quiz/:qid",
            element: (<QuizScreen/>),
            errorElement: (<Navigate to="/" replace={true}/>)
        },
        {
            path: "score/:qid",
            element: (<ScoreScreen/>),
            errorElement: (<Navigate to="/" replace={true}/>)
        },
        {
            path: "*",
            // eslint-disable-next-line react/jsx-no-undef
            element: (<Navigate to="/" replace={true}/>)
        }
    ])
;

function App() {
    return (
        <div className="App">
            <Loader/>
            <RouterProvider router={router}/>
        </div>
    )
        ;
}

export default App;
