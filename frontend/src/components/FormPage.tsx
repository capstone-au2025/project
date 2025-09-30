import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import QuestionBox from "./QuestionBox";

export interface FormData {
  issue1: string;
  issue2: string;
  issue3: string;
  issue4: string;
}

interface FormPageProps {
  formData: FormData;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const FormPage: React.FC<FormPageProps> = ({
  formData,
  onInputChange,
  onSubmit,
}) => {
  return (
    <div className="w-full max-w-md px-5 py-5 bg-white">
      <h1 className="text-center text-2xl font-bold mb-8">
        Tell Us About Your Issues
      </h1>

      <form onSubmit={onSubmit}>
        {/* Repeat QuestionBox components */}
        <QuestionBox
          label="Briefly Describe your first issue:"
          name="issue1"
          value={formData.issue1}
          onChange={onInputChange}
          placeholder="Enter your first issue here..."
        />

        <QuestionBox
          label="Briefly Describe your second issue:"
          name="issue2"
          value={formData.issue2}
          onChange={onInputChange}
          placeholder="Enter your second issue here..."
        />

        <QuestionBox
          label="Briefly Describe your third issue:"
          name="issue3"
          value={formData.issue3}
          onChange={onInputChange}
          placeholder="Enter your third issue here..."
        />

        <QuestionBox
          label="Any additional concerns:"
          name="issue4"
          value={formData.issue4}
          onChange={onInputChange}
          placeholder="Enter any additional concerns..."
        />

        <button
          type="submit"
          className="w-full py-4 px-4 bg-black text-white rounded font-bold text-base cursor-pointer mt-5 hover:bg-gray-800 transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default FormPage;
