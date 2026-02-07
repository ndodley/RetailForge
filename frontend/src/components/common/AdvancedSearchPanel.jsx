import React, { useId, useMemo } from 'react';
import './AdvancedSearchPanel.css';

// A reusable “Advanced Search” UI inspired by the provided reference.
// Uses global theme tokens from index.css (no hard-coded new colors).
const AdvancedSearchPanel = ({
    title = 'Advanced Search',
    query,
    onQueryChange,
    onSearch,
    isOpen,
    onToggleOpen,
    sections = [],
}) => {
    const instanceId = useId();
    const safeSections = useMemo(() => (Array.isArray(sections) ? sections : []), [sections]);

    return (
        <section className="adv-search" aria-label={title}>
            <div className="adv-search-header">
                <div className="adv-search-title">{title}</div>
            </div>

            <div className="adv-search-topbar">
                <div className="adv-search-inputWrap">
                    <input
                        className="adv-search-input"
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange?.(e.target.value)}
                        placeholder="Search..."
                        aria-label="Search"
                    />
                </div>

                <div className="adv-search-actions">
                    <button
                        type="button"
                        className="adv-search-btn adv-search-btn--ghost"
                        onClick={() => onToggleOpen?.()}
                        aria-expanded={Boolean(isOpen)}
                        aria-controls={`adv-search-filters-${instanceId}`}
                    >
                        Filter
                    </button>
                    <button
                        type="button"
                        className="adv-search-btn adv-search-btn--primary"
                        onClick={() => onSearch?.()}
                    >
                        Search
                    </button>
                </div>
            </div>

            {isOpen ? (
                <div className="adv-search-grid" id={`adv-search-filters-${instanceId}`}>
                    {safeSections.map((section) => {
                        const options = Array.isArray(section.options) ? section.options : [];
                        const sectionId = `${instanceId}-${section.key}`;

                        return (
                            <details className="adv-search-card" key={section.key}>
                                <summary className="adv-search-cardSummary">
                                    <span className="adv-search-cardTitle">{section.title}</span>
                                    <span className="adv-search-caret" aria-hidden="true" />
                                </summary>

                                <div className="adv-search-cardBody" role="group" aria-labelledby={sectionId}>
                                    <div id={sectionId} className="adv-search-srOnly">
                                        {section.title}
                                    </div>

                                    <div className="adv-search-options">
                                        {options.map((opt) => {
                                            const inputId = `${sectionId}-${String(opt.value)}`;
                                            const isRadio = section.type === 'radio';
                                            const checked = isRadio
                                                ? String(section.value) === String(opt.value)
                                                : Array.isArray(section.values) && section.values.map(String).includes(String(opt.value));

                                            return (
                                                <label className="adv-search-option" key={String(opt.value)} htmlFor={inputId}>
                                                    <input
                                                        id={inputId}
                                                        className="adv-search-control"
                                                        type={isRadio ? 'radio' : 'checkbox'}
                                                        name={isRadio ? `${instanceId}-${section.key}` : undefined}
                                                        checked={checked}
                                                        onChange={() => {
                                                            if (isRadio) {
                                                                section.onChange?.(opt.value);
                                                                return;
                                                            }

                                                            const current = Array.isArray(section.values) ? section.values : [];
                                                            const next = checked
                                                                ? current.filter((v) => String(v) !== String(opt.value))
                                                                : [...current, opt.value];
                                                            section.onChange?.(next);
                                                        }}
                                                    />
                                                    <span className="adv-search-label">{opt.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </details>
                        );
                    })}
                </div>
            ) : null}
        </section>
    );
};

export default AdvancedSearchPanel;
