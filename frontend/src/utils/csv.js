function escapeCsvValue(value) {
    if (value === null || value === undefined) return '';

    let text;
    if (value instanceof Date) {
        text = value.toISOString();
    } else if (typeof value === 'object') {
        try {
            text = JSON.stringify(value);
        } catch {
            text = String(value);
        }
    } else {
        text = String(value);
    }

    const escaped = text.replace(/"/g, '""');
    return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function rowsToCsv(rows, columns) {
    const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : [];

    const headers = Array.isArray(columns) && columns.length
        ? columns.map((c) => c.key)
        : (() => {
            const headerSet = new Set();
            safeRows.forEach((row) => {
                if (!row || typeof row !== 'object') return;
                Object.keys(row).forEach((key) => headerSet.add(key));
            });
            return Array.from(headerSet).sort((a, b) => String(a).localeCompare(String(b)));
        })();

    const headerLabels = Array.isArray(columns) && columns.length
        ? columns.map((c) => c.label ?? c.key)
        : headers;

    const lines = [];
    lines.push(headerLabels.map(escapeCsvValue).join(','));

    safeRows.forEach((row) => {
        const line = headers.map((h) => escapeCsvValue(row?.[h])).join(',');
        lines.push(line);
    });

    // Include UTF-8 BOM so Excel opens it correctly.
    return `\ufeff${lines.join('\r\n')}\r\n`;
}

export function downloadCsv({ rows, filename = 'export.csv', columns }) {
    const csv = rowsToCsv(rows, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 0);
}

function stripBom(text) {
    if (typeof text !== 'string') return '';
    return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

// Parses RFC4180-ish CSV with quoted fields/newlines.
export function parseCsv(text) {
    const input = stripBom(String(text || ''));
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < input.length; i += 1) {
        const ch = input[i];
        const next = input[i + 1];

        if (inQuotes) {
            if (ch === '"' && next === '"') {
                field += '"';
                i += 1;
                continue;
            }
            if (ch === '"') {
                inQuotes = false;
                continue;
            }
            field += ch;
            continue;
        }

        if (ch === '"') {
            inQuotes = true;
            continue;
        }

        if (ch === ',') {
            row.push(field);
            field = '';
            continue;
        }

        if (ch === '\r' && next === '\n') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
            i += 1;
            continue;
        }

        if (ch === '\n') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
            continue;
        }

        field += ch;
    }

    // flush last field/row
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    const nonEmpty = rows.filter((r) => r.some((cell) => String(cell ?? '').trim() !== ''));
    if (nonEmpty.length === 0) {
        return { headers: [], rows: [] };
    }

    const headers = nonEmpty[0].map((h) => String(h ?? '').trim());
    const dataRows = nonEmpty.slice(1);
    return { headers, rows: dataRows };
}

export function csvToObjects(text, columns) {
    const { headers, rows } = parseCsv(text);
    if (!Array.isArray(columns) || columns.length === 0) {
        throw new Error('CSV schema is missing.');
    }

    const expected = columns.map((c) => String(c.label ?? c.key).trim());
    const normalizedHeaders = headers.map((h) => String(h).trim());
    const headerOk = expected.length === normalizedHeaders.length && expected.every((h, idx) => h === normalizedHeaders[idx]);
    if (!headerOk) {
        throw new Error(`CSV headers do not match template. Expected: ${expected.join(', ')}`);
    }

    return rows
        .filter((r) => r.some((cell) => String(cell ?? '').trim() !== ''))
        .map((r) => {
            const obj = {};
            columns.forEach((c, idx) => {
                obj[c.key] = r[idx] ?? '';
            });
            return obj;
        });
}
