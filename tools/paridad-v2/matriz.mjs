#!/usr/bin/env node
// Matriz de paridad completa (interfaz-v2, tarea 16.1): cuenta las filas de analisis/paridad.md que no están
// "hechas" (en la sección *Avance en la V2*) ni "decididas" (con la decisión del dueño anotada en la fila).
// Uso: node tools/paridad-v2/matriz.mjs   (sale con código 1 si queda alguna)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(aqui, '..', '..', 'openspec', 'changes', 'interfaz-v2', 'analisis', 'paridad.md'), 'utf8');
const filas = [...md.matchAll(/^\| (\d+) \| `([^`]+)` \| ([^|]+) \|[^\n]*\| ([^|]+) \| ([^|]+) \|$/gm)].map((m) => ({ n: m[1], cap: m[2], req: m[3].trim(), estado: m[4].trim(), motivo: m[5].trim() }));
const avance = md.slice(md.indexOf('## Avance en la V2'));
const hechas = new Set([...avance.matchAll(/^- \*\*(\d+) · /gm)].map((m) => m[1]));
const decididas = (f) => /decidió el dueño|decisión del dueño/i.test(f.motivo);
const quedan = filas.filter((f) => !hechas.has(f.n) && !decididas(f));
const porCap = {};
for (const f of quedan) porCap[f.cap] = (porCap[f.cap] || 0) + 1;
console.log(`Filas de la matriz: ${filas.length} · hechas: ${filas.filter((f) => hechas.has(f.n)).length} · decididas: ${filas.filter(decididas).length} · ni hechas ni decididas: ${quedan.length}`);
for (const [c, n] of Object.entries(porCap).sort((a, b) => b[1] - a[1])) console.log(`  ${c}: ${n}`);
process.exit(quedan.length ? 1 : 0);
