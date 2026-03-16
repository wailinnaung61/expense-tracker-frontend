# Localization Guide

This project uses **i18next** and **react-i18next** for internationalization (i18n).

## Current Setup

- ✅ i18next installed and configured
- ✅ English (en) as default language
- ✅ Automatic language detection
- ✅ localStorage caching
- ✅ Language switcher component ready

## File Structure

```
src/
├── i18n/
│   ├── config.ts                    # i18n configuration
│   └── locales/
│       ├── en/
│       │   └── translation.json    # English translations
│       ├── es/                      # Add Spanish (when ready)
│       │   └── translation.json
│       └── ja/                      # Add Japanese (when ready)
│           └── translation.json
├── hooks/
│   └── useTranslation.ts           # Translation hook
└── components/
    └── layout/
        └── language-switcher.tsx   # Language selector UI
```

## How to Use

### 1. In Components

```tsx
import { useTranslation } from "@/hooks/useTranslation";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("categories.title")}</h1>
      <button>{t("common.save")}</button>
    </div>
  );
}
```

### 2. With Variables (Interpolation)

```tsx
// translation.json
{
  "welcome": "Welcome, {{name}}!",
  "itemCount": "You have {{count}} items"
}

// Component
const { t } = useTranslation();
<p>{t('welcome', { name: 'John' })}</p>
<p>{t('itemCount', { count: 5 })}</p>
```

### 3. With Pluralization

```tsx
// translation.json
{
  "item_one": "{{count}} item",
  "item_other": "{{count}} items"
}

// Component
<p>{t('item', { count: 1 })}</p>  // "1 item"
<p>{t('item', { count: 5 })}</p>  // "5 items"
```

### 4. Namespace Organization

Current structure in `translation.json`:

- `common.*` - Shared UI labels (save, cancel, delete, etc.)
- `nav.*` - Navigation items
- `auth.*` - Authentication related
- `categories.*` - Category management
- `pagination.*` - Pagination controls
- `validation.*` - Form validation messages
- `errors.*` - Error messages

### 5. Add Language Switcher to Header

```tsx
// In your header component
import { LanguageSwitcher } from "@/components/layout/language-switcher";

<header>
  {/* other header content */}
  <LanguageSwitcher />
</header>;
```

## Adding a New Language

### Step 1: Create Translation File

Create `src/i18n/locales/{lang-code}/translation.json`:

```bash
# Example: Add Spanish
mkdir src/i18n/locales/es
# Copy English file as template
cp src/i18n/locales/en/translation.json src/i18n/locales/es/translation.json
# Translate all strings in the new file
```

### Step 2: Update i18n Config

In `src/i18n/config.ts`:

```typescript
import es from "./locales/es/translation.json";

const resources = {
  en: { translation: en },
  es: { translation: es }, // Add new language
};
```

### Step 3: Add to Language Switcher

In `src/components/layout/language-switcher.tsx`:

```typescript
const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" }, // Add new language
];
```

## Migration Plan (Version 2)

### Phase 1: Core UI (High Priority)

- [ ] Navigation menu
- [ ] Common buttons (save, cancel, delete, etc.)
- [ ] Authentication pages
- [ ] Error messages

### Phase 2: Features (Medium Priority)

- [ ] Categories page
- [ ] Transactions page
- [ ] Budget page
- [ ] Reports page

### Phase 3: Advanced (Low Priority)

- [ ] Settings page
- [ ] Charts/graphs labels
- [ ] Help documentation
- [ ] Email templates

### Migration Checklist for Each Component

1. Import hook: `import { useTranslation } from '@/hooks/useTranslation';`
2. Get translation function: `const { t } = useTranslation();`
3. Replace hardcoded strings: `"Save"` → `{t('common.save')}`
4. Add missing translation keys to `translation.json`
5. Test with all supported languages

## Best Practices

### ✅ DO:

- Keep keys organized by feature/page
- Use descriptive key names (`categories.deleteConfirmTitle`)
- Extract all user-facing strings
- Use interpolation for dynamic values
- Test with multiple languages

### ❌ DON'T:

- Hardcode user-facing text
- Use concatenation for sentences
- Assume text length (design for expansion)
- Translate technical terms (API keys, code)
- Mix languages in one key

## Useful Commands

```bash
# No special commands needed - hot reload works automatically

# To test specific language, set in browser console:
localStorage.setItem('i18nextLng', 'es');
window.location.reload();
```

## Example: Migrating a Component

**Before:**

```tsx
function CategoryHeader({ onAddClick }: Props) {
  return (
    <div>
      <h1>Categories</h1>
      <button onClick={onAddClick}>Add Category</button>
    </div>
  );
}
```

**After:**

```tsx
import { useTranslation } from "@/hooks/useTranslation";

function CategoryHeader({ onAddClick }: Props) {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("categories.title")}</h1>
      <button onClick={onAddClick}>{t("categories.addCategory")}</button>
    </div>
  );
}
```

## Testing Different Languages

1. Open browser DevTools console
2. Run: `localStorage.setItem('i18nextLng', 'es')`
3. Reload page
4. All text should appear in Spanish (if translations exist)

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Browser Language Detector](https://github.com/i18next/i18next-browser-languageDetector)

---

**Ready for Version 2!** 🌍
When you're ready to implement full localization, follow this guide to migrate components one by one.
