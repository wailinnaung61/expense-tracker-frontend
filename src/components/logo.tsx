import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  size?: "small" | "default" | "large";
  textSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  showText?: boolean;
  firstPart?: string;
  secondPart?: string;
  href?: string;
  noLink?: boolean;
}

export function Logo({
  className = "",
  textSize = "3xl",
  showText = true,
  firstPart = "Expense",
  secondPart = "Tracker",
  href = "/",
  noLink = false,
}: LogoProps) {
  const content = (
    <>
      <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-blue-600 shadow-lg"></div>
      {showText && (
        <span className={`font-semibold font-sans text-${textSize} tracking-wider`}>
          <span className="text-accent-foreground">{firstPart}</span>
          <span className="text-muted-foreground">{secondPart}</span>
        </span>
      )}
    </>
  );

  if (noLink) {
    return <div className={`flex items-center gap-2 ${className}`}>{content}</div>;
  }

  return (
    <Link to={href} className={`flex items-center gap-2 ${className}`}>
      {content}
    </Link>
  );
}
