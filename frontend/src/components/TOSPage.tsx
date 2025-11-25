import React from "react";
import PageLayout from "./PageLayout";
import { useLocation } from "wouter";
import { getConfig } from "../config/configLoader";
import Markdown from "react-markdown";

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

          <section
            id="terms"
            className="prose prose-sm sm:prose-base max-w-none px-2 sm:px-0"
          >
            <Markdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-text-primary">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 mt-6 text-text-primary">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 mt-4 text-text-primary">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-left text-sm sm:text-md text-text-primary leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-text-primary">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc ml-6 mb-4 text-sm sm:text-md text-text-primary">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-6 mb-4 text-sm sm:text-md text-text-primary">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1 leading-relaxed">{children}</li>
                ),
              }}
            >
              {terms}
            </Markdown>
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
