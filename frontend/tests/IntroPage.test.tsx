import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IntroPage from "../src/components/IntroPage";
import "@testing-library/jest-dom";

describe("IntroPage", () => {
  it("should render the main title", () => {
    const mockOnGetStarted = vi.fn();
    render(<IntroPage onGetStarted={mockOnGetStarted} />);

    expect(
      screen.getByText("Landlord-Tenant Communication Tool"),
    ).toBeInTheDocument();
  });

  it("should render the main description", () => {
    const mockOnGetStarted = vi.fn();
    render(<IntroPage onGetStarted={mockOnGetStarted} />);

    expect(
      screen.getByText(/This tool helps tenants communicate issues/i),
    ).toBeInTheDocument();
  });

  it("should render 'What you'll need' section", () => {
    const mockOnGetStarted = vi.fn();
    render(<IntroPage onGetStarted={mockOnGetStarted} />);

    expect(screen.getByText("What you'll need")).toBeInTheDocument();
    expect(
      screen.getByText(/Have information about your rental property/i),
    ).toBeInTheDocument();
  });

  it("should render 'Get Started' button", () => {
    const mockOnGetStarted = vi.fn();
    render(<IntroPage onGetStarted={mockOnGetStarted} />);

    const button = screen.getByRole("button", { name: /get started/i });
    expect(button).toBeInTheDocument();
  });

  it("should call onGetStarted when button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnGetStarted = vi.fn();
    render(<IntroPage onGetStarted={mockOnGetStarted} />);

    const button = screen.getByRole("button", { name: /get started/i });
    await user.click(button);

    expect(mockOnGetStarted).toHaveBeenCalledTimes(1);
  });

  it("should render time estimate text", () => {
    const mockOnGetStarted = vi.fn();
    render(<IntroPage onGetStarted={mockOnGetStarted} />);

    expect(
      screen.getByText(/Takes approximately 3-5 minutes to complete/i),
    ).toBeInTheDocument();
  });

  it("should render info icon in 'What you'll need' section", () => {
    const mockOnGetStarted = vi.fn();
    render(<IntroPage onGetStarted={mockOnGetStarted} />);

    const infoSection = screen.getByText("What you'll need").parentElement;
    expect(infoSection?.querySelector("svg")).toBeInTheDocument();
  });

  it("should wrap content in PageLayout", () => {
    const mockOnGetStarted = vi.fn();
    const { container } = render(<IntroPage onGetStarted={mockOnGetStarted} />);

    const pageLayoutWrapper = container.querySelector(".min-h-full");
    expect(pageLayoutWrapper).toBeInTheDocument();
  });
});
