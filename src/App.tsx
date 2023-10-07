import React from "react";
import "./App.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import QuizScreen from "./features/quiz";
import HomeScreen from "./features/home";
import ScoreScreen from "./features/score";
import Loader from "./features/loader";
import QuizListScreen from "./features/quiz-list";
import { store } from "./app/store";
import { Provider } from "react-redux";

const router = createBrowserRouter([
        {
            path: "/trail-trivia/",
            element: (<HomeScreen/>),
            errorElement: (<Navigate to="/trail-trivia/" replace={true}/>)
        },
        {
            path: "/trail-trivia/quiz-list",
            element: (<QuizListScreen/>),
            errorElement: (<Navigate to="/trail-trivia/" replace={true}/>)
        },
        {
            path: "/trail-trivia/quiz/:qid",
            element: (<QuizScreen/>),
            errorElement: (<Navigate to="/trail-trivia/" replace={true}/>)
        },
        {
            path: "score/:qid",
            element: (<ScoreScreen/>),
            errorElement: (<Navigate to="/trail-trivia/" replace={true}/>)
        },
        {
            path: "*",
            // eslint-disable-next-line react/jsx-no-undef
            element: (<Navigate to="/trail-trivia/" replace={true}/>)
        }
    ])
;

function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <Loader/>
                <RouterProvider router={router}/>
            </div>
        </Provider>
    )
        ;
}

export default App;
