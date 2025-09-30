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
      <div className="w-full max-w-md px-5 py-10 bg-white text-center">
        <h1 className="text-3xl font-bold mb-5 text-green-600">
          Submission Received!
        </h1>
        <p className="text-base text-gray-600 mb-8 leading-relaxed">
          Thank you for submitting your information. We have received your
          responses and will process them shortly.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="px-6 py-3 bg-gray-100 border-2 border-black rounded font-bold text-sm cursor-pointer hover:bg-gray-200 transition-colors"
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
