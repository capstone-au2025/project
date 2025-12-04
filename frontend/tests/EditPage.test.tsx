import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EditPage from "../src/components/EditPage";
import "@testing-library/jest-dom";
import { memoryLocation } from "wouter/memory-location";
import { Route, Router } from "wouter";

describe("EditPage", () => {
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
    });
  }) as unknown as typeof fetch;

  const renderWithQueryClient = (component: React.ReactElement) => {
    const { navigate, hook } = memoryLocation();
    navigate("/edit");
    return render(
      <QueryClientProvider client={queryClient}>
        <Router hook={hook}>
          <Route path="edit">{component}</Route>
          <Route path="/">Intro page </Route>
        </Router>
        ,
      </QueryClientProvider>,
    );
  };

  it("should send text data to text API", async () => {
    renderWithQueryClient(
      <EditPage
        formData={mockFormData}
        backPage="form3"
        userLetter={undefined}
        animationDirection={"normal"}
      />,
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
});
