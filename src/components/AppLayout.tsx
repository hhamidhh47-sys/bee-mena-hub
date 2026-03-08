import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import beeLogo from "@/assets/bee-logo.png";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

const AppLayout = ({ children, title, showHeader = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background hexagon-pattern pb-24">
      {showHeader && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <img src={beeLogo} alt="نحّالي" className="w-10 h-10" />
              <h1 className="text-xl font-bold text-foreground">
                {title || "نحّالي"}
              </h1>
            </div>
          </div>
        </header>
      )}
      <main className="container px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
