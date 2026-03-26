import { ThemeConfig } from "@/components/theme/theme-config";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeft } from "lucide-react";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "../language-switcher";

interface VerticalHeaderProps {
  toggleSidebar: () => void;
  setMobileOpen: (open: boolean) => void;
}

export function VerticalHeader({
  toggleSidebar,
  setMobileOpen,
}: VerticalHeaderProps) {

  return (
    <header className="sticky top-0 z-40 h-16.25 w-full border-b bg-card backdrop-blur supports-backdrop-filter:bg-card">
      <div className="container flex h-16 items-center justify-between  sm:px-4 md:px-12 max-w-full">
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2 hidden md:flex hover:cursor-pointer -ms-8"
          >
            <PanelLeft className="h-5 w-5" strokeWidth={2} />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <ThemeConfig />

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
