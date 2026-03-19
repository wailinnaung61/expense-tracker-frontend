import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { getIconByKey } from "../../navItems";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/logo";

interface DesktopSidebarProps {
  isCollapsed: boolean;
  direction?: "ltr" | "rtl";
}

export function DesktopSidebar({
  isCollapsed,
  direction = "ltr",
}: DesktopSidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "fixed top-0 bottom-0 z-40 hidden md:flex h-screen flex-col border-r bg-background",
          isCollapsed ? "w-17.5" : "w-65",
          direction === "rtl" ? "right-0 border-l" : "left-0 border-r"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b py-4",
            !isCollapsed ? "px-5" : "px-3 justify-center"
          )}
        >
          {isCollapsed
            ? <Logo showText={false} />
            : <Logo textSize="lg" />}
        </div>

        {/* Scrollable Nav Area */}
        <div
          className={cn(
            "flex-1 overflow-y-auto h-[calc(100vh-64px)]",
            direction === "rtl" && "rtl-scroll"
          )}
        >
          <div className="py-4">
            {!isCollapsed && (
              <h2 className="rtl:text-right mb-2 px-6 text-xs font-semibold tracking-wide text-muted-foreground">                
              </h2>
            )}

            {/* Collapsed Version */}
            {isCollapsed ? (
              <div className="grid gap-1">
                {user?.menus.map((menu) => {
                  const Icon = getIconByKey(menu.key);
                  return (
                    <Tooltip key={menu.key} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          to={menu.path}
                          className={cn(
                            "flex items-center justify-center rounded-md p-2 text-sm font-medium tracking-wide hover:bg-accent hover:text-accent-foreground",
                            isActive(menu.path)
                              ? "text-sidebar-primary"
                              : "text-sidebar-foreground"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-6 w-6 transition-all opacity-80 hover:opacity-100",
                              isActive(menu.path) && "text-sidebar-primary"
                            )}
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side={direction === "rtl" ? "left" : "right"}
                      >
                        {menu.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-1 px-2">
                {user?.menus.map((menu) => {
                  const Icon = getIconByKey(menu.key);
                  return (
                    <Link
                      key={menu.key}
                      to={menu.path}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors",
                        isActive(menu.path)
                          ? "bg-accent text-sidebar-primary"
                          : "text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{menu.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
