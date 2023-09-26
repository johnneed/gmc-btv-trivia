import React from "react";
import "./App.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import QuizScreen from "./features/quiz"
import HomeScreen from "./features/home"

const router = createBrowserRouter([
        {
            path: "/",
            element: (<HomeScreen/>),
            errorElement: (<Navigate to="/" replace={true}/>)
        },
        {
            path: "quiz",
            element: (<QuizScreen/>),
            errorElement: (<Navigate to="/" replace={true}/>)
        },
        {
            path: "*",
            // eslint-disable-next-line react/jsx-no-undef
            element: (<Navigate to="/" replace={true}/>)
        },
    ])
;

function App() {
    return (
        <div className="App">
            <RouterProvider router={router}/>
        </div>
    )
        ;
}

export default App;
