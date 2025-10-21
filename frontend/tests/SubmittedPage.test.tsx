import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SubmittedPage from "../src/components/SubmittedPage";
import "@testing-library/jest-dom";

// Mock react-pdf
vi.mock("react-pdf", () => ({
  Document: ({ children, loading }: any) => (
    <div data-testid="pdf-document">{loading || children}</div>
  ),
  Page: ({ onLoadSuccess, loading }: any) => {
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
    additionalInformation: "None",
  };

  const mockOnBack = vi.fn();
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

    // Mock successful PDF response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            status: "success",
            content: btoa("fake pdf content"),
          }),
      }),
    ) as any;

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>,
    );
  };

  it("should render page title", () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    expect(screen.getByText("Here's your letter:")).toBeInTheDocument();
  });

  it("should fetch PDF on mount", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/pdf",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });
  });

  it("should send correct data to PDF API", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toHaveProperty("senderName");
      expect(body).toHaveProperty("senderAddress");
      expect(body).toHaveProperty("receiverName");
      expect(body).toHaveProperty("receiverAddress");
      expect(body).toHaveProperty("body");
      expect(body.body).toContain(JSON.stringify(mockFormData));
    });
  });

  it("should render PDF document after successful fetch", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("pdf-document")).toBeInTheDocument();
    });
  });

  it("should show loading skeleton while PDF is loading", () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    // Skeleton should be visible initially
    const skeletons = document.querySelectorAll(".react-loading-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render Back button", () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  it("should call onBack when Back button is clicked", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("should render Mail to Landlord button after PDF loads", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mail to your landlord/i }),
      ).toBeInTheDocument();
    });
  });

  it("should render Download PDF link after PDF loads", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
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
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
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

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        pdfName: "Letter.pdf",
        letterName: "Letter",
        duplex: false,
      }),
    );
  });

  it("should create blob URL for PDF", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it("should handle PDF fetch error gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    global.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error")),
    ) as any;

    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    // Should still render the page without crashing
    expect(screen.getByText("Here's your letter:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("should use staleTime of Infinity for PDF query", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Re-render should not trigger another fetch
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    // Should still only be called once due to staleTime: Infinity
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should render PDF in download link as well", async () => {
    renderWithQueryClient(
      <SubmittedPage formData={mockFormData} onBack={mockOnBack} />,
    );

    await waitFor(() => {
      const downloadLink = screen.getByRole("link", { name: /download pdf/i });
      expect(downloadLink).toHaveAttribute("href", "blob:mock-url");
    });
  });
});
