import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "small" | "default" | "large";
  textSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  showText?: boolean;
  firstPart?: string;
  secondPart?: string;
  href?: string;
  noLink?: boolean;
  animate?: boolean;
}

export function Logo({
  className = "",
  textSize = "xl",
  showText = true,
  firstPart = "Expense",
  secondPart = "Tracker",
  href = "/",
  noLink = false,
  animate = false,
}: LogoProps) {
  const content = (
    <>
      <div className="relative group">
        {animate && (
          <div className="absolute inset-0 bg-linear-to-br from-sky-400 to-cyan-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity animate-pulse"></div>
        )}
        <div className={`relative h-10 w-10 rounded-xl bg-linear-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/40 ${animate ? 'group-hover:shadow-sky-500/60 group-hover:scale-110 group-hover:rotate-12' : ''} transition-all`}>
          <Wallet className={`h-5 w-5 text-white ${animate ? 'animate-float' : ''}`} />
        </div>
      </div>
      {showText && (
        <span className={`font-bold text-${textSize} bg-linear-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent`}>
          {firstPart}{secondPart}
        </span>
      )}
    </>
  );

  if (noLink) {
    return <div className={`flex items-center gap-3 ${className}`}>{content}</div>;
  }

  return (
    <Link to={href} className={`flex items-center gap-3 ${className}`}>
      {content}
    </Link>
  );
}
