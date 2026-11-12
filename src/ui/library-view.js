// Vista de la biblioteca de cerebros (design.md D8): la lista con el resumen de cada cerebro, su
// detalle desplegable y sus acciones (seguir entrenando, exportar, renombrar y eliminar), importar
// desde un archivo y el aviso cuando el navegador no permite guardar.
//
// Qué se muestra de cada cerebro sale de funciones puras (brainSummary, brainDetail) que se prueban
// en Node; todos los textos salen de los diccionarios. La vista no decide nada sobre el
// entrenamiento: "seguir entrenando" llama a `onContinue`, que resuelve la pestaña.
import { el } from './dom.js';
import { button, createTextSetter, inlineConfirm } from './controls.js';
import { exportFileName } from './library.js';
import { downloadText, readText } from './files.js';
import { FITNESS_UNITS } from '../core/evolution.js';

/** Mejor fitness con su unidad, listo para mostrar. */
function bestText(fitness) {
  if (!fitness || fitness.best === null || fitness.best === undefined) return { key: 'library.value.none' };
  const unit = FITNESS_UNITS[fitness.kind] ?? 'meters';
  const value = unit === 'meters' || unit === 'metersAhead' ? Math.floor(fitness.best) : Math.round(fitness.best * 10) / 10;
  return { key: `train.value.${unit}`, params: { value } };
}

/**
 * Resumen de un elemento de la biblioteca: nombre, origen, generaciones, sensores, forma de la red y
 * mejor fitness con su unidad. Un autoguardado trae además `nameKey`, la clave del nombre con que se
 * muestra en el idioma activo ("Entrenamiento en curso" o "Entrenamiento anterior", design.md D11);
 * el nombre grabado en el cerebro y el del archivo exportado no cambian.
 * @param {{origin:'saved'|'autosave', slot?:'current'|'previous', brain:object}} entry
 */
export function brainSummary(entry) {
  const { brain } = entry;
  const summary = {
    id: brain.id,
    name: brain.name,
    origin: entry.origin === 'autosave' ? 'autosave' : 'saved',
    generations: brain.training.generations,
    sensors: brain.sensors.count,
    shape: brain.network.sizes.join('-'),
    best: bestText(brain.training.fitness),
    editable: entry.origin === 'saved',
  };
  if (entry.origin === 'autosave') summary.nameKey = entry.slot === 'previous' ? 'library.autosave.previous' : 'library.autosave.current';
  return summary;
}

/** Detalle de un cerebro: función de fitness, evolución, velocidad máxima y escenarios con sus generaciones. */
export function brainDetail(brain) {
  const t = brain.training;
  return {
    fitness: t.fitness.kind,
    evolution: { ...t.evolution },
    maxSpeed: t.maxSpeed,
    seed: t.seed,
    activation: brain.network.activation,
    sensors: { ...brain.sensors },
    scenarios: t.scenarios.map((s) => ({ lanes: s.lanes, density: s.density, irregularity: s.irregularity, trafficMode: s.trafficMode, generations: s.generations })),
  };
}

/**
 * @param {object} spec
 * @param {HTMLElement} spec.container
 * @param {object} spec.library biblioteca (ui/library.js)
 * @param {object} spec.i18n
 * @param {(entry:object, confirm:object) => void} spec.onContinue seguir entrenando un cerebro
 * @param {() => string} [spec.baseName] base del nombre sugerido ("Cerebro")
 */
