import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { getIconByKey } from "../../navItems";

export function NavigationLinks() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string): boolean => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="hidden md:flex md:items-center md:gap-5 md:text-sm md:font-medium md:ms-6 overflow-x-auto">
      {user?.menus.map((item) => {
        const Icon = getIconByKey(item.key);
        return (
          <Link
            key={item.key}
            to={item.path}
            className={cn(
              "flex items-center gap-1 transition-colors hover:text-primary whitespace-nowrap",
              isActive(item.path)
                ? "text-primary font-semibold"
                : "text-foreground/60"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
