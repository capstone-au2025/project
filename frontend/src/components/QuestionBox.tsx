import React, { type ChangeEvent } from "react";

interface QuestionBoxProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  return (
    <div className="mb-5">
      <label
        htmlFor={name}
        className="block mb-3 font-semibold text-lg text-gray-800"
      >
        {label}
        {required && <span className="text-[#FF4D00] ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full min-h-[120px] p-4 border-2 border-gray-300 rounded-md text-base font-sans resize-y focus:outline-none focus:border-[#FF4D00] focus:ring-2 focus:ring-[#FF4D00]/20 transition-colors duration-200 placeholder:text-gray-400 hover:border-gray-400"
      />
    </div>
  );
};

export default QuestionBox;
