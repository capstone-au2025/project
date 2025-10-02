import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import QuestionBox from "./QuestionBox";
import ProgressIndicator from "./ProgressIndicator";

export interface FormData {
  issue5: string;
  issue6: string;
  issue7: string;
  issue8: string;
  issue9: string;
}

interface FormPage2Props {
  formData: FormData;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

const FormPage2: React.FC<FormPage2Props> = ({
  formData,
  onInputChange,
  onSubmit,
  onBack,
}) => {
  return (
    <div className="w-full max-w-2xl px-6 py-8 bg-white rounded-lg shadow-lg border border-gray-100">
      <ProgressIndicator currentStep={2} totalSteps={3} />

      <div className="mb-8">
        <h1 className="text-center text-4xl md:text-5xl font-bold mb-3 text-gray-900 tracking-wide">
          Additional Details
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Help us understand more about your situation
        </p>
      </div>

      <div className="bg-[#FF4D00]/5 border-l-4 border-[#FF4D00] p-4 mb-8 rounded-r-lg">
        <p className="text-sm text-gray-700">
          <strong>Tip:</strong> Continue to be specific with dates, locations,
          and any relevant details. This information helps create a clear record
          of your concerns.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <QuestionBox
          label="Have you notified your landlord about these issues before?"
          name="issue5"
          value={formData.issue5}
          onChange={onInputChange}
          placeholder="Example: Yes, I called on [date] and sent an email on [date]..."
          required
        />

        <QuestionBox
          label="If yes, what was their response?"
          name="issue6"
          value={formData.issue6}
          onChange={onInputChange}
          placeholder="Example: They said they would send someone to fix it..."
        />

        <QuestionBox
          label="Are there any health or safety concerns related to these issues?"
          name="issue7"
          value={formData.issue7}
          onChange={onInputChange}
          placeholder="Example: The lack of heat is affecting my family's health..."
        />

        <QuestionBox
          label="Do you have any documentation? (photos, emails, texts)"
          name="issue8"
          value={formData.issue8}
          onChange={onInputChange}
          placeholder="Example: Yes, I have photos of the damage and email correspondence..."
        />

        <QuestionBox
          label="How have these issues affected your daily life?"
          name="issue9"
          value={formData.issue9}
          onChange={onInputChange}
          placeholder="Example: We can't cook meals or the cold is keeping us up at night..."
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
            Continue
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-3">
          Page 2 of 3 - Almost there!
        </p>
      </form>
    </div>
  );
};

export default FormPage2;
