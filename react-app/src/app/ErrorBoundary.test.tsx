import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "react-error-boundary";
import ErrorBoundaryFallback from "./ErrorBoundary";

// Suppress React's console.error during intentional error boundary tests
const suppressConsoleError = () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    return spy;
};

const ThrowingChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) throw new Error("Test error");
    return <div>OK</div>;
};

describe("ErrorBoundaryFallback", () => {
    it("renders 'Something went wrong. Try again.' text", () => {
        const spy = suppressConsoleError();
        render(
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <ThrowingChild shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByText(/Something went wrong\. Try again\./)).toBeInTheDocument();
        spy.mockRestore();
    });

    it("renders a retry button", () => {
        const spy = suppressConsoleError();
        render(
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <ThrowingChild shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
        spy.mockRestore();
    });

    it("fallback container has role=alert", () => {
        const spy = suppressConsoleError();
        render(
            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <ThrowingChild shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByRole("alert")).toBeInTheDocument();
        spy.mockRestore();
    });

    it("clicking retry button calls resetErrorBoundary (fallback disappears)", async () => {
        const spy = suppressConsoleError();
        const user = userEvent.setup();
        const resetSpy = vi.fn();
        render(<ErrorBoundaryFallback error={new Error("test")} resetErrorBoundary={resetSpy} />);
        await user.click(screen.getByRole("button", { name: /try again/i }));
        expect(resetSpy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });
});
