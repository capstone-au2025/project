import React from "react";
import PageLayout from "./PageLayout";
import { Link } from "wouter";
import { getConfig } from "../config/configLoader";

interface TOSPageProps {
  nextPage: string;
}

const TOSPage: React.FC<TOSPageProps> = ({ nextPage }) => {
  const config = getConfig();
  const terms: string = config.termsOfServicePage.terms;
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
            {terms.split("\n").map((s) => (
              <p className="text-left text-sm sm:text-md text-text-primary leading-relaxed px-2 sm:px-0">
                {s}
              </p>
            ))}
          </section>

          {/* Button */}
          <section>
            <div className="text-center">
              <Link
                href={nextPage}
                className="inline-block w-full sm:w-auto px-12 md:px-8 py-4 md:py-3 bg-primary text-white rounded-md font-bold text-lg sm:text-xl cursor-pointer hover:bg-primary-hover transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase"
              >
                {config.termsOfServicePage.continueButton}
              </Link>
            </div>
          </section>
        </main>
      </div>
    </PageLayout>
  );
};

export default TOSPage;
