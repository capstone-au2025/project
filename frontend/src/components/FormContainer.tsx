import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import IntroPage from "./IntroPage";
import FormPage from "./FormPage";
import SubmittedPage from "./SubmittedPage";
import { formPages } from "../config/formQuestions";

export interface FormData extends Record<string, string> {
  issue1: string;
  issue2: string;
  issue3: string;
  issue4: string;
  issue5: string;
  issue6: string;
  issue7: string;
  issue8: string;
  issue9: string;
  issue10: string;
}

type PageState = "intro" | "form1" | "form2" | "form3" | "submitted";

const STORAGE_KEY = "justiceFormData";
const PAGE_STATE_KEY = "justiceFormPageState";

const INITIAL_FORM_DATA: FormData = {
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

const loadFromLocalStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return fallback;
  }
};

const saveToLocalStorage = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const FormContainer = () => {
  const [formData, setFormData] = useState<FormData>(() =>
    loadFromLocalStorage(STORAGE_KEY, INITIAL_FORM_DATA),
  );
  const [currentPage, setCurrentPage] = useState<PageState>(() => {
    // Check URL parameter to force start from intro
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("reset") === "true") {
      localStorage.clear();
      return "intro";
    }
    return loadFromLocalStorage(PAGE_STATE_KEY, "intro" as PageState);
  });

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, formData);
  }, [formData]);

  useEffect(() => {
    saveToLocalStorage(PAGE_STATE_KEY, currentPage);
  }, [currentPage]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetStarted = () => setCurrentPage("form1");

  const handlePageSubmit =
    (nextPage: PageState) => (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (nextPage === "submitted") {
        console.log("All form data:", formData);
      }
      setCurrentPage(nextPage);
    };

  const handleBackNavigation = (previousPage: PageState) => () => {
    setCurrentPage(previousPage);
  };

  const handleBackToIntro = () => {
    setCurrentPage("intro");
  };

  const handleRestart = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentPage("intro");
  };

  // Page routing
  const pageRoutes: Record<PageState, React.ReactElement | null> = {
    intro: <IntroPage onGetStarted={handleGetStarted} />,
    form1: (
      <FormPage
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handlePageSubmit("form2")}
        onBack={handleBackToIntro}
        pageConfig={formPages[0]}
      />
    ),
    form2: (
      <FormPage
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handlePageSubmit("form3")}
        onBack={handleBackNavigation("form1")}
        pageConfig={formPages[1]}
      />
    ),
    form3: (
      <FormPage
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handlePageSubmit("submitted")}
        onBack={handleBackNavigation("form2")}
        pageConfig={formPages[2]}
      />
    ),
    submitted: <SubmittedPage onRestart={handleRestart} />,
  };

  return pageRoutes[currentPage];
};

export default FormContainer;
