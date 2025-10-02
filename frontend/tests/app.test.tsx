import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import App from "../src/App.tsx";
import '@testing-library/jest-dom'

describe("app", () => {
  it("should have a 'Get Started' button which, when clicked, asks about your problems", () => {
    render(<App />);
    const button = screen.getByText("Get Started");
    expect(button).toBeInTheDocument();

    act(() => {
      button.click();
    });

    expect(button).not.toBeInTheDocument();
    expect(screen.getByText("What problems are occuring with your house/apartment?")).toBeInTheDocument();
  });
});


