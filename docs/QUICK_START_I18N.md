# Quick Start: Adding Language Switcher

## Option 1: Add to Horizontal Header (Recommended)

**File:** `src/components/layout/header/horizontal-header.tsx`

```tsx
import { Logo } from "@/components/logo";
import { ThemeConfig } from "@/components/theme/theme-config";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NavigationLinks } from "./navigation-links";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher"; // ← ADD THIS

interface HorizontalHeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export function HorizontalHeader({ setMobileOpen }: HorizontalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16.25 w-full border-b bg-card backdrop-blur supports-backdrop-filter:bg-card">
      <div className="container flex h-16 items-center justify-between px-3 sm:px-4 md:px-6 max-w-full">
        <div className="flex items-center gap-2">
          <Logo showText={false} className="sm:hidden" />
          <Logo className="hidden sm:flex" />
          <NavigationLinks />
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher /> {/* ← ADD THIS */}
          <ThemeToggle />
          <ThemeConfig />
          <ProfileMenu />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

## Test It Now!

Even though you haven't migrated any components yet, the language switcher will work immediately.

Try it:

1. Start your dev server: `npm run dev`
2. Open browser console
3. Test language switching:
   ```js
   localStorage.setItem("i18nextLng", "en");
   window.location.reload();
   ```

## When Ready to Translate (Version 2)

### Example: Translate Category Page

**Before:**

```tsx
// src/pages/categories/index.tsx
export default function Categories() {
  return (
    <div className="space-y-6">
      <CategoriesHeader onAddClick={handleAddClick} />
      {/* ... */}
    </div>
  );
}
```

**After:**

```tsx
import { useTranslation } from "@/hooks/useTranslation";

export default function Categories() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <CategoriesHeader onAddClick={handleAddClick} />
      {/* All hardcoded strings replaced with t() calls */}
    </div>
  );
}
```

Full migration guide: See `docs/LOCALIZATION.md`

## TypeScript Support ✨

You get **autocomplete** for all translation keys:

```tsx
const { t } = useTranslation();

// TypeScript will suggest available keys:
t("categories."); // Shows: title, addCategory, editCategory, etc.
t("common."); // Shows: save, cancel, delete, etc.
```

## Current Translation Keys Available

All defined in `src/i18n/locales/en/translation.json`:

- `common.*` - Buttons and common UI
- `nav.*` - Navigation items
- `auth.*` - Authentication
- `categories.*` - Categories page
- `pagination.*` - Pagination
- `validation.*` - Form validation
- `errors.*` - Error messages

**Add more as needed!**
