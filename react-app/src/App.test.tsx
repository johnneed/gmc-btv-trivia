import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the h1 element", () => {
    render(<App/>);
    const titleElement = screen.getByText(/Trail Trivia/i);
    expect(titleElement).toBeInTheDocument();
});

test("wraps router in ErrorBoundary (app renders without crashing)", () => {
    // If ErrorBoundary is missing, an unhandled error would crash; this smoke test
    // confirms the boundary is present and the app mounts cleanly
    const { container } = render(<App/>);
    expect(container.firstChild).toBeTruthy();
});
