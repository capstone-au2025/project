import React from "react";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex lg:items-center sm:items-start justify-center lg:p-4 py-8 md:p-0">
      {children}
    </div>
  );
};

export default PageLayout;