export function createLibraryView({ container, library, i18n, onContinue, doc = document }) {
  const setText = createTextSetter(i18n);
  const notice = el('p', { class: 'library-notice', attrs: { role: 'status' } });
  const message = el('p', { class: 'library-message', attrs: { role: 'alert' } });
  const fileInput = el('input', { class: 'library-file', help: 'library.import', attrs: { type: 'file', accept: '.json,application/json', tabindex: '-1', 'aria-hidden': 'true' } });
  const importButton = button('library.import', 'library.import', () => fileInput.click());
  const empty = el('p', { class: 'library-empty muted', i18n: 'library.empty' });
  const list = el('ul', { class: 'library-list' });
  container.append(el('div', { class: 'library-tools' }, importButton, fileInput), notice, message, empty, list);

  let renaming = null; // id del cerebro que se está renombrando
  const confirms = [];
  const openDetails = new Set(); // cerebros con el detalle desplegado: siguen así al redibujar
  let dirty = false; // hubo cambios mientras una confirmación esperaba respuesta

  function showMessage(key, params) {
    message.hidden = !key;
    if (key) setText(message, key, params); else message.textContent = '';
  }

  /** Mensaje en lenguaje llano para un código de error de importación. */
  const importError = (code) => ({
    notABrain: 'library.error.notABrain',
    unsupportedVersion: 'library.error.unsupportedVersion',
    shapeMismatch: 'library.error.damaged',
    notFinite: 'library.error.notFinite',
    sensorMismatch: 'library.error.sensorMismatch',
  }[code] ?? 'library.error.damaged');

  async function onFile() {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    let text;
    try { text = await readText(file); } catch { showMessage('library.error.unreadable'); return; }
    const r = library.importText(text, { baseName: i18n.t('library.defaultName') });
    if (!r.ok) showMessage(importError(r.code));
    else if (r.warning) showMessage(`library.status.${r.warning}`);
    else showMessage('library.imported', { name: r.brain.name });
  }
  fileInput.addEventListener('change', onFile);

  function detailList(brain) {
    const d = brainDetail(brain);
    const item = (labelKey, valueKey, params) => el('div', { class: 'library-detail-row' },
      el('dt', { i18n: labelKey }), el('dd', { i18n: valueKey, params }));
    const e = d.evolution;
    return el('dl', { class: 'library-detail' },
      item('library.detail.fitness', `train.fitness.${d.fitness}`),
      // Quién eligió a los padres; un cerebro que no lo registra se entrenó con selección automática.
      item('library.detail.selectionMode', e.selectionMode === 'manual' ? 'train.selectionMode.manual' : 'train.selectionMode.auto'),
      item('library.detail.population', 'train.value.cars', { value: e.population }),
      item('library.detail.elite', 'train.value.count', { value: e.elite }),
      item('library.detail.selection', 'drive.value.percent', { value: e.selection }),
      item('library.detail.mutation', 'library.value.mutation', { strength: e.mutationStrength, rate: e.mutationRate }),
      item('library.detail.crossover', e.crossover ? 'library.value.yes' : 'library.value.no'),
      item('library.detail.maxDuration', 'train.value.seconds', { value: e.maxDuration }),
      ...(e.slowRule === undefined ? [] : [item('library.detail.slowRule', e.slowRule ? 'library.value.yes' : 'library.value.no')]),
      item('library.detail.maxSpeed', 'drive.value.speed', { value: d.maxSpeed, kmh: Math.round(d.maxSpeed * 3.6) }),
      item('library.detail.activation', `train.activation.${d.activation}`),
      item('library.detail.sensors', 'library.value.sensors', { count: d.sensors.count, range: d.sensors.range, spread: d.sensors.spread }),
      el('div', { class: 'library-detail-row library-scenarios' },
        el('dt', { i18n: 'library.detail.scenarios' }),
        el('dd', {}, el('ul', {}, d.scenarios.map((s) => el('li', {
          i18n: `library.value.scenario.${s.trafficMode}`,
          params: { lanes: s.lanes, density: s.density, irregularity: s.irregularity, value: s.generations },
        }))))));
  }

  function renderItem(entry) {
    const s = brainSummary(entry);
    const confirm = inlineConfirm({ i18n });
    confirms.push(confirm);
    // Los autoguardados se nombran en el idioma activo; los guardados, con el nombre que les dio la persona.
    const nameNode = renaming === s.id
      ? renameInput(s)
      : s.nameKey
        ? el('span', { class: 'library-name', i18n: s.nameKey })
        : el('span', { class: 'library-name', text: s.name });
    const origin = el('span', { class: `library-origin origin-${entry.origin}`, i18n: `library.origin.${s.origin}` });
    const meta = el('p', { class: 'library-meta' },
      el('span', { i18n: 'library.value.generations', params: { value: s.generations } }), ' · ',
      el('span', { i18n: 'drive.value.rays', params: { value: s.sensors } }), ' · ',
      el('span', { text: s.shape }), ' · ',
      el('span', { i18n: s.best.key, params: s.best.params }));

    const continueButton = button('library.continue', 'library.continue', () => onContinue(entry, confirm), 'tool small');
    const exportButton = button('library.export', 'library.export', () => {
      downloadText({ fileName: exportFileName(s.name), text: library.exportText(s.id), doc });
    }, 'tool small');
    const actions = [continueButton, exportButton];
    if (s.editable) {
      actions.push(button('library.rename', 'library.rename', () => { renaming = s.id; render(); }, 'tool small'));
      actions.push(button('library.delete', 'library.delete', () => confirm.open({
        message: 'library.confirm.delete', params: { name: s.name }, confirmKey: 'library.delete',
        onConfirm: () => { library.remove(s.id); showMessage(null); },
        onCancel: () => { if (dirty) render(); },
      }), 'tool small'));
    } else {
      // Los autoguardados no se renombran ni se eliminan: se conservan guardándolos con nombre.
      actions.push(el('button', { class: 'tool small', i18n: 'library.rename', help: 'library.autosaveLocked', attrs: { type: 'button', disabled: true } }));
    }

    const details = el('details', { class: 'library-more', attrs: { open: openDetails.has(s.id) } },
      el('summary', { i18n: 'library.more', help: 'library.more' }), detailList(entry.brain));
    details.addEventListener('toggle', () => { if (details.open) openDetails.add(s.id); else openDetails.delete(s.id); });

    return el('li', { class: 'library-item', dataset: { id: s.id, origin: entry.origin } },
      el('div', { class: 'library-head' }, nameNode, origin),
      meta, el('div', { class: 'library-actions' }, actions), confirm.node, details);
  }

  function renameInput(s) {
    const input = el('input', {
      class: 'library-rename', help: 'library.rename',
      attrs: { type: 'text', value: s.name, maxlength: 60 },
      i18nAttr: 'aria-label:library.rename.label',
      on: {
        keydown: (e) => {
          if (e.key === 'Enter') { e.preventDefault(); finishRename(s.id, input.value); }
          else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); renaming = null; render(); }
        },
        blur: () => { if (renaming === s.id) finishRename(s.id, input.value); },
      },
    });
    queueMicrotask(() => { input.focus(); input.select(); });
    return input;
  }

  function finishRename(id, value) {
    renaming = null;
    const r = library.rename(id, value);
    if (!r.ok && r.code === 'emptyName') showMessage('library.error.emptyName');
    render();
  }

  /** Redibuja la lista, salvo mientras se renombra o una confirmación espera respuesta. */
  function refresh() {
    if (renaming !== null || confirms.some((c) => c.isOpen)) { dirty = true; return; }
    render();
  }

  function render() {
    dirty = false;
    for (const c of confirms.splice(0)) c.dispose();
    const entries = library.list();
    empty.hidden = entries.length > 0;
    list.replaceChildren(...entries.map(renderItem));
    const problem = library.status.problem;
    notice.hidden = !problem;
    if (problem) setText(notice, `library.status.${problem}`);
    i18n.translateTree(container);
  }

  showMessage(null);
  const off = library.subscribe(refresh);
  const offLanguage = i18n.onChange(() => render());
  render();

  return {
    render,
    refresh,
    showMessage,
    dispose() {
      off();
      offLanguage();
      fileInput.removeEventListener('change', onFile);
      for (const c of confirms.splice(0)) c.dispose();
      container.replaceChildren();
    },
  };
}
