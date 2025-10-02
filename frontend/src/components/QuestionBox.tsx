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
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block mb-2 md:mb-3 font-semibold text-base md:text-lg text-gray-800 leading-relaxed"
      >
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="w-full p-3 md:p-4 border-2 border-gray-300 rounded-md text-base leading-relaxed font-sans resize-y focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors duration-200 placeholder:text-gray-400 hover:border-gray-400"
      />
    </div>
  );
};

export default QuestionBox;
