import { useThemeContext } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "./footer";
import { HorizontalHeader } from "./header/horizontal-header";
import { VerticalHeader } from "./header/vertical-header";
import { Sidebar } from "./sidebar";
import { ChatBot } from "@/components/chatbot/ChatBot";
import { CalculatorFab } from "@/components/calculator/calculator-fab";

export function Layout() {
  const { layout, direction } = useThemeContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isVertical = layout === "vertical";
  const isHorizontal = layout === "horizontal";

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const containerClass = useMemo(() => {
    return cn(
      "min-h-screen bg-background",
      direction === "rtl" && "rtl",
      isVertical && "md:pl-[70px]",
      isVertical && !isCollapsed && "md:pl-[260px]",
      direction === "rtl" && isVertical && "md:pr-[70px] md:pl-0",
      direction === "rtl" &&
        isVertical &&
        !isCollapsed &&
        "md:pr-[260px] md:pl-0"
    );
  }, [direction, isVertical, isCollapsed]);

  return (
    <div className={containerClass}>
      {(isVertical || isMobileOpen) && (
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isHorizontalLayout={isHorizontal}
        />
      )}

      <div className="flex min-h-screen flex-col">
        {isVertical ? (
          <VerticalHeader
            toggleSidebar={toggleSidebar}
            setMobileOpen={setIsMobileOpen}
          />
        ) : (
          <HorizontalHeader setMobileOpen={setIsMobileOpen} />
        )}
        <main className="flex-1 p-4 px-12 sm:px-6 lg:px-8"><Outlet /></main>
        <Footer />
      </div>

      {/* Calculator */}
      <CalculatorFab />
      {/* AI Chat Bot */}
      <ChatBot />
    </div>
  );
}

export default Layout;
