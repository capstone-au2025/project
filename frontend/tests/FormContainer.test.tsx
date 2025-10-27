import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FormContainer from "../src/components/FormContainer";
import "@testing-library/jest-dom";

describe("FormContainer", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    // Reset window.location.search
    Object.defineProperty(window, "location", {
      value: { search: "" },
      writable: true,
    });

    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>,
    );
  };

  describe("Initial rendering", () => {
    it("should render IntroPage by default", () => {
      renderWithQueryClient(<FormContainer />);

      expect(
        screen.getByText("Landlord-Tenant Communication Tool"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /get started/i }),
      ).toBeInTheDocument();
    });

    it("should initialize with empty form data", () => {
      renderWithQueryClient(<FormContainer />);

      const storedData = localStorage.getItem("justiceFormData");
      expect(storedData).toBeTruthy();
      const parsedData = JSON.parse(storedData!);
      expect(parsedData.mainProblem).toBe("");
      expect(parsedData.problemLocations).toBe("");
    });

    it("should save page state to localStorage", async () => {
      renderWithQueryClient(<FormContainer />);

      await waitFor(() => {
        const pageState = localStorage.getItem("justiceFormPageState");
        expect(pageState).toBe('"intro"');
      });
    });
  });

  describe("Navigation flow", () => {
    it("should navigate from intro to form1 when Get Started is clicked", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<FormContainer />);

      const getStartedButton = screen.getByRole("button", {
        name: /get started/i,
      });
      await user.click(getStartedButton);

      expect(
        screen.getByText("Tell Us About Your Concerns"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Page 1 of 3 - Let's get started!"),
      ).toBeInTheDocument();
    });

    it("should navigate from form1 to form2 when Continue is clicked", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<FormContainer />);

      // Navigate to form1
      await user.click(screen.getByRole("button", { name: /get started/i }));

      // Fill required field
      const mainProblemField = screen.getByLabelText(
        /What problems are occurring with your house\/apartment\?/i,
      );
      await user.type(mainProblemField, "No heat");

      // Submit form1
      await user.click(screen.getByRole("button", { name: /continue/i }));

      expect(screen.getByText("Additional Details")).toBeInTheDocument();
      expect(
        screen.getByText("Page 2 of 3 - Almost there!"),
      ).toBeInTheDocument();
    });

    it("should navigate from form2 to form3", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<FormContainer />);

      // Navigate to form1
      await user.click(screen.getByRole("button", { name: /get started/i }));

      // Fill and submit form1
      await user.type(
        screen.getByLabelText(
          /What problems are occurring with your house\/apartment\?/i,
        ),
        "No heat",
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Fill and submit form2
      await user.type(
        screen.getByLabelText(
          /How are these problems affecting your living situation\?/i,
        ),
        "It's very cold",
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));

      expect(screen.getByText("Final Question")).toBeInTheDocument();
      expect(
        screen.getByText("Page 3 of 3 - Ready to submit!"),
      ).toBeInTheDocument();
    });

    it("should navigate back from form1 to intro", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<FormContainer />);

      // Navigate to form1
      await user.click(screen.getByRole("button", { name: /get started/i }));
      expect(
        screen.getByText("Tell Us About Your Concerns"),
      ).toBeInTheDocument();

      // Click back
      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(
        screen.getByText("Landlord-Tenant Communication Tool"),
      ).toBeInTheDocument();
    });

    it("should navigate back from form2 to form1", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<FormContainer />);

      // Navigate to form2
      await user.click(screen.getByRole("button", { name: /get started/i }));
      await user.type(
        screen.getByLabelText(
          /What problems are occurring with your house\/apartment\?/i,
        ),
        "No heat",
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Click back
      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(
        screen.getByText("Tell Us About Your Concerns"),
      ).toBeInTheDocument();
    });

    it("should navigate back from form3 to form2", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<FormContainer />);

      // Navigate to form3
      await user.click(screen.getByRole("button", { name: /get started/i }));
      await user.type(
        screen.getByLabelText(
          /What problems are occurring with your house\/apartment\?/i,
        ),
        "No heat",
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.type(
        screen.getByLabelText(
          /How are these problems affecting your living situation\?/i,
        ),
        "It's very cold",
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Click back
      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(screen.getByText("Additional Details")).toBeInTheDocument();
    });
  });

  describe("Form data persistence", () => {
    it("should update formData when user types", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<FormContainer />);

      // Navigate to form1
      await user.click(screen.getByRole("button", { name: /get started/i }));

      // Type in field
      const mainProblemField = screen.getByLabelText(
        /What problems are occurring with your house\/apartment\?/i,
      ) as HTMLTextAreaElement;
      await user.type(mainProblemField, "Broken window");

      expect(mainProblemField.value).toBe("Broken window");
    });

    it("should save form data to localStorage when changed", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<FormContainer />);

      await user.click(screen.getByRole("button", { name: /get started/i }));
      await user.type(
        screen.getByLabelText(
          /What problems are occurring with your house\/apartment\?/i,
        ),
        "No heat",
      );

      await waitFor(() => {
        const storedData = localStorage.getItem("justiceFormData");
        expect(storedData).toBeTruthy();
        const parsedData = JSON.parse(storedData!);
        expect(parsedData.mainProblem).toContain("No heat");
      });
    });

    it("should persist form data across page navigation", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<FormContainer />);

      // Fill form1
      await user.click(screen.getByRole("button", { name: /get started/i }));
      await user.type(
        screen.getByLabelText(
          /What problems are occurring with your house\/apartment\?/i,
        ),
        "Broken heater",
      );
      await user.type(
        screen.getByLabelText(/Where is each problem described happening\?/i),
        "Living room",
      );

      // Navigate to form2
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Navigate back to form1
      await user.click(screen.getByRole("button", { name: /back/i }));

      // Check that data persisted
      const mainProblemField = screen.getByLabelText(
        /What problems are occurring with your house\/apartment\?/i,
      ) as HTMLTextAreaElement;
      const locationField = screen.getByLabelText(
        /Where is each problem described happening\?/i,
      ) as HTMLTextAreaElement;

      expect(mainProblemField.value).toBe("Broken heater");
      expect(locationField.value).toBe("Living room");
    });

    it("should load saved data from localStorage on mount", async () => {
      // Pre-populate localStorage
      const savedData = {
        mainProblem: "Saved problem",
        problemLocations: "",
        startOfProblem: "",
        problemAffect: "",
        whatTheyTried: "",
        solutionToProblem: "",
        solutionDate: "",
        additionalInformation: "",
      };
      localStorage.setItem("justiceFormData", JSON.stringify(savedData));
      localStorage.setItem("justiceFormPageState", JSON.stringify("form1"));

      renderWithQueryClient(<FormContainer />);

      // Should render form1 with saved data
      const mainProblemField = screen.getByLabelText(
        /What problems are occurring with your house\/apartment\?/i,
      ) as HTMLTextAreaElement;

      expect(mainProblemField.value).toBe("Saved problem");
    });
  });

  describe("URL reset parameter", () => {
    it("should clear localStorage and return to intro when ?reset=true", () => {
      // Pre-populate localStorage
      const savedData = {
        mainProblem: "Old data",
        problemLocations: "",
        startOfProblem: "",
        problemAffect: "",
        whatTheyTried: "",
        solutionToProblem: "",
        solutionDate: "",
        additionalInformation: "",
      };
      localStorage.setItem("justiceFormData", JSON.stringify(savedData));
      localStorage.setItem("justiceFormPageState", JSON.stringify("form2"));

      // Mock URL with reset parameter
      Object.defineProperty(window, "location", {
        value: { search: "?reset=true" },
        writable: true,
      });

      renderWithQueryClient(<FormContainer />);

      // Should render intro
      expect(
        screen.getByText("Landlord-Tenant Communication Tool"),
      ).toBeInTheDocument();

      // LocalStorage should be cleared
      const storedData = localStorage.getItem("justiceFormData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        expect(parsedData.mainProblem).toBe("");
      }
    });
  });

  describe("LocalStorage error handling", () => {
    it("should handle localStorage getItem errors gracefully", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const getItemSpy = vi
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("Storage error");
        });

      // Should not throw error
      expect(() => renderWithQueryClient(<FormContainer />)).not.toThrow();

      consoleErrorSpy.mockRestore();
      getItemSpy.mockRestore();
    });

    it("should handle localStorage setItem errors gracefully", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("Storage full");
        });

      renderWithQueryClient(<FormContainer />);

      // Should not throw error when trying to save
      await user.click(screen.getByRole("button", { name: /get started/i }));
      await user.type(
        screen.getByLabelText(
          /What problems are occurring with your house\/apartment\?/i,
        ),
        "Test",
      );

      consoleErrorSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe("Form submission to submitted page", () => {
    it("should navigate to submitted page after form3 submission", async () => {
      const user = userEvent.setup();

      // Mock fetch for PDF API
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              status: "success",
              content: "base64content",
            }),
        }),
      ) as unknown as typeof fetch;

      renderWithQueryClient(<FormContainer />);

      // Navigate through all forms
      await user.click(screen.getByRole("button", { name: /get started/i }));

      // Fill form1
      await user.type(
        screen.getByLabelText(
          /What problems are occurring with your house\/apartment\?/i,
        ),
        "No heat",
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Fill form2
      await user.type(
        screen.getByLabelText(
          /How are these problems affecting your living situation\?/i,
        ),
        "Cold",
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));

      // Submit form3
      await user.click(
        screen.getByRole("button", { name: /generate letter/i }),
      );

      // Should show submitted page
      await waitFor(() => {
        expect(screen.getByText("Here's your letter:")).toBeInTheDocument();
      });
    });
  });
});
