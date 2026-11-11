// Archivos en el navegador: descargar un texto como archivo y leer el texto de un archivo elegido.
// Es lo único de la biblioteca que toca el sistema de archivos (design.md D8).

/**
 * Descarga `text` como un archivo llamado `fileName`.
 * @param {{fileName:string, text:string, doc?:Document, type?:string}} spec
 */
export function downloadText({ fileName, text, doc = document, type = 'application/json' }) {
  const win = doc.defaultView;
  const blob = new win.Blob([text], { type });
  const url = win.URL.createObjectURL(blob);
  const a = doc.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  doc.body.append(a);
  a.click();
  a.remove();
  win.setTimeout(() => win.URL.revokeObjectURL(url), 0);
}

/** Lee el texto de un archivo (File). */
export function readText(file) {
  if (typeof file?.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
