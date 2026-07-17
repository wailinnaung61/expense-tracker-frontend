
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="container flex flex-col items-center justify-center gap-4 py-6 md:h-20 md:py-0 max-w-full sm:px-4 md:px-8">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            waimya &copy; {currentYear}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
