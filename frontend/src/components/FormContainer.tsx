import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import IntroPage from "./IntroPage";
import FormPage from "./FormPage";
import SubmittedPage from "./SubmittedPage";
import { formPages } from "../config/formQuestions";

export interface FormData extends Record<string, string> {
  mainProblem: string;
  problemLocations: string;
  startOfProblem: string;
  problemAffect: string;
  whatTheyTried: string;
  solutionToProblem: string;
  solutionDate: string;
  additionalInformation: string;
}

type PageState = "intro" | "form1" | "form2" | "form3" | "submitted";

const STORAGE_KEY = "justiceFormData";
const PAGE_STATE_KEY = "justiceFormPageState";

const INITIAL_FORM_DATA: FormData = {
  mainProblem: "",
  problemLocations: "",
  startOfProblem: "",
  problemAffect: "",
  whatTheyTried: "",
  solutionToProblem: "",
  solutionDate: "",
  additionalInformation: "",
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
      setFormData(INITIAL_FORM_DATA);
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
        
      setCurrentPage(nextPage);
    };

  const handleBackNavigation = (previousPage: PageState) => () => {
    setCurrentPage(previousPage);
  };

  const handleBackToIntro = () => {
    setCurrentPage("intro");
  };

    return (
        <>
            {currentPage == "intro" && <IntroPage onGetStarted={handleGetStarted} />}
        {currentPage === "form1" &&
            <FormPage
         formData={formData}
         onInputChange={handleInputChange}
         onSubmit={handlePageSubmit("form2")}
         onBack={handleBackToIntro}
         pageConfig={formPages[0]}
            />}
        { currentPage == "form2" &&
            <FormPage
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handlePageSubmit("form3")}
          onBack={handleBackNavigation("form1")}
          pageConfig={formPages[1]}
            />
            }
        {currentPage == "form3" &&
            <FormPage
         formData={formData}
         onInputChange={handleInputChange}
         onSubmit={handlePageSubmit("submitted")}
         onBack={handleBackNavigation("form2")}
         pageConfig={formPages[2]}
            />}
        {currentPage == "submitted"  &&
            <SubmittedPage
         formData={formData}
         onBack={() => setCurrentPage("form3")}
            />}
        </>
    );

};

export default FormContainer;
