import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { base64ToUint8Array, sendMail, STATES } from "../src/certifiedmail";
import type { SendMailOptions } from "../src/certifiedmail";

describe("certifiedmail", () => {
  describe("base64ToUint8Array", () => {
    it("should convert base64 string to Uint8Array", () => {
      const base64 = btoa("Hello World");
      const result = base64ToUint8Array(base64);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(11); // "Hello World" is 11 bytes
    });

    it("should correctly convert simple text", () => {
      const text = "Test";
      const base64 = btoa(text);
      const result = base64ToUint8Array(base64);

      // Convert back to verify
      const decoder = new TextDecoder();
      const decoded = decoder.decode(result);

      expect(decoded).toBe(text);
    });

    it("should handle empty string", () => {
      const base64 = btoa("");
      const result = base64ToUint8Array(base64);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });

    it("should handle longer content", () => {
      const longText = "A".repeat(1000);
      const base64 = btoa(longText);
      const result = base64ToUint8Array(base64);

      expect(result.length).toBe(1000);
    });

    it("should correctly convert binary data", () => {
      const binaryData = "\x00\x01\x02\x03\x04";
      const base64 = btoa(binaryData);
      const result = base64ToUint8Array(base64);

      expect(result[0]).toBe(0);
      expect(result[1]).toBe(1);
      expect(result[2]).toBe(2);
      expect(result[3]).toBe(3);
      expect(result[4]).toBe(4);
    });
  });

  describe("sendMail", () => {
    let mockForm: HTMLFormElement;
    let submitSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Mock document.createElement
      mockForm = {
        method: "",
        action: "",
        enctype: "",
        target: "",
        style: { display: "" },
        appendChild: vi.fn(),
        submit: vi.fn(),
      } as unknown as HTMLFormElement;

      submitSpy = vi.spyOn(mockForm, "submit");

      vi.spyOn(document, "createElement").mockImplementation(
        (tagName: string) => {
          if (tagName === "form") {
            return mockForm;
          }
          if (tagName === "input") {
            return {
              type: "",
              name: "",
              value: "",
              files: null,
            } as unknown as HTMLInputElement;
          }
          return document.createElement(tagName);
        },
      );

      vi.spyOn(document.body, "appendChild").mockImplementation(
        () => null as unknown as Node,
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(
        () => null as unknown as Node,
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should create and submit a form", () => {
      const options: SendMailOptions = {
        pdfName: "test.pdf",
        pdfBytes: new Uint8Array([1, 2, 3]),
        letterName: "Test Letter",
        duplex: false,
        sender: {
          name: "John Doe",
          company: undefined,
          address: "123 Main St",
          city: "Columbus",
          state: "OH",
          zip: "43201",
        },
        destination: {
          name: "Jane Smith",
          company: undefined,
          address: "456 Oak Ave",
          city: "Cleveland",
          state: "OH",
          zip: "44101",
        },
      };

      sendMail(options);

      expect(mockForm.method).toBe("POST");
      expect(mockForm.action).toBe(
        "https://www.onlinecertifiedmail.com/step2.php",
      );
      expect(mockForm.enctype).toBe("multipart/form-data");
      expect(mockForm.target).toBe("_blank");
      expect(mockForm.style.display).toBe("none");
      expect(submitSpy).toHaveBeenCalled();
    });

    it("should set duplex to Yes when true", () => {
      const options: SendMailOptions = {
        pdfName: "test.pdf",
        pdfBytes: new Uint8Array([1, 2, 3]),
        letterName: "Test Letter",
        duplex: true,
        sender: {
          name: "John Doe",
          company: undefined,
          address: "123 Main St",
          city: "Columbus",
          state: "OH",
          zip: "43201",
        },
        destination: {
          name: "Jane Smith",
          company: undefined,
          address: "456 Oak Ave",
          city: "Cleveland",
          state: "OH",
          zip: "44101",
        },
      };

      sendMail(options);

      expect(mockForm.appendChild).toHaveBeenCalled();
    });

    it("should set duplex to No when false", () => {
      const options: SendMailOptions = {
        pdfName: "test.pdf",
        pdfBytes: new Uint8Array([1, 2, 3]),
        letterName: "Test Letter",
        duplex: false,
        sender: {
          name: "John Doe",
          company: undefined,
          address: "123 Main St",
          city: "Columbus",
          state: "OH",
          zip: "43201",
        },
        destination: {
          name: "Jane Smith",
          company: undefined,
          address: "456 Oak Ave",
          city: "Cleveland",
          state: "OH",
          zip: "44101",
        },
      };

      sendMail(options);

      expect(mockForm.appendChild).toHaveBeenCalled();
    });

    it("should handle company name when provided", () => {
      const options: SendMailOptions = {
        pdfName: "test.pdf",
        pdfBytes: new Uint8Array([1, 2, 3]),
        letterName: "Test Letter",
        duplex: false,
        sender: {
          name: "John Doe",
          company: "ACME Corp",
          address: "123 Main St",
          city: "Columbus",
          state: "OH",
          zip: "43201",
        },
        destination: {
          name: "Jane Smith",
          company: "XYZ Inc",
          address: "456 Oak Ave",
          city: "Cleveland",
          state: "OH",
          zip: "44101",
        },
      };

      sendMail(options);

      expect(submitSpy).toHaveBeenCalled();
    });

    it("should append form to body and remove it after submit", () => {
      const options: SendMailOptions = {
        pdfName: "test.pdf",
        pdfBytes: new Uint8Array([1, 2, 3]),
        letterName: "Test Letter",
        duplex: false,
        sender: {
          name: "John Doe",
          company: undefined,
          address: "123 Main St",
          city: "Columbus",
          state: "OH",
          zip: "43201",
        },
        destination: {
          name: "Jane Smith",
          company: undefined,
          address: "456 Oak Ave",
          city: "Cleveland",
          state: "OH",
          zip: "44101",
        },
      };

      sendMail(options);

      expect(document.body.appendChild).toHaveBeenCalledWith(mockForm);
      expect(submitSpy).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(mockForm);
    });
  });

  describe("STATES", () => {
    it("should contain all 50 US states", () => {
      const stateKeys = Object.keys(STATES);
      const usStates = stateKeys.filter(
        (key) => !["DC", "VI", "PR"].includes(key),
      );

      expect(usStates.length).toBe(50);
    });

    it("should include DC, VI, and PR", () => {
      expect(STATES.DC).toBe("District of Columbia");
      expect(STATES.VI).toBe("Virgin Islands");
      expect(STATES.PR).toBe("Puerto Rico");
    });

    it("should have correct state names", () => {
      expect(STATES.OH).toBe("Ohio");
      expect(STATES.CA).toBe("California");
      expect(STATES.NY).toBe("New York");
      expect(STATES.TX).toBe("Texas");
      expect(STATES.FL).toBe("Florida");
    });

    it("should have all states as uppercase abbreviations", () => {
      const stateKeys = Object.keys(STATES);

      stateKeys.forEach((key) => {
        expect(key).toBe(key.toUpperCase());
        expect(key.length).toBe(2);
      });
    });

    it("should contain exactly 53 entries", () => {
      // 50 states + DC + VI + PR = 53
      expect(Object.keys(STATES).length).toBe(53);
    });
  });
});
