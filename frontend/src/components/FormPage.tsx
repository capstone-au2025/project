import React, { useState } from "react";
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

  const [mobileQuestionIndex, setMobileQuestionIndex] = useState(0);
  const totalQuestions = questions.length;
  const currentQuestion = questions[mobileQuestionIndex];
  const isLastQuestion = mobileQuestionIndex === totalQuestions - 1;

  const handleMobileNext = () => {
    if (mobileQuestionIndex < totalQuestions - 1) {
      setMobileQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleMobilePrevious = () => {
    if (mobileQuestionIndex > 0) {
      setMobileQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <PageLayout>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg border border-gray-100">
        {/* Progress Indicator */}
        <div className="p-6 pb-4">
          <ProgressIndicator currentStep={pageNumber} totalSteps={3} />
        </div>

        {/* Header */}
        <div className="px-6 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 text-center">
            {title}
          </h1>
          <p className="text-lg text-gray-600 text-center">{subtitle}</p>
        </div>

        {/* Tip Box */}
        <div
          className={`mx-6 mb-6 border-l-4 p-4 rounded-r-lg ${
            tipType === "success"
              ? "bg-green-50 border-green-500"
              : "bg-primary-light border-primary"
          }`}
        >
          <p className="text-sm md:text-base text-gray-700">
            <strong>{tipType === "success" ? "Almost done!" : "Tip:"}</strong>{" "}
            {tipText}
          </p>
        </div>

        <form onSubmit={onSubmit}>
          {/* Mobile: Single Question */}
          <div className="md:hidden px-6 pb-6">
            <div className="mb-4">
              <p className="text-sm text-gray-500 font-medium">
                Question {mobileQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
            <QuestionBox
              label={currentQuestion.label}
              name={currentQuestion.name}
              value={formData[currentQuestion.name] || ""}
              onChange={onInputChange}
              placeholder={currentQuestion.placeholder}
              required={currentQuestion.required}
            />

            {/* Mobile Buttons */}
            <div className="space-y-3 mt-6">
              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleMobileNext}
                  className="w-full py-4 px-6 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-hover transition-all duration-200 shadow-md"
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-hover transition-all duration-200 shadow-md"
                >
                  {submitButtonText}
                </button>
              )}

              <div className="flex gap-3">
                {mobileQuestionIndex > 0 && (
                  <button
                    type="button"
                    onClick={handleMobilePrevious}
                    className="flex-1 py-3 px-4 bg-gray-100 border-2 border-gray-300 rounded-md font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    Previous
                  </button>
                )}
                {onBack && mobileQuestionIndex === 0 && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 py-3 px-4 bg-gray-100 border-2 border-gray-300 rounded-md font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    Back
                  </button>
                )}
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                {pageInfoText}
              </p>
            </div>
          </div>

          {/* Desktop: All Questions */}
          <div className="hidden md:block px-6 pb-6 space-y-4">
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

            {/* Desktop Buttons */}
            <div className="pt-4">
              <div className="flex gap-4">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-8 py-3 bg-gray-100 border-2 border-gray-300 rounded-md font-semibold hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-4 px-8 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {submitButtonText}
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-3">
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
