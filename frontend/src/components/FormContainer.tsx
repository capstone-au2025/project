import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import IntroPage from "./IntroPage";
import FormPage from "./FormPage";
import SubmittedPage from "./SubmittedPage";
import { formPages } from "../config/formQuestions";
import { Route, Switch, useLocation } from "wouter";

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
  const [location, setLocation] = useLocation();

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, formData);
  }, [formData]);

  useEffect(() => {
    saveToLocalStorage(PAGE_STATE_KEY, location);
  }, [location]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageSubmit =
    (nextPage: PageState) => (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLocation("/" + nextPage);
    };

  return (
    <Switch>
      <Route path="/">
        <IntroPage nextPage="/form1" />
      </Route>

      <Route path="/form1">
        <FormPage
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handlePageSubmit("form2")}
          backPage="/"
          pageConfig={formPages[0]}
        />
      </Route>

      <Route path="/form2">
        <FormPage
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handlePageSubmit("form3")}
          backPage="/form1"
          pageConfig={formPages[1]}
        />
      </Route>

      <Route path="/form3">
        <FormPage
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handlePageSubmit("submitted")}
          backPage="/form2"
          pageConfig={formPages[2]}
        />
      </Route>

      <Route path="/submitted">
        <SubmittedPage formData={formData} backPage="form3" />
      </Route>
    </Switch>
  );
};

export default FormContainer;
