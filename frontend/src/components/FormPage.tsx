import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import QuestionBox from "./QuestionBox";
import ProgressIndicator from "./ProgressIndicator";
import PageLayout from "./PageLayout";
import type { PageConfig } from "../config/formQuestions";

interface FormPageProps {
  formData: Record<string, string>;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBack?: () => void;
  pageConfig: PageConfig;
}

const FormPage: React.FC<FormPageProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onBack,
  pageConfig,
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

  return (
    <PageLayout>
      <div className="w-full max-w-2xl bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-gray-100">
        {/* Progress Indicator */}
        <div className="p-6 pb-4">
          <ProgressIndicator currentStep={pageNumber} totalSteps={3} />
        </div>

        {/* Header */}
        <div className="px-6 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-primary text-center uppercase">
            {title}
          </h1>
          <p className="text-lg text-text-primary text-center">{subtitle}</p>
        </div>

        {/* Tip Box */}
        <div
          className={`mx-6 mb-6 border-l-4 p-4 rounded-r-lg ${tipType === "success"
              ? "bg-sky-light border-butterscotch"
              : "bg-primary-light border-primary"
            }`}
        >
          <p className="text-sm md:text-base text-text-primary">
            <strong>{tipType === "success" ? "Almost done!" : "Tip:"}</strong>{" "}
            {tipText}
          </p>
        </div>

        <form onSubmit={onSubmit}>
          {/* All Questions */}
          <div className="px-6 pb-6 space-y-4">
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
            <div className="pt-4">
              <div className="flex gap-4">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-8 py-3 bg-white border-2 border-border rounded-md font-semibold hover:bg-sky-light hover:border-border-hover transition-all duration-200 uppercase"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-4 px-8 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase"
                >
                  {submitButtonText}
                </button>
              </div>
              <p className="text-center text-sm text-text-muted mt-3">
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
