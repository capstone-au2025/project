import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormPage from "../src/components/FormPage";
import { getConfig } from "../src/config/configLoader";
import "@testing-library/jest-dom";

describe("FormPage", () => {
  const mockFormData = {
    mainProblem: "No heat",
    problemLocations: "Living room",
    startOfProblem: "Last week",
  };

  const mockOnInputChange = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Page 1", () => {
    it("should render page title and subtitle", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      expect(
        screen.getByText("Tell Us About Your Concerns"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Please provide details about your housing situation below",
        ),
      ).toBeInTheDocument();
    });

    it("should render progress indicator with step 1", () => {
      const { container } = render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      expect(screen.getByText("Page 1")).toBeInTheDocument();
      const steps = container.querySelectorAll(".rounded-full");
      expect(steps[0]).toHaveClass("ring-2"); // Current step has ring
    });

    it("should render all questions from config", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      expect(
        screen.getByLabelText(
          /What problems are occurring with your house\/apartment\?/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Where is each problem described happening\?/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/When did each problem start\?/i),
      ).toBeInTheDocument();
    });

    it("should render tip text", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      expect(screen.getByText("Tip:")).toBeInTheDocument();
      expect(
        screen.getByText(/Be as specific as possible/i),
      ).toBeInTheDocument();
    });

    it("should show Continue button", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      expect(
        screen.getByRole("button", { name: /continue/i }),
      ).toBeInTheDocument();
    });

    it("should show Back button when onBack is provided", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      expect(screen.getByRole("link", { name: /back/i })).toBeInTheDocument();
    });

    it("should not show Back button when onBack is undefined", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          pageConfig={getConfig().formPages[0]}
        />,
      );

      expect(
        screen.queryByRole("button", { name: /back/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Page 2", () => {
    it("should render page 2 content", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[1]}
        />,
      );

      expect(screen.getByText("Additional Details")).toBeInTheDocument();
      expect(
        screen.getByText("Page 2 of 3 - Almost there!"),
      ).toBeInTheDocument();
    });

    it("should render all 4 questions for page 2", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[1]}
        />,
      );

      expect(
        screen.getByLabelText(
          /How are these problems affecting your living situation\?/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Have you informed your landlord/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/What would you like your landlord to do/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/When would you like to have a solution/i),
      ).toBeInTheDocument();
    });
  });

  describe("Page 3", () => {
    it("should render page 3 content", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[2]}
        />,
      );

      expect(screen.getByText("Final Question")).toBeInTheDocument();
      expect(
        screen.getByText("Page 3 of 3 - Ready to submit!"),
      ).toBeInTheDocument();
    });

    it("should show success tip type", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[2]}
        />,
      );

      expect(screen.getByText("Almost done!")).toBeInTheDocument();
    });

    it("should show Generate Letter button", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[2]}
        />,
      );

      expect(
        screen.getByRole("button", { name: /generate letter/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Form interactions", () => {
    it("should call onInputChange when typing in textarea", async () => {
      const user = userEvent.setup();
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      const textarea = screen.getByLabelText(
        /What problems are occurring with your house\/apartment\?/i,
      );
      await user.type(textarea, "a");

      expect(mockOnInputChange).toHaveBeenCalled();
    });

    it("should call onSubmit when form is submitted", async () => {
      const user = userEvent.setup();
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it("should display form data values in textareas", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      const mainProblemTextarea = screen.getByLabelText(
        /What problems are occurring with your house\/apartment\?/i,
      ) as HTMLTextAreaElement;

      expect(mainProblemTextarea.value).toBe("No heat");
    });

    it("should show empty string for missing form data", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={{}}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      const textarea = screen.getByLabelText(
        /What problems are occurring with your house\/apartment\?/i,
      ) as HTMLTextAreaElement;

      expect(textarea.value).toBe("");
    });
  });

  describe("Required fields", () => {
    it("should mark required fields with asterisk", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      const requiredQuestion = screen.getByLabelText(
        /What problems are occurring with your house\/apartment\?/i,
      );
      const label = requiredQuestion.closest("div")?.querySelector("label");

      expect(label?.querySelector(".text-primary")).toBeInTheDocument();
    });

    it("should have required attribute on required textareas", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={mockFormData}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      const requiredTextarea = screen.getByLabelText(
        /What problems are occurring with your house\/apartment\?/i,
      );

      expect(requiredTextarea).toBeRequired();
    });
  });

  describe("Placeholder text", () => {
    it("should show placeholder text from config", () => {
      render(
        <FormPage
          animationDirection="normal"
          formData={{}}
          onInputChange={mockOnInputChange}
          onSubmit={mockOnSubmit}
          backPage="/form1"
          pageConfig={getConfig().formPages[0]}
        />,
      );

      expect(
        screen.getByPlaceholderText(
          /Examples: no running water, no heat or A\/C/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
