import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import IntroPage from "./IntroPage";
import FormPage from "./FormPage";
import FormPage2 from "./FormPage2";
import FormPage3 from "./FormPage3";

export interface FormData {
  // Page 1 questions
  issue1: string;
  issue2: string;
  issue3: string;
  issue4: string;
  // Page 2 questions
  issue5: string;
  issue6: string;
  issue7: string;
  issue8: string;
  issue9: string;
  // Page 3 question
  issue10: string;
}

type PageState = "intro" | "form1" | "form2" | "form3" | "submitted";

const STORAGE_KEY = "justiceFormData";
const PAGE_STATE_KEY = "justiceFormPageState";

const FormContainer = () => {
  // Load initial form data from local storage
  const loadFormData = (): FormData => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading form data from localStorage:", error);
    }
    return {
      issue1: "",
      issue2: "",
      issue3: "",
      issue4: "",
      issue5: "",
      issue6: "",
      issue7: "",
      issue8: "",
      issue9: "",
      issue10: "",
    };
  };

  // Load initial page state from local storage
  const loadPageState = (): PageState => {
    try {
      const saved = localStorage.getItem(PAGE_STATE_KEY);
      if (saved) {
        return saved as PageState;
      }
    } catch (error) {
      console.error("Error loading page state from localStorage:", error);
    }
    return "intro";
  };

  // Centralized state for all form pages
  const [formData, setFormData] = useState<FormData>(loadFormData);

  // State to track current page
  const [currentPage, setCurrentPage] = useState<PageState>(loadPageState);

  // Save form data to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error("Error saving form data to localStorage:", error);
    }
  }, [formData]);

  // Save page state to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PAGE_STATE_KEY, currentPage);
    } catch (error) {
      console.error("Error saving page state to localStorage:", error);
    }
  }, [currentPage]);

  // Handle input changes for any question
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form page 1 submission
  const handlePage1Submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage("form2");
  };

  // Handle form page 2 submission
  const handlePage2Submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage("form3");
  };

  // Handle final form submission
  const handleFinalSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("All form data:", formData);
    setCurrentPage("submitted");
  };

  // Handle get started
  const handleGetStarted = () => {
    setCurrentPage("form1");
  };

  // Handle back navigation
  const handleBackToPage1 = () => {
    setCurrentPage("form1");
  };

  const handleBackToPage2 = () => {
    setCurrentPage("form2");
  };

  // Handle restart
  const handleRestart = () => {
    setFormData({
      issue1: "",
      issue2: "",
      issue3: "",
      issue4: "",
      issue5: "",
      issue6: "",
      issue7: "",
      issue8: "",
      issue9: "",
      issue10: "",
    });
    setCurrentPage("intro");
  };

  // Show intro page
  if (currentPage === "intro") {
    return <IntroPage onGetStarted={handleGetStarted} />;
  }

  // Show confirmation page if submitted
  if (currentPage === "submitted") {
    const CheckmarkIcon = (
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
    );

    return (
      <div className="w-full max-w-2xl px-6 py-12 bg-white rounded-lg shadow-lg border border-gray-100 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            {CheckmarkIcon}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#FF4D00] tracking-wide">
            Submission Received!
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto">
          Thank you for submitting your information. We are generating a letter
          for you now. Please review this letter to ensure correctness!
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

  // Show form page 1
  if (currentPage === "form1") {
    return (
      <FormPage
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handlePage1Submit}
      />
    );
  }

  // Show form page 2
  if (currentPage === "form2") {
    return (
      <FormPage2
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handlePage2Submit}
        onBack={handleBackToPage1}
      />
    );
  }

  // Show form page 3
  if (currentPage === "form3") {
    return (
      <FormPage3
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleFinalSubmit}
        onBack={handleBackToPage2}
      />
    );
  }

  // Default fallback (shouldn't reach here)
  return null;
};

export default FormContainer;
