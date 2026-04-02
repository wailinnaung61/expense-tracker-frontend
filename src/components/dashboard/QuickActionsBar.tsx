import { Card } from "@/components/ui/card";
import { getIconByKey } from "@/components/navItems";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

// Skip "dashboard" from quick actions since we're already on it
const SKIP_KEYS = ["dashboard"];

export function QuickActionsBar() {
  const { user } = useAuth();

  const menus = (user?.menus ?? []).filter(
    (m) => !SKIP_KEYS.includes(m.key.toLowerCase())
  );

  if (menus.length === 0) return null;

  return (
    <Card className="rounded-2xl border overflow-hidden">
      <div className="flex items-center justify-between">
        {menus.map((menu) => {
          const Icon = getIconByKey(menu.key);
          return (
            <Link
              key={menu.key}
              to={menu.path}
              className="group flex-1 flex flex-col space-y-1.5 items-center bg-card hover:bg-muted/50 border-r last:border-r-0 px-2 py-3 transition-colors"
            >
              <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center tracking-wide">
                {menu.label}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
