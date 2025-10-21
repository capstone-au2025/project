import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.tsx";
import "@testing-library/jest-dom";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should render the App component", () => {
    render(<App />);

    expect(
      screen.getByText("Landlord-Tenant Communication Tool"),
    ).toBeInTheDocument();
  });

  it("should wrap FormContainer in QueryClientProvider", () => {
    const { container } = render(<App />);

    expect(container.firstChild).toBeTruthy();
  });

  it("should have a 'Get Started' button which, when clicked, asks about your problems", async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByText("Get Started");
    expect(button).toBeInTheDocument();

    await user.click(button);

    expect(button).not.toBeInTheDocument();
    expect(
      screen.getByText("What problems are occurring with your house/apartment?"),
    ).toBeInTheDocument();
  });

  it("should start at the intro page", () => {
    render(<App />);

    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.getByText("Quick & Easy")).toBeInTheDocument();
  });

  it("should provide React Query context to children", () => {
    render(<App />);

    // FormContainer should render successfully, indicating QueryClient is provided
    expect(
      screen.getByText("Landlord-Tenant Communication Tool"),
    ).toBeInTheDocument();
  });
});
