import React from "react";
import PageLayout from "./PageLayout";
import { useLocation } from "wouter";
import { getConfig } from "../config/configLoader";

interface TOSPageProps {
  nextPage: string;
  backPage: string;
  onAccept: () => void;
}

const TOSPage: React.FC<TOSPageProps> = ({ nextPage, backPage, onAccept }) => {
  const config = getConfig();
  const [, setLocation] = useLocation();
  const terms: string = config.termsOfServicePage.terms;

  const handleAccept = () => {
    onAccept();
    setLocation(nextPage);
  };
  return (
    <PageLayout>
      <div className="w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12 bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-sky">
        <main>
          <header className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-indigo tracking-wide uppercase leading-tight">
              {config.termsOfServicePage.heading}
            </h1>
          </header>

          <section id="terms" className="flex flex-col gap-2 sm:gap-2">
            {/* Surround the terms in p tags */}
            {terms.split("\n").map((s, index) => (
              <p
                key={index}
                className="text-left text-sm sm:text-md text-text-primary leading-relaxed px-2 sm:px-0"
              >
                {s}
              </p>
            ))}
          </section>

          {/* Button */}
          <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href={backPage}
              type="button"
              className="px-6 sm:px-8 py-3 bg-white border-2 border-border rounded-md font-semibold hover:bg-white hover:border-border-hover transition-all duration-200 uppercase text-sm sm:text-base leading-1 grid items-center"
            >
              {getConfig().common.backButton}
            </a>
            <button
              onClick={handleAccept}
              className="inline-block text-center flex-1 py-3 sm:py-4 px-6 sm:px-8 bg-primary text-white rounded-md font-bold text-base sm:text-lg hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase cursor-pointer"
            >
              {config.termsOfServicePage.continueButton}
            </button>
          </section>
        </main>
      </div>
    </PageLayout>
  );
};

export default TOSPage;
