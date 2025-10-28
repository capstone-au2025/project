import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuestionBox from "../src/components/QuestionBox";
import "@testing-library/jest-dom";

describe("QuestionBox", () => {
  it("should render label correctly", () => {
    const mockOnChange = vi.fn();
    render(
      <QuestionBox
        label="Test Question"
        name="testQuestion"
        value=""
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByLabelText("Test Question")).toBeInTheDocument();
  });

  it("should render textarea with correct value", () => {
    const mockOnChange = vi.fn();
    render(
      <QuestionBox
        label="Test Question"
        name="testQuestion"
        value="Test Answer"
        onChange={mockOnChange}
      />,
    );

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Test Answer");
  });

  it("should call onChange when user types", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <QuestionBox
        label="Test Question"
        name="testQuestion"
        value=""
        onChange={mockOnChange}
      />,
    );

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "New text");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should show required asterisk when required is true", () => {
    const mockOnChange = vi.fn();
    render(
      <QuestionBox
        label="Required Question"
        name="requiredQuestion"
        value=""
        onChange={mockOnChange}
        required={true}
      />,
    );

    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass("text-primary");
  });

  it("should not show required asterisk when required is false", () => {
    const mockOnChange = vi.fn();
    render(
      <QuestionBox
        label="Optional Question"
        name="optionalQuestion"
        value=""
        onChange={mockOnChange}
        required={false}
      />,
    );

    const asterisk = screen.queryByText("*");
    expect(asterisk).not.toBeInTheDocument();
  });

  it("should render placeholder text", () => {
    const mockOnChange = vi.fn();
    render(
      <QuestionBox
        label="Test Question"
        name="testQuestion"
        value=""
        onChange={mockOnChange}
        placeholder="Enter your answer here..."
      />,
    );

    const textarea = screen.getByPlaceholderText("Enter your answer here...");
    expect(textarea).toBeInTheDocument();
  });

  it("should have correct name attribute", () => {
    const mockOnChange = vi.fn();
    render(
      <QuestionBox
        label="Test Question"
        name="uniqueName"
        value=""
        onChange={mockOnChange}
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("name", "uniqueName");
  });

  it("should have 4 rows by default", () => {
    const mockOnChange = vi.fn();
    render(
      <QuestionBox
        label="Test Question"
        name="testQuestion"
        value=""
        onChange={mockOnChange}
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "4");
  });

  it("should update value when controlled", () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <QuestionBox
        label="Test Question"
        name="testQuestion"
        value="Initial"
        onChange={mockOnChange}
      />,
    );

    let textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Initial");

    rerender(
      <QuestionBox
        label="Test Question"
        name="testQuestion"
        value="Updated"
        onChange={mockOnChange}
      />,
    );

    textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Updated");
  });
});
