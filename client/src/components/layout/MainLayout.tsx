import React from 'react';
import Footer from '@/components/layout/Footer';
import { useOrbit } from '@/context/orbit-context';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { showAppNavigation } = useOrbit();

  return (
    <div className="orbit-app flex flex-col min-h-screen">
      <main className={cn("flex-grow", showAppNavigation ? "pb-20" : "")}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
