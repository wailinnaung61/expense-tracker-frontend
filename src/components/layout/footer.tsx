import { Github, Mail, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-20 md:flex-row md:py-0 max-w-full sm:px-4 md:px-8">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            wai &copy; {currentYear}. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* External Links can use <a> instead of Link */}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </a>

          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Twitter className="h-4 w-4" />
            <span className="sr-only">Twitter</span>
          </a>

          <a
            href="mailto:wailinnaung12mm@gmail.com"
            className="text-muted-foreground hover:text-foreground"
          >
            <Mail className="h-4 w-4" />
            <span className="sr-only">Email</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
