import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import LogoSpinner from "./logo-spinner";

describe("LogoSpinner", () => {
    it("renders without crashing", () => {
        const { container } = render(<LogoSpinner />);
        expect(container.firstChild).toBeTruthy();
    });
});
