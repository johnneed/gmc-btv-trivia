import React from "react";
import type { FallbackProps } from "react-error-boundary";

const ErrorBoundaryFallback = ({ resetErrorBoundary }: FallbackProps) => (
    <section role="alert" aria-live="assertive">
        <p>Something went wrong. Try again.</p>
        <button onClick={resetErrorBoundary}>Try again</button>
    </section>
);

export default ErrorBoundaryFallback;
