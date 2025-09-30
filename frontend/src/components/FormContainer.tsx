import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import FormPage from "./FormPage";

export interface FormData {
  issue1: string;
  issue2: string;
  issue3: string;
  issue4: string;
}

const FormContainer = () => {
  // Centralized state for all form pages
  const [formData, setFormData] = useState<FormData>({
    issue1: "",
    issue2: "",
    issue3: "",
    issue4: "",
  });

  // State to track if form has been submitted
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle input changes for any question
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("All form data:", formData);

    // Redirect to confirmation page
    setIsSubmitted(true);
  };

  // Show confirmation page if submitted
  if (isSubmitted) {
    return (
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "40px 20px",
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "20px" }}></div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#4CAF50",
          }}
        >
          Submission Received!
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#666",
            marginBottom: "30px",
            lineHeight: "1.5",
          }}
        >
          Thank you for submitting your information. We have received your
          responses and will process them shortly.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#f0f0f0",
            border: "2px solid #000",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Submit Another Form
        </button>
      </div>
    );
  }

  return (
    <FormPage
      formData={formData}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
    />
  );
};

export default FormContainer;
