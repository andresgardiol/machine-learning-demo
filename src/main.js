// Arranque de la aplicación. Elimina el mensaje estático de respaldo cuando los módulos cargan.
import es from './i18n/es.js';
import en from './i18n/en.js';
import { createI18n, pickInitialLanguage } from './ui/i18n.js';
import { createPreferences } from './ui/preferences.js';
import { installTooltips } from './ui/tooltips.js';
import { auditTooltips, auditHierarchy } from './ui/audit.js';
import { createApp } from './ui/app.js';
import * as driveTab from './tabs/drive/index.js';
import * as rulesTab from './tabs/rules/index.js';
import * as trainTab from './tabs/train/index.js';
import * as competeTab from './tabs/compete/index.js';
import * as inspectTab from './tabs/inspect/index.js';
import * as labTab from './tabs/lab/index.js';

// Pestañas del recorrido, en orden. Las que no tienen módulo se muestran como no disponibles (hoy, las seis lo tienen).
const TABS = [
  { id: 'drive', module: driveTab },
  { id: 'rules', module: rulesTab },
  { id: 'train', module: trainTab },
  { id: 'compete', module: competeTab },
  { id: 'inspect', module: inspectTab },
  { id: 'lab', module: labTab },
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
// Las ayudas gobiernan los tooltips (interruptor-de-ayudas D2): se consultan en cada decisión, así
// encenderlas o apagarlas vale en el momento. Al apagarlas, el tooltip a la vista se cierra.
let app = null;
const tooltips = installTooltips({ doc: document, i18n, hintsOn: () => (app ? app.store.get().hints !== false : true) });
app = createApp({ root: document.getElementById('app'), tabs: TABS, i18n, preferences });
app.store.subscribe((state, prev) => { if (prev.hints && !state.hints) tooltips.hide(); });

// Ayudas para la verificación manual desde la consola del navegador.
window.mlLab = {
  app, i18n, preferences, tooltips,
  auditTooltips: (root = document) => auditTooltips({ root, dictionaries }),
  auditHierarchy: (root = document) => auditHierarchy({ root }),
};
