import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "from-blue-500 to-blue-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface UserProfileProps {
  mobile?: boolean;
  isCollapsed?: boolean;
}

export function UserProfile({
  mobile = false,
  isCollapsed = false,
}: UserProfileProps) {
  const { user, logout } = useAuth();
  const userName = user?.userName ?? "—";
  const initials = getInitials(userName);
  const gradientColor = getAvatarColor(userName);

  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-4xl hover:bg-accent transition-colors">
      {/* Avatar */}
      <div
        className={`h-10 w-10 shrink-0 rounded-4xl bg-linear-to-br ${gradientColor} flex items-center justify-center`}
      >
        <span className="text-white text-sm font-bold leading-none">{initials}</span>
      </div>

      {/* User Info */}
      {(!isCollapsed || mobile) && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{userName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email ?? ""}
          </p>
        </div>
      )}

      {/* Logout Button */}
      {(!isCollapsed || mobile) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-red-500"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Log out</span>
        </Button>
      )}
    </div>
  );
}
