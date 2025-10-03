import React from "react";
import PageLayout from "./PageLayout";
import {
  CheckCircleIcon,
  BookIcon,
  LockIcon,
  LightningIcon,
  InfoIcon,
} from "./icons";

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
  <div className="p-6 bg-gray-50 rounded-lg">
    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const IntroPage: React.FC<IntroPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: CheckCircleIcon,
      title: "Quick & Easy",
      description:
        "Answer just a few questions about your situation. The process takes less than 5 minutes.",
    },
    {
      icon: BookIcon,
      title: "Filler",
      description: "FILLER INFORMATION",
    },
    {
      icon: LockIcon,
      title: "Data Privacy",
      description: "FILLER INFORMATION",
    },
    {
      icon: LightningIcon,
      title: "Free to Use",
      description:
        "This tool is completely free. No registration or payment required to get started.",
    },
  ];

  return (
    <PageLayout>
      <div className="w-full max-w-3xl px-6 py-12 bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 tracking-wide">
            Landlord-Tenant Communication Tool
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light">
            Connect with your landlord and resolve housing concerns
          </p>
        </div>

        <div className="space-y-8 mb-12">
          <div className="bg-gradient-to-r from-primary-light to-transparent p-6 rounded-lg border-l-4 border-primary">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">
              What is this tool?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              This tool helps tenants communicate issues and concerns to their
              landlords in a clear and organized way. By answering a few simple
              questions, we'll help facilitate better communication and
              understanding between you and your landlord.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-bold mb-2 text-gray-800 flex items-center">
              {InfoIcon}
              What you'll need
            </h3>
            <p className="text-gray-700">
              Have information about your rental property and any specific
              issues or concerns ready. Include dates, documentation, and any
              relevant details about your housing situation.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onGetStarted}
            className="px-12 py-4 bg-primary text-white rounded-md font-bold text-xl cursor-pointer hover:bg-primary-hover transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Takes approximately 3-5 minutes to complete
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default IntroPage;
