  import { useIsMobile } from "@/hooks/use-mobile";
  import { useThemeContext } from "@/components/theme/theme-provider";
  import { useEffect } from "react";
  import { DesktopSidebar } from "./desktop-sidebar";
  import { MobileSidebar } from "./mobile-sidebar";

  export interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
    isHorizontalLayout?: boolean;
    
  }

  export function Sidebar({
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    isHorizontalLayout = false,
  }: SidebarProps) {
    const { direction } = useThemeContext();
    const isMobile = useIsMobile();

    // Update collapsed state when switching between mobile and desktop
    useEffect(() => {
      if (isMobile && !isMobileOpen) {
        setIsCollapsed(true);
      }
    }, [isMobile, isMobileOpen, setIsCollapsed]);

    // Render mobile sidebar or horizontal layout
    if (isMobile || isHorizontalLayout) {
      return (
        <MobileSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          direction={direction}
        />
      );
    }

    // Render desktop sidebar
    return <DesktopSidebar isCollapsed={isCollapsed} direction={direction} />;
  }
