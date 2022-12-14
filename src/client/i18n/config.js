import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  resources: {
    en: {
      translations: require('./locales/en/translations.json'),
    },
  },
  ns: ['translations'],
  defaultNS: 'translations',
  saveMissing: true,
  missingKeyHandler: (ng, ns, key, fallbackValue) => {
    console.warn(`Key '${key}' not found: ${ng}, ${ns}, ${fallbackValue}`);
  },
});

i18n.languages = ['en', 'es'];

export default i18n;
