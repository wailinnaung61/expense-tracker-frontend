import { Link, useLocation } from "react-router-dom";
import { getIconByKey } from "../../navItems";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "./user-profile";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

interface MobileSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  direction?: "ltr" | "rtl";
}

export function MobileSidebar({
  isMobileOpen,
  setIsMobileOpen,
  direction = "ltr",
}: MobileSidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  if (!isMobileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-70 bg-background flex flex-col shadow-xl",
          direction === "rtl" ? "right-0" : "left-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center border-b px-4">
          <div className="flex items-center justify-between w-full">
            <Logo size="small" textSize="lg" />
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded-md hover:bg-accent"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Nav */}
        <div className="flex flex-col h-[calc(100vh-65px)]">
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-4">
              <h2 className="rtl:text-right mb-2 px-2 text-xs font-semibold text-muted-foreground">
                MAIN NAVIGATION
              </h2>
              <div className="grid gap-1">
                {user?.menus.map((menu) => {
                  const Icon = getIconByKey(menu.key);
                  return (
                    <Link
                      key={menu.key}
                      to={menu.path}
                      onClick={() => setIsMobileOpen(false)}
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
            </div>
          </div>

          <div className="mt-auto border-t p-3">
            <UserProfile mobile={true} isCollapsed={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
