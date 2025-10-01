import React from "react";

interface IntroPageProps {
  onGetStarted: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onGetStarted }) => {
  return (
    <div className="w-full max-w-3xl px-6 py-12 bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 tracking-wide">
          Landlord-Tenant Communication Tool
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 font-light">
          Connect with your landlord and resolve housing concerns
        </p>
      </div>

      <div className="space-y-8 mb-12">
        <div className="bg-gradient-to-r from-[#FF4D00]/10 to-transparent p-6 rounded-lg border-l-4 border-[#FF4D00]">
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
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-[#FF4D00] rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Quick & Easy
            </h3>
            <p className="text-gray-600">
              Answer just a few questions about your situation. The process
              takes less than 5 minutes.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-[#FF4D00] rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Get Guidance
            </h3>
            <p className="text-gray-600">
              Receive personalized information and next steps based on your
              specific housing concerns.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-[#FF4D00] rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Confidential
            </h3>
            <p className="text-gray-600">
              Your information is private and secure. We're here to help you
              understand your options.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-[#FF4D00] rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Free to Use
            </h3>
            <p className="text-gray-600">
              This tool is completely free. No registration or payment required
              to get started.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold mb-2 text-gray-800 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            What you'll need
          </h3>
          <p className="text-gray-700">
            Have information about your rental property and any specific issues
            or concerns ready. Include dates, documentation, and any relevant
            details about your housing situation.
          </p>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onGetStarted}
          className="px-12 py-4 bg-[#FF4D00] text-white rounded-md font-bold text-xl cursor-pointer hover:bg-[#E64400] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Get Started
        </button>
        <p className="mt-4 text-sm text-gray-500">
          Takes approximately 3-5 minutes to complete
        </p>
      </div>
    </div>
  );
};

export default IntroPage;
