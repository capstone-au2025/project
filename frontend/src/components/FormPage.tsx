import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import QuestionBox from "./QuestionBox";
import ProgressIndicator from "./ProgressIndicator";
import PageLayout from "./PageLayout";
import { Link, useLocation } from "wouter";
import type { PageConfig } from "../config/configLoader";
import { getConfig } from "../config/configLoader";

interface FormPageProps {
  formData: Record<string, string>;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  backPage: string;
  pageConfig: PageConfig;
  animationDirection: string;
}

const FormPage: React.FC<FormPageProps> = ({
  formData,
  onInputChange,
  onSubmit,
  pageConfig,
  backPage,
  animationDirection,
}) => {
  const {
    pageNumber,
    title,
    subtitle,
    tipText,
    tipType,
    questions,
    submitButtonText,
    pageInfoText,
  } = pageConfig;

  const [location, _] = useLocation();

  const getAnimationName = () => {
    if (animationDirection == "normal") {
      return "animate-slide-in";
    } else if (animationDirection == "reverse") {
      return "animate-slide-out";
    }
    return "";
  };

  return (
    <PageLayout>
      <div
        id={"page" + pageNumber}
        key={location}
        className={`w-full max-w-2xl bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-sky ${getAnimationName()}`}
      >
        {/* Progress Indicator */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4">
          <ProgressIndicator currentStep={pageNumber} totalSteps={3} />
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-primary text-center uppercase leading-tight">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-text-primary text-center">
            {subtitle}
          </p>
        </div>

        {/* Tip Box */}
        <div
          className={`mx-4 sm:mx-6 mb-4 sm:mb-6 border-l-4 p-3 sm:p-4 rounded-r-lg shadow-sm ${
            tipType === "success"
              ? "bg-white border-butterscotch"
              : "bg-white border-primary"
          }`}
        >
          <p className="text-xs sm:text-sm md:text-base text-text-primary">
            <strong className="text-primary">
              {tipType === "success"
                ? getConfig().common.successTipPrefix
                : getConfig().common.tipPrefix}
            </strong>{" "}
            {tipText}
          </p>
        </div>

        <form onSubmit={onSubmit}>
          {/* All Questions */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-5">
            {questions.map((question) => (
              <QuestionBox
                key={question.name}
                label={question.label}
                name={question.name}
                value={formData[question.name] || ""}
                onChange={onInputChange}
                placeholder={question.placeholder}
                required={question.required}
              />
            ))}

            {/* Buttons */}
            <div className="pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href={backPage}
                  type="button"
                  className="px-6 sm:px-8 py-3 bg-white border-2 border-border rounded-md font-semibold hover:bg-white hover:border-border-hover transition-all duration-200 uppercase text-sm sm:text-base leading-1 grid items-center"
                >
                  {getConfig().common.backButton}
                </Link>
                <button
                  type="submit"
                  className="flex-1 py-3 sm:py-4 px-6 sm:px-8 bg-primary text-white rounded-md font-bold text-base sm:text-lg hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase"
                >
                  {submitButtonText}
                </button>
              </div>
              <p className="text-center text-xs sm:text-sm text-text-muted mt-3">
                {pageInfoText}
              </p>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default FormPage;
