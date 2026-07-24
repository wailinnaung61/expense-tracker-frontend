import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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

  return (
    <div className="flex items-center gap-3 rounded-4xl px-3 py-3 transition-colors hover:bg-accent">
      <UserAvatar
        name={userName}
        src={user?.avatarUrl}
        className="h-10 w-10 shrink-0"
      />

      {(!isCollapsed || mobile) && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email ?? ""}
          </p>
        </div>
      )}

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
