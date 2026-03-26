import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en/translation.json';
import my from './locales/my/translation.json';
import ja from './locales/ja/translation.json';
// Add more languages here:
// import es from './locales/es/translation.json';

const resources = {
  en: {
    translation: en,
  },
  my: {
    translation: my,
  },
  ja: {
    translation: ja,
  },
  // Add more languages here:
  // es: { translation: es },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en', // Fallback language
    supportedLngs: ['en', 'my', 'ja'], // Supported languages
    debug: false, // Set to true for debugging
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Language detection options
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Cache user language
      caches: ['localStorage'],
      // localStorage key
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
