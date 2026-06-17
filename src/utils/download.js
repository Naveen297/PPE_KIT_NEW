/**
 * Browser file-download helpers — dependency-free. Used by the report modal to
 * turn API rows into real downloadable files (CSV / JSON / Excel-HTML).
 */

/** Trigger a download of `content` as a file named `filename`. */
export const downloadBlob = (filename, content, mime) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Defer revoke so the click has time to register in all browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Escape a single CSV cell (quote when it contains a delimiter/quote/newline). */
const csvCell = (value) => {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Convert rows of objects to CSV text.
 * @param {Array<{key:string,label:string}>} columns
 * @param {Array<object>} rows
 */
export const toCsv = (columns, rows) => {
  const header = columns.map((c) => csvCell(c.label)).join(',');
  const body = rows
    .map((row) => columns.map((c) => csvCell(row[c.key])).join(','))
    .join('\n');
  return `${header}\n${body}`;
};

/**
 * Convert rows to a minimal HTML table that Excel opens natively (.xls).
 */
export const toExcelHtml = (columns, rows, title = 'Report') => {
  const head = columns.map((c) => `<th>${c.label}</th>`).join('');
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${row[c.key] ?? ''}</td>`).join('')}</tr>`,
    )
    .join('');
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"><title>${title}</title></head><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
};
