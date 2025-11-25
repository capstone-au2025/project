import React from "react";
import { getConfig } from "../config/configLoader";

const LegalDisclaimer: React.FC<null> = () => {
  const legalDisclaimers = getConfig().app.legalDisclaimers;

  return (
    <div className="flex flex-col duration-150 gap-4 mx-4 sm:mx-6 mb-4 sm:mb-6 border-l-4 p-3 sm:p-4 rounded-r-lg shadow-sm bg-white border-primary">
      <h2> Legal Disclaimer </h2>
      {legalDisclaimers.map((disclaimer) => (
        <LegalPoint
          key={disclaimer.heading}
          heading={disclaimer.heading}
          description={disclaimer.description}
        />
      ))}
      <p>
        By using this tool, you acknowledge that you have read, understood, and
        agreed to this disclaimer.
      </p>
    </div>
  );
};

interface LegalPointProps {
  heading: string;
  description: string;
}

const LegalPoint: React.FC<LegalPointProps> = ({ heading, description }) => {
  return (
    <details>
      <summary className="font-bold cursor-pointer">{heading}</summary>
      <p className="px-4">{description}</p>
    </details>
  );
};

export default LegalDisclaimer;
