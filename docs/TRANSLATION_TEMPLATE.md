# Translation Template

Copy this template when adding a new language.

## Steps to Add a New Language

### 1. Create language folder and file

```bash
# Example for Spanish
mkdir src/i18n/locales/es
cp src/i18n/locales/TEMPLATE.json src/i18n/locales/es/translation.json
```

### 2. Translate all empty strings

Open the new `translation.json` and fill in all translations:

```json
{
  "common": {
    "loading": "Cargando...",
    "save": "Guardar",
    "cancel": "Cancelar"
    // ... etc
  }
}
```

### 3. Register in config

Edit `src/i18n/config.ts`:

```typescript
import es from "./locales/es/translation.json";

const resources = {
  en: { translation: en },
  es: { translation: es }, // Add this
};
```

### 4. Add to language switcher

Edit `src/components/layout/language-switcher.tsx`:

```typescript
const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" }, // Add this
];
```

### 5. Test

```bash
npm run dev
# In browser console:
localStorage.setItem('i18nextLng', 'es');
window.location.reload();
```

## Common Language Codes

| Language              | Code  | Flag |
| --------------------- | ----- | ---- |
| English               | en    | 🇺🇸   |
| Spanish               | es    | 🇪🇸   |
| Japanese              | ja    | 🇯🇵   |
| Chinese (Simplified)  | zh    | 🇨🇳   |
| Chinese (Traditional) | zh-TW | 🇹🇼   |
| French                | fr    | 🇫🇷   |
| German                | de    | 🇩🇪   |
| Italian               | it    | 🇮🇹   |
| Portuguese (Brazil)   | pt-BR | 🇧🇷   |
| Portuguese (Portugal) | pt    | 🇵🇹   |
| Korean                | ko    | 🇰🇷   |
| Arabic                | ar    | 🇸🇦   |
| Russian               | ru    | 🇷🇺   |
| Hindi                 | hi    | 🇮🇳   |
| Thai                  | th    | 🇹🇭   |
| Vietnamese            | vi    | 🇻🇳   |
| Indonesian            | id    | 🇮🇩   |
| Dutch                 | nl    | 🇳🇱   |
| Polish                | pl    | 🇵🇱   |
| Turkish               | tr    | 🇹🇷   |

## Translation Tips

### Preserve Interpolation

Keep `{{variable}}` placeholders intact:

```json
{
  "welcome": "Welcome, {{name}}!" // ✅
  "welcome": "Bienvenue {{name}}!" // ✅ French
  "welcome": "Bienvenue Pierre!"   // ❌ Lost variable
}
```

### Handle Plurals

Use `_one`, `_other` suffixes for countable items:

```json
{
  "item_one": "{{count}} item",
  "item_other": "{{count}} items"
}
```

### Context Matters

Some languages need different translations based on context:

```json
{
  "save_button": "Save", // Button text
  "save_progress": "Saving..." // Progress indicator
}
```

### Right-to-Left (RTL) Languages

For Arabic, Hebrew, etc., you may need additional CSS:

```css
[dir="rtl"] {
  text-align: right;
  direction: rtl;
}
```

## Translation Services

Consider using professional services for important languages:

- **Google Translate API** - Quick, automated
- **DeepL** - Higher quality, supports fewer languages
- **Professional translators** - Best for user-facing content
- **Community contributions** - Open source projects

## Quality Checklist

- [ ] All keys translated (no empty strings)
- [ ] Variables preserved (`{{name}}`, `{{count}}`)
- [ ] Plurals handled correctly
- [ ] Cultural appropriateness checked
- [ ] Number/date formats considered
- [ ] Tested in UI (text fits in buttons/labels)
- [ ] Special characters escaped properly
- [ ] Reviewed by native speaker

---

**Ready to go global!** 🌍
