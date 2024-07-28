import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Importing translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import tr from './locales/tr.json';
import sp from './locales/sp.json';
import de from './locales/de.json';
import it from './locales/it.json';

i18n
    .use(initReactI18next) // passes i18next instance to react-i18next
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
            tr: { translation: tr },
            sp: { translation: sp },
            de: { translation: de },
            it: { translation: it },
        },
        fallbackLng: "en",
        compatibilityJSON: 'v3',
        interpolation: {
            escapeValue: false
        }
    });


export default i18n;
