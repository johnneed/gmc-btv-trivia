import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the h1 element", () => {
    render(<App/>);
    const titleElement = screen.getByText(/GMC-BTV Trail Trivia/i);
    expect(titleElement).toBeInTheDocument();
});
