// Arranque de la V2 (interfaz-v2). Elimina el aviso de respaldo cuando los módulos cargan.
import es from './i18n/es.js';
import en from './i18n/en.js';
import { createI18n, pickInitialLanguage } from '../ui/i18n.js';
import { createLibrary } from '../ui/library.js';
import { createV2Preferences } from './preferences.js';
import { installTooltips } from './components/tooltip.js';
import { createShell } from './shell/shell.js';
import * as audit from './audit.js';
import { createScenario, parseScenario } from './scenario.js';
import { createStore } from '../ui/store.js';

document.getElementById('fallback')?.remove();

/** Almacenamiento del navegador, o null si no está disponible (el acceso mismo puede fallar). */
function browserStorage() {
  try { return window.localStorage ?? null; } catch { return null; }
}
let idCounter = 0;
function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  idCounter += 1;
  return `brain-${Date.now().toString(36)}-${idCounter}`;
}

const dictionaries = { es, en };
const prefs = createV2Preferences(browserStorage);
const asked = new URLSearchParams(location.search).get('lang');
const i18n = createI18n({
  dictionaries,
  language: asked === 'es' || asked === 'en' ? asked : pickInitialLanguage({ stored: prefs.language, browserLanguages: navigator.languages ?? [navigator.language] }),
});
// El idioma se comparte con la V1 (design.md D6): al volver, la V1 abre en el mismo.
prefs.language = i18n.language;
i18n.onChange((lang) => { prefs.language = lang; });

// La misma biblioteca de cerebros que la V1 (spec *Cerebros compartidos entre versiones*).
const library = createLibrary({ storage: browserStorage(), clock: () => Date.now(), newId });
// El escenario compartido entre etapas (design.md D7), recordado con clave propia.
const scenario = createScenario({ initial: parseScenario(prefs.scenario), save: (json) => { prefs.scenario = json; } });

let shell = null;
const tooltips = installTooltips({ doc: document, i18n, hintsOn: () => prefs.hints });
// El paisaje de la escena (el botón de la vista de la V1), el mismo en todas las etapas y recordado.
const scenery = createStore({ scenery: prefs.scenery });
scenery.subscribe((state) => { prefs.scenery = state.scenery !== false; });
const stageModules = {
  problema: () => import('./stages/problema/index.js'),
  reglas: () => import('./stages/reglas/index.js'),
  evolucion: () => import('./stages/evolucion/index.js'),
  evaluar: () => import('./stages/evaluar/index.js'),
  entender: () => import('./stages/entender/index.js'),
};
shell = createShell({ root: document.getElementById('app'), i18n, prefs, stageModules, services: { library, tooltips, scenario, scenery } });

window.mlLab = { v2: {
  shell, i18n, prefs, library, tooltips, dictionaries, stageModules, scenario, scenery,
  auditTooltips: audit.auditTooltips, auditPrimary: audit.auditPrimary, auditTargets: audit.auditTargets,
  auditOverflow: audit.auditOverflow, auditSheets: audit.auditSheets, auditTexts: audit.auditTexts, auditAll: audit.auditAll,
} };
