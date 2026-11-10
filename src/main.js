// Arranque de la aplicación. Elimina el mensaje estático de respaldo cuando los módulos cargan.
import es from './i18n/es.js';
import en from './i18n/en.js';
import { createI18n, pickInitialLanguage } from './ui/i18n.js';
import { createPreferences } from './ui/preferences.js';
import { installTooltips } from './ui/tooltips.js';
import { auditTooltips } from './ui/audit.js';

document.getElementById('fallback')?.remove();

const dictionaries = { es, en };
const preferences = createPreferences();
const i18n = createI18n({
  dictionaries,
  language: pickInitialLanguage({ stored: preferences.language, browserLanguages: navigator.languages ?? [navigator.language] }),
});
document.documentElement.lang = i18n.language;
i18n.onChange((lang) => { document.documentElement.lang = lang; i18n.translateTree(document.body); });
const tooltips = installTooltips({ doc: document, i18n });
i18n.translateTree(document.body);

// Ayudas para la verificación manual desde la consola del navegador.
window.mlLab = {
  i18n, preferences, tooltips,
  auditTooltips: (root = document) => auditTooltips({ root, dictionaries }),
};
