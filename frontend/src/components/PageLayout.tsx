import React from "react";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex items-start lg:items-center justify-center p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  );
};

export default PageLayout;
