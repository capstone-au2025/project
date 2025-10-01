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
    <div className="w-full max-w-2xl px-6 py-8 bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="mb-8">
        <h1 className="text-center text-4xl md:text-5xl font-bold mb-3 text-gray-900 tracking-wide">
          Tell Us About Your Concerns
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Please provide details about your housing situation below
        </p>
      </div>

      <div className="bg-[#FF4D00]/5 border-l-4 border-[#FF4D00] p-4 mb-8 rounded-r-lg">
        <p className="text-sm text-gray-700">
          <strong>Tip:</strong> Be as specific as possible. Include dates,
          locations, and any relevant documentation if available. Please do not Include
          any personal information in your answers.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <QuestionBox
          label="What problems are occuring with your house/apartment?"
          name="issue1"
          value={formData.issue1}
          onChange={onInputChange}
          placeholder="Examples: no running water, no heat or A/C, lock is broken, etc"
          required
        />

        <QuestionBox
          label="Where is each problem described happening? "
          name="issue2"
          value={formData.issue2}
          onChange={onInputChange}
          placeholder="Example: The bathroom sink is broken..."
        />

        <QuestionBox
          label="When did each problem start?"
          name="issue3"
          value={formData.issue3}
          onChange={onInputChange}
          placeholder="Provide the date or time that the problem started"
        />

        <QuestionBox
          label="Additional Information"
          name="issue4"
          value={formData.issue4}
          onChange={onInputChange}
          placeholder="Any other details you'd like your landlord to know..."
        />

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-4 px-6 bg-[#FF4D00] text-white rounded-md font-bold text-lg cursor-pointer hover:bg-[#E64400] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            Submit Your Information
          </button>
          <p className="text-center text-sm text-gray-500 mt-3">
            Your information will be sent to an AI tool and transformed into a letter.
          </p>
        </div>
      </form>
    </div>
  );
};

export default FormPage;
