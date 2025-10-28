import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IntroPage from "../src/components/IntroPage";
import "@testing-library/jest-dom";

describe("IntroPage", () => {
  it("should render the main title", () => {
    render(<IntroPage nextPage="/form1" />);

    expect(
      screen.getByText("Landlord-Tenant Communication Tool"),
    ).toBeInTheDocument();
  });

  it("should render the main description", () => {
    render(<IntroPage nextPage="/form1" />);

    expect(
      screen.getByText(/This tool helps tenants communicate issues/i),
    ).toBeInTheDocument();
  });

  it("should render 'What you'll need' section", () => {
    render(<IntroPage nextPage="/form1" />);

    expect(screen.getByText("What you'll need")).toBeInTheDocument();
    expect(
      screen.getByText(/Have information about your rental property/i),
    ).toBeInTheDocument();
  });

  it("should render 'Get Started' button", () => {
    render(<IntroPage nextPage="/form1" />);

    const button = screen.getByRole("link", { name: /get started/i });
    expect(button).toBeInTheDocument();
  });

  it("should render time estimate text", () => {
    render(<IntroPage nextPage="/form1" />);

    expect(
      screen.getByText(/Takes approximately 3-5 minutes to complete/i),
    ).toBeInTheDocument();
  });

  it("should render info icon in 'What you'll need' section", () => {
    render(<IntroPage nextPage="/form1" />);

    const infoSection = screen.getByText("What you'll need").parentElement;
    expect(infoSection?.querySelector("svg")).toBeInTheDocument();
  });

  it("should wrap content in PageLayout", () => {
    const { container } = render(<IntroPage nextPage="/form1" />);

    const pageLayoutWrapper = container.querySelector(".min-h-full");
    expect(pageLayoutWrapper).toBeInTheDocument();
  });
});
