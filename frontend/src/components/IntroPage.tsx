import React from "react";
import PageLayout from "./PageLayout";
import {
  CheckCircleIcon,
  BookIcon,
  LockIcon,
  LightningIcon,
  InfoIcon,
} from "./icons";
import { getConfig } from "../config/configLoader";

interface IntroPageProps {
  onGetStarted: () => void;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <div className="p-6 bg-white rounded-lg shadow-md border-2 border-sky hover:border-primary transition-colors duration-200">
    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-primary uppercase">{title}</h3>
    <p className="text-text-primary">{description}</p>
  </div>
);

const IntroPage: React.FC<IntroPageProps> = ({ onGetStarted }) => {
  const config = getConfig();
  const iconMap = [CheckCircleIcon, BookIcon, LockIcon, LightningIcon];

  const features = config.introPage.features.map((feature, index) => ({
    ...feature,
    icon: iconMap[index],
  }));

  return (
    <PageLayout>
      <div className="w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12 bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-sky">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-indigo tracking-wide uppercase leading-tight">
            {config.introPage.heading}
          </h1>
          <p className="text-left text-sm sm:text-md text-text-primary leading-relaxed px-2 sm:px-0">
            {config.introPage.description}
          </p>
        </header>

        <main className="flex flex-col gap-8 sm:gap-10">
          {/* Feature Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </section>

          {/* Button and Disclaimer */}
          <section className="flex flex-col gap-6 sm:gap-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg border-l-4 border-primary shadow-sm">
              <h3 className="text-base sm:text-lg font-bold mb-2 text-indigo flex items-center gap-2 uppercase">
                {InfoIcon}
                {config.introPage.infoBox.title}
              </h3>
              <p className="text-sm sm:text-base text-text-primary leading-relaxed">
                {config.introPage.infoBox.description}
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-primary text-white rounded-md font-bold text-lg sm:text-xl cursor-pointer hover:bg-primary-hover transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase"
              >
                {config.introPage.getStartedButton}
              </button>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-text-muted">
                {config.introPage.footerText}
              </p>
            </div>
          </section>
        </main>
      </div>
    </PageLayout>
  );
};

export default IntroPage;
