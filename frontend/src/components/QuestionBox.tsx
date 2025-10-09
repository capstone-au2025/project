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
    <div className="mb-0">
      <label
        htmlFor={name}
        className="block mb-2 sm:mb-3 font-semibold text-sm sm:text-base md:text-lg text-text-primary leading-relaxed"
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
        className="w-full p-3 sm:p-4 border-2 border-border rounded-md text-sm sm:text-base leading-relaxed font-['Merriweather'] resize-y focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors duration-200 placeholder:text-text-muted hover:border-border-hover"
      />
    </div>
  );
};

export default QuestionBox;
