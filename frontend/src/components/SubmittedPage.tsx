import React from "react";
import PageLayout from "./PageLayout";
import { CheckmarkIcon } from "./icons";

interface SubmittedPageProps {
  onRestart: () => void;
}

const SubmittedPage: React.FC<SubmittedPageProps> = ({ onRestart }) => {
  return (
    <PageLayout>
      <div className="w-full max-w-2xl px-6 py-12 bg-white rounded-lg shadow-lg border border-sky text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-butterscotch/30 rounded-full flex items-center justify-center mx-auto mb-6">
            {CheckmarkIcon}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary tracking-wide uppercase">
            Submission Received!
          </h1>
        </div>
        <p className="text-lg text-text-primary mb-10 leading-relaxed max-w-xl mx-auto">
          Thank you for submitting your information. We are generating a letter
          for you now. Please review this letter to ensure correctness!
        </p>
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-white border-2 border-border rounded-md font-semibold text-base cursor-pointer hover:bg-sky-light hover:border-border-hover transition-all duration-200 uppercase"
        >
          Submit Another Form
        </button>
      </div>
    </PageLayout>
  );
};

export default SubmittedPage;
