import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageLayout from "../src/components/PageLayout";
import "@testing-library/jest-dom";

describe("PageLayout", () => {
  it("should render children correctly", () => {
    render(
      <PageLayout>
        <div>Test Content</div>
      </PageLayout>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    render(
      <PageLayout>
        <h1>Title</h1>
        <p>Paragraph</p>
        <button>Button</button>
      </PageLayout>,
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
    expect(screen.getByText("Button")).toBeInTheDocument();
  });

  it("should apply correct wrapper classes for centering", () => {
    const { container } = render(
      <PageLayout>
        <div>Content</div>
      </PageLayout>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("min-h-full");
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("items-center");
    expect(wrapper).toHaveClass("justify-center");
  });
});
