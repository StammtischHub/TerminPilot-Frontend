import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
    it("rendert ohne Fehler", () => {
        render(<App />);
        expect(document.body).toBeInTheDocument();
    });
});