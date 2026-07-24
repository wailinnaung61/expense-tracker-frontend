import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name.slice(0, 2) || "U").toUpperCase();
}

interface UserAvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
}

/** Shared avatar for header, sidebar, and profile. */
export function UserAvatar({
  name,
  src,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {src ? (
        <AvatarImage src={src} alt={name} key={src} className="object-cover" />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-linear-to-br from-blue-500 to-blue-600 text-sm font-bold text-white",
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
