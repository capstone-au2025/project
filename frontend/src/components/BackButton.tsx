import React from "react";
import { getConfig } from "../config/configLoader";
import { Link } from "wouter";

interface BackButtonProps {
  backPage: string;
}

const QuestionBox: React.FC<BackButtonProps> = ({ backPage }) => {
  return (
    <Link
      href={backPage}
      type="button"
      className="px-6 sm:px-8 py-3 bg-white border-2 border-border rounded-md font-semibold hover:bg-white hover:border-border-hover transition-all duration-200 uppercase text-sm sm:text-base grid items-center text-center"
    >
      {getConfig().common.backButton}
    </Link>
  );
};

export default QuestionBox;
