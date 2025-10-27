import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressIndicator from "../src/components/ProgressIndicator";
import "@testing-library/jest-dom";

describe("ProgressIndicator", () => {
  it("should render correct number of steps", () => {
    const { container } = render(
      <ProgressIndicator currentStep={1} totalSteps={3} />,
    );

    const steps = container.querySelectorAll(".rounded-full");
    expect(steps).toHaveLength(3);
  });

  it("should show current step with ring styling", () => {
    const { container } = render(
      <ProgressIndicator currentStep={2} totalSteps={3} />,
    );

    const steps = container.querySelectorAll(".rounded-full");
    const currentStep = steps[1];

    expect(currentStep).toHaveClass("bg-primary");
    expect(currentStep).toHaveClass("text-white");
    expect(currentStep).toHaveClass("ring-2");
  });

  it("should show completed steps with checkmark", () => {
    const { container } = render(
      <ProgressIndicator currentStep={3} totalSteps={3} />,
    );

    const steps = container.querySelectorAll(".rounded-full");
    const completedStep = steps[0];

    expect(completedStep).toHaveClass("bg-primary");
    expect(completedStep.querySelector("svg")).toBeInTheDocument();
  });

  it("should show future steps with light styling", () => {
    const { container } = render(
      <ProgressIndicator currentStep={1} totalSteps={3} />,
    );

    const steps = container.querySelectorAll(".rounded-full");
    const futureStep = steps[2];

    expect(futureStep).toHaveClass("bg-sky");
    expect(futureStep).toHaveClass("text-indigo");
    expect(futureStep).not.toHaveClass("ring-2");
  });

  it("should display step numbers for future and current steps", () => {
    render(<ProgressIndicator currentStep={1} totalSteps={3} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should show 'Page X' labels", () => {
    render(<ProgressIndicator currentStep={1} totalSteps={3} />);

    expect(screen.getByText("Page 1")).toBeInTheDocument();
    expect(screen.getByText("Page 2")).toBeInTheDocument();
    expect(screen.getByText("Page 3")).toBeInTheDocument();
  });

  it("should render connectors between steps", () => {
    const { container } = render(
      <ProgressIndicator currentStep={2} totalSteps={3} />,
    );

    const connectors = container.querySelectorAll(".h-0\\.5");
    expect(connectors).toHaveLength(2); // 3 steps = 2 connectors
  });

  it("should style completed connectors differently", () => {
    const { container } = render(
      <ProgressIndicator currentStep={3} totalSteps={3} />,
    );

    const connectors = container.querySelectorAll(".h-0\\.5");
    connectors.forEach((connector) => {
      expect(connector).toHaveClass("bg-primary");
    });
  });

  it("should handle single step", () => {
    const { container } = render(
      <ProgressIndicator currentStep={1} totalSteps={1} />,
    );

    const steps = container.querySelectorAll(".rounded-full");
    expect(steps).toHaveLength(1);

    const connectors = container.querySelectorAll(".h-0\\.5");
    expect(connectors).toHaveLength(0); // No connectors for single step
  });

  it("should handle step 1 of 3 correctly", () => {
    const { container } = render(
      <ProgressIndicator currentStep={1} totalSteps={3} />,
    );

    const steps = container.querySelectorAll(".rounded-full");

    // Step 1: current (has ring)
    expect(steps[0]).toHaveClass("ring-2");
    expect(steps[0]).toHaveClass("bg-primary");

    // Step 2: future (no ring)
    expect(steps[1]).not.toHaveClass("ring-2");
    expect(steps[1]).toHaveClass("bg-sky");

    // Step 3: future (no ring)
    expect(steps[2]).not.toHaveClass("ring-2");
    expect(steps[2]).toHaveClass("bg-sky");
  });

  it("should handle step 2 of 3 correctly", () => {
    const { container } = render(
      <ProgressIndicator currentStep={2} totalSteps={3} />,
    );

    const steps = container.querySelectorAll(".rounded-full");

    // Step 1: completed (has checkmark)
    expect(steps[0]).toHaveClass("bg-primary");
    expect(steps[0].querySelector("svg")).toBeInTheDocument();

    // Step 2: current (has ring)
    expect(steps[1]).toHaveClass("ring-2");
    expect(steps[1]).toHaveClass("bg-primary");

    // Step 3: future
    expect(steps[2]).toHaveClass("bg-sky");
  });

  it("should handle step 3 of 3 correctly", () => {
    const { container } = render(
      <ProgressIndicator currentStep={3} totalSteps={3} />,
    );

    const steps = container.querySelectorAll(".rounded-full");

    // Step 1: completed
    expect(steps[0]).toHaveClass("bg-primary");
    expect(steps[0].querySelector("svg")).toBeInTheDocument();

    // Step 2: completed
    expect(steps[1]).toHaveClass("bg-primary");
    expect(steps[1].querySelector("svg")).toBeInTheDocument();

    // Step 3: current
    expect(steps[2]).toHaveClass("ring-2");
    expect(steps[2]).toHaveClass("bg-primary");
  });
});
