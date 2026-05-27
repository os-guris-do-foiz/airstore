import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DonationWidget from "../components/DonationWidget";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
      <Header />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <DonationWidget />
      <Footer />
    </div>
  );
};

export default MainLayout;
