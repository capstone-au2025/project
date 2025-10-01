import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import IntroPage from "./IntroPage";
import FormPage from "./FormPage";

export interface FormData {
  issue1: string;
  issue2: string;
  issue3: string;
  issue4: string;
}

type PageState = "intro" | "form" | "submitted";

const FormContainer = () => {
  // Centralized state for all form pages
  const [formData, setFormData] = useState<FormData>({
    issue1: "",
    issue2: "",
    issue3: "",
    issue4: "",
  });

  // State to track current page
  const [currentPage, setCurrentPage] = useState<PageState>("intro");

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
    setCurrentPage("submitted");
  };

  // Handle get started
  const handleGetStarted = () => {
    setCurrentPage("form");
  };

  // Handle restart
  const handleRestart = () => {
    setFormData({
      issue1: "",
      issue2: "",
      issue3: "",
      issue4: "",
    });
    setCurrentPage("intro");
  };

  // Show intro page
  if (currentPage === "intro") {
    return <IntroPage onGetStarted={handleGetStarted} />;
  }

  // Show confirmation page if submitted
  if (currentPage === "submitted") {
    return (
      <div className="w-full max-w-2xl px-6 py-12 bg-white rounded-lg shadow-lg border border-gray-100 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#FF4D00] tracking-wide">
            Submission Received!
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto">
          Thank you for submitting your information. We are generating a letter for you now. Please review this letter to
          ensure correctness!
        </p>
        <button
          onClick={handleRestart}
          className="px-8 py-3 bg-gray-100 border-2 border-gray-300 rounded-md font-semibold text-base cursor-pointer hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
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
