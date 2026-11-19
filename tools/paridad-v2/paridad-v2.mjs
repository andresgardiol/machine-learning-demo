#!/usr/bin/env node
// Paridad de controles de la V1 en la V2 real (interfaz-v2, tarea 16.1). Abre la V2 en Chrome sin ventana, recorre
// cada etapa, cada hoja del cuaderno y, en Por gradiente, los tres experimentos, y junta las claves de los controles
// a la vista o en la página (data-v1, la clave de la V1 que cubre cada control, y data-help, la del tooltip, que la
// V2 conserva cuando reutiliza una pieza de la V1). Las compara con el inventario medido en la V1
// (inventario-v1.json: las claves data-help de cada pestaña). Sale con código 1 si falta alguna sin motivo.
//
// Uso, desde la raíz del repositorio: node tools/paridad-v2/paridad-v2.mjs
// Necesita Google Chrome (o la ruta en la variable CHROME); sin dependencias.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..', '..');
const inv = JSON.parse(readFileSync(join(aqui, 'inventario-v1.json'), 'utf8')).pantallas;
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const puerto = 8768;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Pestaña de la V1 → etapa de la V2 ("shell": la barra de arriba y el riel). */
const ETAPA = { drive: 'problema', rules: 'reglas', train: 'evolucion', compete: 'evaluar', inspect: 'entender', lab: 'gradiente', shell: null };
/** Claves de la V1 que la V2 resuelve de otro modo, con su motivo (y la fila o la decisión que lo respalda). */
const EXCLUIDAS = {
  'role.in': 'rótulo de rol, no un control: la V2 lo muestra como texto ("Entra · lo que percibe")',
  'role.out': 'rótulo de rol, no un control', 'role.decide': 'rótulo de rol, no un control',
  'credits.close': 'dentro del diálogo de créditos', 'credits.link': 'dentro del diálogo de créditos',
  'error.restart': 'la falla de una etapa tiene su propio "Reintentar" (error.retry)',
  'panel.resize': 'propuesto quitar en paridad.md (*Panel ajustable*): lo reemplaza plegar el cuaderno',
  'stage.resize': 'propuesto quitar en paridad.md (*Panel ajustable*): lo reemplaza plegar el cuaderno',
  'flicker': 'aviso del guardián de destellos: aparece solo si hace falta',
  'guide': 'interruptor de la guía del armazón (en la V2, "Guía" de la barra de arriba)',
};

const servidor = spawn(process.execPath, [join(raiz, 'tools', 'serve.mjs')], { env: { ...process.env, PORT: String(puerto) }, stdio: 'ignore' });
for (let i = 0; ; i++) { try { await fetch(`http://localhost:${puerto}/`); break; } catch { if (i > 50) throw new Error('El servidor no arrancó'); await sleep(100); } }

const perfil = mkdtempSync(join(tmpdir(), 'paridad-v2-'));
const puertoDev = 9300 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${puertoDev}`, `--user-data-dir=${perfil}`, '--window-size=1440,900', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let lista;
for (let i = 0; ; i++) {
  try { lista = await (await fetch(`http://localhost:${puertoDev}/json`)).json(); if (lista.some((t) => t.type === 'page')) break; } catch {}
  if (i > 100) throw new Error('Chrome no arrancó');
  await sleep(100);
}
const ws = new WebSocket(lista.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0;
const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const js = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.result?.value;
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

const CLAVES = (sel) => `(() => { const s = new Set(); for (const e of document.querySelectorAll('${sel} [data-v1], ${sel} [data-help]')) {
  for (const k of (e.dataset.v1 || '').split(/\\s+/)) if (k) s.add(k); if (e.dataset.help) s.add(e.dataset.help); } return [...s]; })()`;

async function clavesDe(etapa) {
  await send('Page.navigate', { url: `http://localhost:${puerto}/v2/?lang=es#${etapa ?? 'problema'}` });
  await sleep(2500);
  if (!etapa) return js(CLAVES('.v2-bar') .replace("'.v2-bar [data-v1], .v2-bar [data-help]'", "'.v2-bar [data-v1], .v2-bar [data-help], .v2-rail [data-v1], .v2-rail [data-help], dialog [data-help]'"));
  const sel = `[data-stage=${etapa}]`;
  const todas = new Set();
  const juntar = async () => { for (const k of await js(CLAVES(sel))) todas.add(k); };
  const hojas = await js(`[...document.querySelectorAll('${sel} .v2-sheet-tab')].map((b) => b.dataset.sheet)`);
  const pasadas = etapa === 'gradiente' ? ['gates', 'points', 'driving'] : [null];
  for (const kind of pasadas) {
    if (kind) { await js(`mlLab.v2.shell.stage('gradiente').api.setKind('${kind}'); true`); await sleep(300); }
    for (const h of hojas) { await js(`mlLab.v2.shell.stage('${etapa}').notebook.select('${h}'); true`); await sleep(150); await juntar(); }
    // Lo que aparece al elegir algo en la red (Entender y Por gradiente) y en la vista de datos.
    if (etapa === 'entender' || etapa === 'gradiente') {
      await js(`(() => { const a = mlLab.v2.shell.stage('${etapa}').api; a.pause?.(); a.select({ layer: 1, neuron: 0 }); a.draw(); return true; })()`); await sleep(200); await juntar();
      await js(`(() => { const a = mlLab.v2.shell.stage('${etapa}').api; a.select({ layer: 1, neuron: 0, input: 0 }); a.draw(); return true; })()`); await sleep(200); await juntar();
      await js(`(() => { const a = mlLab.v2.shell.stage('${etapa}').api; a.select(null); a.draw(); return true; })()`);
    }
  }
  return [...todas];
}

// Las claves del armazón: la barra de arriba y el riel (la barra y el riel no cambian con la etapa).
const SHELL = `(() => { const s = new Set(); for (const e of document.querySelectorAll('.v2-bar [data-v1], .v2-bar [data-help], .v2-rail [data-v1], .v2-rail [data-help], dialog [data-help]')) {
  for (const k of (e.dataset.v1 || '').split(/\\s+/)) if (k) s.add(k); if (e.dataset.help) s.add(e.dataset.help); } return [...s]; })()`;

let faltan = 0;
let total = 0;
for (const [tab, claves] of Object.entries(inv)) {
  const etapa = ETAPA[tab];
  let hay;
  if (etapa) hay = new Set(await clavesDe(etapa));
  else { await send('Page.navigate', { url: `http://localhost:${puerto}/v2/?lang=es#problema` }); await sleep(2500); hay = new Set(await js(SHELL)); }
  const falt = [];
  const ex = [];
  for (const k of claves) {
    if (EXCLUIDAS[k]) { ex.push(k); continue; }
    total++;
    if (!hay.has(k)) { falt.push(k); faltan++; }
  }
  console.log(`\n## ${tab} → ${etapa ?? 'armazón (barra y riel)'}: ${claves.length - ex.length - falt.length} de ${claves.length - ex.length} controles de la V1 en la V2`);
  if (falt.length) console.log(`  Faltan: ${falt.join(', ')}`);
  if (ex.length) console.log(`  Excluidos con motivo: ${ex.map((k) => `${k} (${EXCLUIDAS[k]})`).join('; ')}`);
}
console.log(`\nTotal: ${total - faltan} de ${total} controles de la V1 en la V2 real; ${faltan} faltantes sin motivo.`);
try { ws.close(); } catch {}
chrome.kill('SIGKILL');
servidor.kill();
await sleep(300);
try { rmSync(perfil, { recursive: true, force: true }); } catch {}
process.exit(faltan ? 1 : 0);
