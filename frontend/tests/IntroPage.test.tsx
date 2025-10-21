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

  it("should render all 4 feature cards", () => {
    const mockOnGetStarted = vi.fn();
    render(<IntroPage onGetStarted={mockOnGetStarted} />);

    expect(screen.getByText("Quick & Easy")).toBeInTheDocument();
    expect(screen.getByText("Filler")).toBeInTheDocument();
    expect(screen.getByText("Data Privacy")).toBeInTheDocument();
    expect(screen.getByText("Free to Use")).toBeInTheDocument();
  });

  it("should render feature card descriptions", () => {
    const mockOnGetStarted = vi.fn();
    render(<IntroPage onGetStarted={mockOnGetStarted} />);

    expect(
      screen.getByText(/Answer just a few questions about your situation/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This tool is completely free/i),
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

  it("should render all feature card icons", () => {
    const mockOnGetStarted = vi.fn();
    const { container } = render(<IntroPage onGetStarted={mockOnGetStarted} />);

    const icons = container.querySelectorAll(".bg-primary.rounded-full");
    expect(icons).toHaveLength(4); // 4 feature cards = 4 icon containers
  });

  it("should have hover effects on feature cards", () => {
    const mockOnGetStarted = vi.fn();
    const { container } = render(<IntroPage onGetStarted={mockOnGetStarted} />);

    const featureCards = container.querySelectorAll(".shadow-md");
    featureCards.forEach((card) => {
      expect(card).toHaveClass("hover:border-primary");
    });
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
