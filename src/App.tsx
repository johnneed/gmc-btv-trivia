import React from 'react';
import './App.css';
import {createBrowserRouter, RouterProvider, Navigate} from "react-router-dom";
import QuizScreen from "./screens/quiz"
import HomeScreen from "./screens/home"

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
