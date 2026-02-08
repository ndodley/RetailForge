import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { csvToObjects } from '../../utils/csv';
import { downloadCsv } from '../../utils/csv';

const BulkUploadSection = ({
    title = 'Bulk Upload',
    description,
    columns,
    uploadUrl,
    filename,
    transformRow,
}) => {
    const [fileName, setFileName] = useState('');
    const [rawRows, setRawRows] = useState([]);
    const [parsedRows, setParsedRows] = useState([]);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');

    const previewColumns = useMemo(() => columns || [], [columns]);

    const clear = () => {
        setFileName('');
        setRawRows([]);
        setParsedRows([]);
        setError('');
        setSuccess('');
        setUploading(false);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        setSuccess('');

        if (!file) {
            clear();
            return;
        }

        try {
            setError('');
            setFileName(file.name);

            const text = await file.text();
            const objects = csvToObjects(text, previewColumns);

            const transformed = typeof transformRow === 'function'
                ? objects.map((r) => transformRow(r))
                : objects;

            const nonEmpty = transformed.filter((r) => Object.values(r || {}).some((v) => String(v ?? '').trim() !== ''));
            setRawRows(objects);
            setParsedRows(nonEmpty);
        } catch (err) {
            setRawRows([]);
            setParsedRows([]);
            setError(err?.message || 'Failed to parse CSV.');
        }
    };

    const handleUpload = async () => {
        if (!uploadUrl) return;
        if (!parsedRows.length) {
            setError('No rows to upload.');
            return;
        }

        try {
            setUploading(true);
            setError('');
            setSuccess('');

            const res = await axios.post(
                uploadUrl,
                { rows: parsedRows },
                { withCredentials: true }
            );

            const inserted = res?.data?.inserted;
            setSuccess(typeof inserted === 'number'
                ? `Uploaded ${inserted} row${inserted === 1 ? '' : 's'} successfully.`
                : 'Upload complete.'
            );
        } catch (err) {
            const message = err?.response?.data?.error || err?.message || 'Bulk upload failed.';
            setError(message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <section style={{ marginTop: 18 }}>
            <div style={{
                border: '1px solid var(--border)',
                borderRadius: 16,
                background: 'var(--surface-3)',
                boxShadow: 'var(--shadow-1)',
                padding: 14,
            }}>
                <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 0.3 }}>{title}</div>
                {description ? (
                    <div style={{ marginTop: 6, color: 'var(--muted)', fontWeight: 700 }}>{description}</div>
                ) : null}

                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: '1 1 320px' }}>
                        <input
                            className="admin-input"
                            type="file"
                            accept="text/csv,.csv"
                            onChange={handleFileChange}
                        />
                        {fileName ? (
                            <div style={{ marginTop: 6, color: 'var(--muted-2)', fontWeight: 700, fontSize: 13 }}>
                                Selected: {fileName}
                            </div>
                        ) : null}
                        {filename ? (
                            <div style={{ marginTop: 6, color: 'var(--muted-2)', fontWeight: 700, fontSize: 13 }}>
                                Expected format: {filename}
                            </div>
                        ) : null}
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="admin-btn admin-btn--sm"
                            onClick={() => downloadCsv({ rows: [], filename: filename || 'template.csv', columns: previewColumns })}
                            disabled={uploading || previewColumns.length === 0}
                            title={previewColumns.length === 0 ? 'Template schema is missing' : 'Download a sample CSV template'}
                        >
                            Download Template
                        </button>
                        <button
                            type="button"
                            className="admin-btn admin-btn--sm"
                            onClick={clear}
                            disabled={uploading}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            className="admin-btn admin-btn--sm admin-btn--primary"
                            onClick={handleUpload}
                            disabled={uploading || parsedRows.length === 0}
                            title={parsedRows.length === 0 ? 'Upload a CSV to preview rows first' : 'Upload rows'}
                        >
                            {uploading ? 'Uploading…' : 'Confirm Upload'}
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="admin-alert admin-alert--error" style={{ marginTop: 12 }}>{error}</div>
                ) : null}

                {success ? (
                    <div className="admin-alert" style={{ marginTop: 12, borderColor: 'color-mix(in srgb, var(--success) 50%, var(--border))' }}>
                        <div style={{ color: 'var(--success)', fontWeight: 900 }}>{success}</div>
                    </div>
                ) : null}

                {parsedRows.length > 0 ? (
                    <div style={{ marginTop: 12 }}>
                        <div style={{ color: 'var(--muted)', fontWeight: 900, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                            Preview ({parsedRows.length} row{parsedRows.length === 1 ? '' : 's'})
                        </div>
                        <div className="admin-table" style={{ maxHeight: 320 }}>
                            <table>
                                <thead>
                                    <tr>
                                        {previewColumns.map((c) => (
                                            <th key={c.key}>{c.label ?? c.key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedRows.slice(0, 50).map((r, idx) => (
                                        <tr key={idx}>
                                            {previewColumns.map((c) => (
                                                <td key={c.key} style={{ color: 'var(--text)', fontWeight: 700 }}>
                                                    {String(r?.[c.key] ?? '')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {parsedRows.length > 50 ? (
                            <div style={{ marginTop: 8, color: 'var(--muted-2)', fontWeight: 700, fontSize: 13 }}>
                                Showing first 50 rows.
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export default BulkUploadSection;
