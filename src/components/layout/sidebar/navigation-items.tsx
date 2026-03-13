import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
}

interface NavigationItemsProps {
  onClick?: () => void;
  isCollapsed: boolean;
  mobile: boolean;
  direction?: "ltr" | "rtl";
  navItems: NavItem[];
  isActive: (path: string) => boolean;
}

export function NavigationItems({
  onClick,
  isCollapsed,
  mobile,
  direction = "ltr",
  navItems,
}: NavigationItemsProps) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();

  // detect active path
  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <nav className="grid gap-1.5">
      {navItems.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus[item.name] || false;

        if (hasChildren) {
          return (
            <div key={item.name}>
              <button
                onClick={() => toggleMenu(item.name)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium tracking-wide transition-all text-sidebar-foreground",
                  "hover:bg-accent hover:text-accent-foreground",
                  direction === "rtl" ? "flex-row-reverse" : "flex-row",
                  isCollapsed && !mobile && "justify-center px-2 stroke-[1.5]",
                  mobile && "text-base py-3"
                )}
              >
                <item.icon className="h-5 w-5 ms-3 rtl:me-3 rtl:ms-0 size-5 shrink-0 opacity-80 group-hover:opacity-100" />
                {(!isCollapsed || mobile) && (
                  <>
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen ? "rotate-0" : "-rotate-90 rtl:rotate-90"
                      )}
                    />
                  </>
                )}
              </button>

              {isOpen && (
                <div className="ms-6 rtl:me-6 mt-1 space-y-1">
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={cn(
                        "flex rtl:flex-row-reverse items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground",
                        isActive(child.href)
                          ? "text-primary"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={onClick}
                    >
                      {child.icon && <child.icon className="h-4 w-4" />}
                      {(!isCollapsed || mobile) && <span>{child.name}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }

        // Regular menu item
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground tracking-wide transition-all duration-200 ease-in-out",
              active ? "text-primary" : "hover:bg-accent",
              direction === "rtl" ? "flex-row-reverse" : "flex-row",
              isCollapsed && !mobile && "justify-center px-2",
              mobile && "text-base py-3"
            )}
            onClick={onClick}
          >
            {active && !isCollapsed && !mobile && (
              <span
                className={cn(
                  "absolute top-0 bottom-0 w-1 bg-primary",
                  direction === "rtl"
                    ? "right-0 rounded-l-full"
                    : "left-0 rounded-r-full"
                )}
              />
            )}
            <item.icon
              className={cn(
                "h-5 w-5 size-5 shrink-0 opacity-80 group-hover:opacity-100",
                direction === "rtl" ? "me-3" : "ms-3",
                active ? "text-primary" : "",
                !active && "group-hover:text-accent-foreground"
              )}
            />
            {(!isCollapsed || mobile) && (
              <span
                className={cn(
                  "truncate",
                  active ? "text-primary font-semibold" : "",
                  !active && "group-hover:text-accent-foreground"
                )}
              >
                {item.name}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
