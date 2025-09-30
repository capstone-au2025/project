import React, { type ChangeEvent } from "react";

interface QuestionBoxProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="mb-6">
      <label className="block mb-2 font-bold text-base">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-32 p-4 border-2 border-black rounded text-base font-sans resize-y focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
};

export default QuestionBox;
