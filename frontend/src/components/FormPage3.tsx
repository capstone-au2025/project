import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import QuestionBox from "./QuestionBox";
import ProgressIndicator from "./ProgressIndicator";

export interface FormData {
  issue10: string;
}

interface FormPage3Props {
  formData: FormData;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

const FormPage3: React.FC<FormPage3Props> = ({
  formData,
  onInputChange,
  onSubmit,
  onBack,
}) => {
  return (
    <div className="w-full max-w-2xl px-6 py-8 bg-white rounded-lg shadow-lg border border-gray-100">
      <ProgressIndicator currentStep={3} totalSteps={3} />

      <div className="mb-8">
        <h1 className="text-center text-4xl md:text-5xl font-bold mb-3 text-gray-900 tracking-wide">
          Final Question
        </h1>
        <p className="text-center text-gray-600 text-lg">
          One last thing before we generate your letter
        </p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8 rounded-r-lg">
        <p className="text-sm text-gray-700">
          <strong>Almost done!</strong> This final question helps us understand
          your desired outcome so we can craft an effective communication.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <QuestionBox
          label="What would you like to happen? What is your desired outcome?"
          name="issue10"
          value={formData.issue10}
          onChange={onInputChange}
          placeholder="Example: I would like the landlord to fix the heating system within the next week and provide temporary heating in the meantime..."
          required
        />

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-4 px-6 bg-gray-100 border-2 border-gray-300 rounded-md font-semibold text-lg cursor-pointer hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 py-4 px-6 bg-[#FF4D00] text-white rounded-md font-bold text-lg cursor-pointer hover:bg-[#E64400] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            Generate Letter
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-3">
          Page 3 of 3 - Ready to submit!
        </p>
      </form>
    </div>
  );
};

export default FormPage3;
