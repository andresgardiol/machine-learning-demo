// Arranque de la aplicación. Elimina el mensaje estático de respaldo cuando los módulos cargan.
import es from './i18n/es.js';
import en from './i18n/en.js';
import { createI18n, pickInitialLanguage } from './ui/i18n.js';
import { createPreferences } from './ui/preferences.js';
import { installTooltips } from './ui/tooltips.js';
import { auditTooltips } from './ui/audit.js';
import { createApp } from './ui/app.js';
import * as driveTab from './tabs/drive/index.js';
import * as trainTab from './tabs/train/index.js';

// Pestañas del recorrido, en orden. Las que no tienen módulo se muestran como no disponibles.
const TABS = [
  { id: 'drive', module: driveTab },
  { id: 'rules' },
  { id: 'train', module: trainTab },
  { id: 'compete' },
  { id: 'inspect' },
  { id: 'lab' },
];

document.getElementById('fallback')?.remove();

const dictionaries = { es, en };
const preferences = createPreferences();
const i18n = createI18n({
  dictionaries,
  language: pickInitialLanguage({ stored: preferences.language, browserLanguages: navigator.languages ?? [navigator.language] }),
});
document.documentElement.lang = i18n.language;
document.title = i18n.t('app.title');
i18n.onChange((lang) => {
  document.documentElement.lang = lang;
  document.title = i18n.t('app.title');
  i18n.translateTree(document.body);
});
const tooltips = installTooltips({ doc: document, i18n });
const app = createApp({ root: document.getElementById('app'), tabs: TABS, i18n, preferences });

// Ayudas para la verificación manual desde la consola del navegador.
window.mlLab = {
  app, i18n, preferences, tooltips,
  auditTooltips: (root = document) => auditTooltips({ root, dictionaries }),
};
