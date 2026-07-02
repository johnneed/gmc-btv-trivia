import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { adminStore } from "../../store";
import PreviewModal from "./preview-modal";
import { Quiz } from "../../../domain/types";

const mockQuiz: Quiz = {
    id: "test-quiz",
    title: "Test Quiz",
    subtitle: "Test Subtitle",
    questions: [
        {
            id: "q1",
            text: "Question 1",
            choices: ["A", "B", "C", "D"],
            answer: "A",
            explanation: "Explanation 1"
        }
    ],
    tags: [],
    status: "draft",
    author: "Test Author",
    publishDate: Date.now()
};

describe("PreviewModal", () => {
    test("renders the preview modal when open", () => {
        render(
            <Provider store={adminStore}>
                <PreviewModal
                    open={true}
                    quiz={mockQuiz}
                    onClose={() => {}}
                />
            </Provider>
        );

        // It should show the "Play" button from HomeScreen
        expect(screen.getByText(/Play/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Quiz/i)).toBeInTheDocument();
    });

    test("shows only white screen if quiz is missing (smoke test)", () => {
        // This is what the user reports. We want to see if we can reproduce it.
        // If it shows "Test Quiz", it's NOT a white screen in this test environment.
    });
});
