import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SubmittedPage from "../src/components/SubmittedPage";
import "@testing-library/jest-dom";
import { memoryLocation } from "wouter/memory-location";
import { Route, Router } from "wouter";

// Mock react-pdf
vi.mock("react-pdf", () => ({
  Document: ({
    children,
    loading,
  }: {
    children: React.ReactNode;
    loading?: React.ReactNode;
  }) => <div data-testid="pdf-document">{loading || children}</div>,
  Page: ({
    onLoadSuccess,
    loading,
  }: {
    onLoadSuccess?: () => void;
    loading?: React.ReactNode;
  }) => {
    // Simulate PDF load
    setTimeout(() => onLoadSuccess?.(), 0);
    return <div data-testid="pdf-page">{loading}</div>;
  },
}));

// Mock react-resize-detector
vi.mock("react-resize-detector", () => ({
  useResizeDetector: () => ({
    width: 300,
    height: 387,
    ref: { current: null },
  }),
}));

// Mock certifiedmail
vi.mock("../src/certifiedmail", () => ({
  base64ToUint8Array: (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  },
  sendMail: vi.fn(),
}));

describe("SubmittedPage", () => {
  const mockFormData = {
    mainProblem: "No heat",
    problemLocations: "Living room",
    startOfProblem: "Last week",
    problemAffect: "It's very cold",
    whatTheyTried: "Called landlord",
    solutionToProblem: "Fix heater",
    solutionDate: "ASAP",
    altchaPayload: "mock-altcha-payload",
    additionalInformation: "None",
    senderName: "John Sender",
    senderAddress: "1234 Sender St",
    senderCity: "Sendertown",
    senderState: "OH",
    senderZip: "12345",
    destinationName: "Jane Receiver",
    destinationAddress: "5678 Receiver Ave",
    destinationCity: "Receiverville",
    destinationState: "OH",
    destinationZip: "67890",
  };

  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock fetch to handle both /api/text and /api/pdf calls
    global.fetch = vi.fn((url: string) => {
      if (url === "/api/text") {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              status: "success",
              content: "Generated letter content from AI",
            }),
        });
      }
      // Default to /api/pdf response
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            status: "success",
            content: btoa("fake pdf content"),
          }),
      });
    }) as unknown as typeof fetch;

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    const { navigate, hook } = memoryLocation();
    navigate("/submitted");
    return render(
      <QueryClientProvider client={queryClient}>
        <Router hook={hook}>
          <Route path="submitted">{component}</Route>
          <Route path="/">Intro page </Route>
        </Router>
        ,
      </QueryClientProvider>,
    );
  };

  it("should render page title", () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    expect(screen.getByText("Here's your letter:")).toBeInTheDocument();
  });

  it("should fetch from both text and PDF APIs on mount", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    await waitFor(() => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      const calls = mockFetch.mock.calls;

      // Should have at least 2 calls: one to /api/text and one to /api/pdf
      expect(calls.length).toBeGreaterThanOrEqual(2);

      // Check for /api/text call
      expect(calls.some((call) => call[0] === "/api/text")).toBe(true);

      // Check for /api/pdf call
      expect(calls.some((call) => call[0] === "/api/pdf")).toBe(true);
    });
  });

  it("should send text data to text API", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    await waitFor(() => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      const textCall = mockFetch.mock.calls.find(
        (call) => call[0] === "/api/text",
      );

      expect(textCall).toBeDefined();
      const body = JSON.parse(textCall![1].body as string);
      expect(body).toHaveProperty("answers");
      // Message should contain form question labels and values
      expect(body.answers.mainProblem).toContain("No heat");
    });
  });

  it("should send correct data to PDF API", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    await waitFor(() => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      const pdfCall = mockFetch.mock.calls.find(
        (call) => call[0] === "/api/pdf",
      );

      expect(pdfCall).toBeDefined();
      const body = JSON.parse(pdfCall![1].body as string);
      expect(body).toHaveProperty("senderName");
      expect(body).toHaveProperty("senderAddress");
      expect(body).toHaveProperty("receiverName");
      expect(body).toHaveProperty("receiverAddress");
      expect(body).toHaveProperty("body");
      expect(body.body).toBe("Generated letter content from AI");
    });
  });

  it("should render PDF document after successful fetch", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("pdf-document")).toBeInTheDocument();
    });
  });

  it("should show loading skeleton while PDF is loading", () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    // Skeleton should be visible initially
    const skeletons = document.querySelectorAll(".react-loading-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render Back button", () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    expect(screen.getByRole("link", { name: /back/i })).toBeInTheDocument();
  });

  it("should render Mail to Landlord button after PDF loads", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mail to your landlord/i }),
      ).toBeInTheDocument();
    });
  });

  it("should render Download PDF link after PDF loads", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    await waitFor(() => {
      const downloadLink = screen.getByRole("link", { name: /download pdf/i });
      expect(downloadLink).toBeInTheDocument();
      expect(downloadLink).toHaveAttribute("download", "Letter.pdf");
      expect(downloadLink).toHaveAttribute("target", "_blank");
    });
  });

  it("should call sendMail when Mail to Landlord button is clicked", async () => {
    const user = userEvent.setup();
    const { sendMail } = await import("../src/certifiedmail");

    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mail to your landlord/i }),
      ).toBeInTheDocument();
    });

    const mailButton = screen.getByRole("button", {
      name: /mail to your landlord/i,
    });
    await user.click(mailButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Send with Online Certified Mail\?/i),
      ).toBeInTheDocument();
    });

    const continueButton = screen.getByRole("button", {
      name: /continue to mail service/i,
    });
    await user.click(continueButton);

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        pdfName: "Letter.pdf",
        letterName: "Letter",
        duplex: false,
      }),
    );
  });

  it("should reset when starting again", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /start again/i }),
      ).toBeInTheDocument();
    });

    const startAgain = screen.getByRole("button", {
      name: /start again/i,
    });
    await user.click(startAgain);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Your answers will be cleared, so make sure you download the PDF first/i,
        ),
      ).toBeInTheDocument();
    });

    const allStartAgainButtons = screen.getAllByRole("button", {
      name: /start again/i,
    });
    const startAgainConfirmButton = allStartAgainButtons.filter(
      (x) => x != startAgain,
    )[0];
    await user.click(startAgainConfirmButton);

    expect(screen.getByText(/intro page/i)).toBeInTheDocument();
  });

  it("should create blob URL for PDF", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it("should handle fetch error gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    global.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error")),
    ) as unknown as typeof fetch;

    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    // Should still render the page without crashing
    expect(screen.getByText("Here's your letter:")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back/i })).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("should use staleTime of Infinity for PDF query", async () => {
    const { rerender } = renderWithQueryClient(
      <SubmittedPage formData={mockFormData} backPage="/form3" />,
    );

    await waitFor(() => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      // Should have 1 call: /api/pdf
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Re-render with same props should not trigger another fetch
    rerender(
      <QueryClientProvider client={queryClient}>
        <SubmittedPage formData={mockFormData} backPage="/form3" />
      </QueryClientProvider>,
    );

    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  /* it("should render PDF in download link as well", async () => {
   *   renderWithQueryClient(
   *     <SubmittedPage formData={mockFormData} backPage="/form3" />,
   *   );

   *   await waitFor(() => {
   *     const downloadLink = screen.getByRole("link", { name: /download pdf/i });
   *     expect(downloadLink).toHaveAttribute("href", "blob:mock-url");
   *   });
   * }); */
});
