import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import IntroPage from "./IntroPage";
import FormPage from "./FormPage";
import TOSPage from "./TOSPage";
import AddressPage from "./AddressPage";
import SubmittedPage from "./SubmittedPage";
import { Route, Switch, useLocation, useSearchParams } from "wouter";
import { getConfig } from "../config/configLoader";
import EditPage from "./EditPage";
import { fnv1a32 } from "../fnv1a32";

export interface FormData extends Record<string, string> {
  mainProblem: string;
  problemLocations: string;
  startOfProblem: string;
  problemAffect: string;
  whatTheyTried: string;
  solutionToProblem: string;
  solutionDate: string;
  additionalInformation: string;
  altchaPayload: string;
}

type PageState =
  | "intro"
  | "tos"
  | "form1"
  | "form2"
  | "form3"
  | "edit"
  | "addresses"
  | "submitted";

const STORAGE_KEY = "justiceFormData";
const PAGE_STATE_KEY = "justiceFormPageState";
const TOS_ACCEPTED_TERMS_KEY = "justiceTosAccepted";

const INITIAL_FORM_DATA: FormData = {
  mainProblem: "",
  problemLocations: "",
  startOfProblem: "",
  problemAffect: "",
  whatTheyTried: "",
  solutionToProblem: "",
  solutionDate: "",
  additionalInformation: "",
  altchaPayload: "",
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

const usePreviousLocation = () => {
  const [location] = useLocation();
  const [previousLocation, setPreviousLocation] = useState<string | null>(null);
  const lastSavedLocation = useRef<string | null>(null);

  useEffect(() => {
    setPreviousLocation(lastSavedLocation.current);

    lastSavedLocation.current = location;
  }, [location]);

  return previousLocation;
};

const FormContainer = () => {
  const config = getConfig();
  const terms: string = config.termsOfServicePage.terms;

  const [formData, setFormData] = useState<FormData>(() =>
    loadFromLocalStorage(STORAGE_KEY, INITIAL_FORM_DATA),
  );
  const [tosAcceptedHash, setTosAcceptedHash] = useState<string | null>(() =>
    loadFromLocalStorage(TOS_ACCEPTED_TERMS_KEY, null),
  );
  const termsHash = fnv1a32(terms);
  const tosAccepted = tosAcceptedHash === termsHash;

  const [location, setLocation] = useLocation();
  const previousLocation = usePreviousLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userLetter, setUserLetter] = useState<string>();

  let direction = "normal";
  const locationOrder = [
    "/",
    "/form1",
    "/form2",
    "/form3",
    "/edit",
    "/addresses",
  ];
  if (previousLocation) {
    const deltaLocation =
      locationOrder.indexOf(location) - locationOrder.indexOf(previousLocation);
    if (deltaLocation === 0) {
      direction = "none";
    } else if (deltaLocation < 0) {
      direction = "reverse";
    }
  }

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, formData);
  }, [formData]);

  useEffect(() => {
    saveToLocalStorage(PAGE_STATE_KEY, location);
  }, [location]);

  useEffect(() => {
    saveToLocalStorage(TOS_ACCEPTED_TERMS_KEY, tosAcceptedHash);
  }, [tosAcceptedHash]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (searchParams.get("reset") === "true") {
    setSearchParams((prev) => {
      prev.delete("reset");
      return undefined;
    });
    setFormData(INITIAL_FORM_DATA);
    setTosAcceptedHash(null);
    localStorage.clear();
    setLocation("/");
  }

  const handlePageSubmit =
    (nextPage: PageState) => (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLocation("/" + nextPage);
    };

  const handleTosAccept = () => {
    setTosAcceptedHash(termsHash);
  };

  // Route protection: redirect to intro if TOS not accepted
  const protectedPages = [
    "/form1",
    "/form2",
    "/form3",
    "/addresses",
    "/edit",
    "/submitted",
  ];
  useEffect(() => {
    if (!tosAccepted && protectedPages.includes(location)) {
      setLocation("/");
    }
  }, [location, tosAccepted]);

  return (
    <Switch>
      <Route path="/form1">
        <FormPage
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handlePageSubmit("form2")}
          backPage={
            previousLocation == "/termsofservice" ? "/termsofservice" : "/"
          }
          pageConfig={config.formPages[0]}
          animationDirection={direction}
          captcha={false}
        />
      </Route>

      <Route path="/form2">
        <FormPage
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handlePageSubmit("form3")}
          backPage="/form1"
          pageConfig={config.formPages[1]}
          animationDirection={direction}
          captcha={false}
        />
      </Route>

      <Route path="/form3">
        <FormPage
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            setUserLetter(undefined);
            handlePageSubmit("edit")(e);
          }}
          backPage="/form2"
          pageConfig={config.formPages[2]}
          animationDirection={direction}
          captcha={true}
        />
      </Route>

      <Route path="/edit">
        <EditPage
          formData={formData}
          backPage="form3"
          onChange={(e) => {
            setUserLetter(e.target.value);
          }}
          userLetter={userLetter}
          animationDirection={direction}
          onSubmit={handlePageSubmit("addresses")}
        />
      </Route>

      <Route path="/addresses">
        <AddressPage
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handlePageSubmit("submitted")}
          backPage="/edit"
          animationDirection={direction}
        />
      </Route>

      <Route path="/submitted">
        <SubmittedPage
          formData={formData}
          letterBody={userLetter ?? ""}
          backPage="addresses"
        />
      </Route>

      <Route path="/termsofservice">
        <TOSPage nextPage="/form1" backPage="/" onAccept={handleTosAccept} />
      </Route>

      <Route>
        <IntroPage
          nextPage="/form1"
          tosAccepted={tosAccepted}
          onTosAccept={handleTosAccept}
        />
      </Route>
    </Switch>
  );
};

export default FormContainer;
