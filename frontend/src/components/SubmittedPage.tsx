import React from "react";
import PageLayout from "./PageLayout";
import { CheckmarkIcon } from "./icons";

interface SubmittedPageProps {
  onRestart: () => void;
}

const SubmittedPage: React.FC<SubmittedPageProps> = ({ onRestart }) => {
  return (
    <PageLayout>
      <div className="w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12 bg-white rounded-lg shadow-lg border border-sky text-center">
        <div className="mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-butterscotch/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            {CheckmarkIcon}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-primary tracking-wide uppercase leading-tight px-2">
            Submission Received!
          </h1>
        </div>
        <p className="text-base sm:text-lg text-text-primary mb-8 sm:mb-10 leading-relaxed max-w-xl mx-auto px-2">
          Thank you for submitting your information. We are generating a letter
          for you now. Please review this letter to ensure correctness!
        </p>
        <button
          onClick={onRestart}
          className="px-6 sm:px-8 py-3 bg-white border-2 border-border rounded-md font-semibold text-sm sm:text-base cursor-pointer hover:bg-white hover:border-border-hover transition-all duration-200 uppercase"
        >
          Submit Another Form
        </button>
      </div>
    </PageLayout>
  );
};

export default SubmittedPage;
