import { useState, useRef, useEffect } from 'react';
import {
  X, ChevronDown, ChevronRight, FileJson, Download,
  RotateCcw, AlertCircle, CheckCircle2, Layers, PenLine,
} from 'lucide-react';
import { DEFAULT_SCHEME, parseSchemeJSON } from '../utils/scheme';
import SchemeBuilder from './SchemeBuilder';

export default function SchemePanel({ isOpen, onClose, currentScheme, onSchemeLoad }) {
  const [expandedLevels, setExpandedLevels] = useState({});
  const [pendingScheme, setPendingScheme]   = useState(null);
  const [parseErrors, setParseErrors]       = useState([]);
  const [builderOpen, setBuilderOpen]       = useState(false);
  const fileInputRef = useRef(null);

  // Reset state when panel closes
  useEffect(() => {
    if (!isOpen) {
      setPendingScheme(null);
      setParseErrors([]);
      setExpandedLevels({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const scheme = currentScheme || DEFAULT_SCHEME;

  function toggleLevel(id) {
    setExpandedLevels((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { scheme: parsed, errors } = parseSchemeJSON(ev.target.result);
      if (errors.length > 0) {
        setParseErrors(errors);
        setPendingScheme(null);
      } else {
        setParseErrors([]);
        setPendingScheme(parsed);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }

  function handleApply() {
    if (!pendingScheme) return;
    onSchemeLoad(pendingScheme);
    onClose();
  }

  function handleReset() {
    onSchemeLoad(DEFAULT_SCHEME);
    onClose();
  }

  function getLevelOptionCount(level) {
    if (level.type === 'text') return null;
    if (level.dependsOn) {
      const total = Object.values(level.optionsByParent || {}).reduce(
        (sum, opts) => sum + opts.length, 0
      );
      return total;
    }
    return level.options?.length ?? 0;
  }

  function getParentLabel(parentId) {
    return scheme.levels.find((l) => l.id === parentId)?.label ?? parentId;
  }

  const panel = (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ zIndex: 300 }}
    >
      <div
        className="modal-card"
        style={{ maxWidth: 580, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-hd">
          <div className="modal-title">
            <Layers size={15} style={{ color: 'var(--accent)' }} />
            Annotation Scheme
            <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: '0.75rem' }}>
              {scheme.name} · v{scheme.version}
            </span>
          </div>
          <button className="modal-x" onClick={onClose} title="Close">
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-bd" style={{ padding: '1.1rem 1.25rem', maxHeight: '72vh', overflowY: 'auto' }}>

          {/* Description */}
          {scheme.description && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: '1rem', lineHeight: 1.5 }}>
              {scheme.description}
            </p>
          )}

          {/* Level visualization */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5rem 1fr auto auto',
              gap: '0 0.75rem',
              alignItems: 'center',
              padding: '0.3rem 0.5rem',
              fontSize: '0.68rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-3)',
              borderBottom: '1px solid var(--border)',
              marginBottom: '0.25rem',
            }}>
              <span>#</span>
              <span>Label</span>
              <span>Type</span>
              <span>Options</span>
            </div>

            {scheme.levels.map((level, i) => {
              const expanded = expandedLevels[level.id];
              const optCount = getLevelOptionCount(level);
              const allOptions = level.type === 'select'
                ? (level.dependsOn
                    ? Object.entries(level.optionsByParent || {}).flatMap(([parent, opts]) =>
                        opts.map((o) => ({ ...o, _parent: parent }))
                      )
                    : (level.options || []))
                : [];

              return (
                <div key={level.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <button
                    onClick={() => toggleLevel(level.id)}
                    style={{
                      width: '100%',
                      background: expanded ? 'var(--bg-raised)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'grid',
                      gridTemplateColumns: '1.5rem 1fr auto auto',
                      gap: '0 0.75rem',
                      alignItems: 'center',
                      padding: '0.45rem 0.5rem',
                      textAlign: 'left',
                      color: 'inherit',
                      transition: 'background var(--transition)',
                    }}
                  >
                    <span style={{ color: 'var(--text-3)', fontSize: '0.72rem', fontWeight: 600 }}>
                      {i + 1}
                    </span>
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-1)' }}>
                        {level.label}
                      </span>
                      {level.dependsOn && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginLeft: '0.5rem' }}>
                          depends on: {getParentLabel(level.dependsOn)}
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600, padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-xs)', background: 'var(--accent-dim)',
                      color: 'var(--accent)',
                    }}>
                      {level.type}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {optCount != null && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-2)', minWidth: '2ch', textAlign: 'right' }}>
                          {optCount}
                        </span>
                      )}
                      {allOptions.length > 0
                        ? (expanded ? <ChevronDown size={12} style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />)
                        : <span style={{ width: 12 }} />
                      }
                    </div>
                  </button>

                  {expanded && allOptions.length > 0 && (
                    <div style={{
                      padding: '0.4rem 0.75rem 0.6rem 2.25rem',
                      background: 'var(--bg-raised)',
                      display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.4rem',
                    }}>
                      {level.dependsOn
                        ? Object.entries(level.optionsByParent || {}).map(([parent, opts]) => (
                          <div key={parent} style={{ width: '100%', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600 }}>
                              {getParentLabel(level.dependsOn)} = {parent}:
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.35rem', marginTop: '0.25rem' }}>
                              {opts.map((o) => (
                                <span key={o.value} style={optionChipStyle}>
                                  <b>{o.value}</b> — {o.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                        : allOptions.map((o) => (
                          <span key={o.value} style={optionChipStyle}>
                            <b>{o.value}</b> — {o.label}
                          </span>
                        ))
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Load new scheme */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              Load Custom Scheme
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => setBuilderOpen(true)}
              >
                <PenLine size={13} /> Build / Edit
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <button
                className="btn btn-ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileJson size={13} /> Load Scheme
              </button>
              <a
                href="/sample-scheme.json"
                download="sample-scheme.json"
                className="btn btn-ghost"
                style={{ textDecoration: 'none' }}
              >
                <Download size={13} /> Download Sample
              </a>
              <button className="btn btn-ghost" onClick={handleReset}>
                <RotateCcw size={13} /> Reset to Default
              </button>
            </div>

            {/* Parse errors */}
            {parseErrors.length > 0 && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', marginBottom: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <AlertCircle size={13} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)' }}>
                    Scheme validation failed
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {parseErrors.map((err, i) => (
                    <li key={i} style={{ fontSize: '0.73rem', color: 'var(--danger)', marginBottom: '0.15rem' }}>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pending scheme preview */}
            {pendingScheme && (
              <div style={{
                background: 'var(--success-dim)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.85rem', marginBottom: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <CheckCircle2 size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--success)' }}>
                        Valid scheme loaded
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-1)', margin: '0 0 0.1rem' }}>
                      <strong>{pendingScheme.name}</strong> · v{pendingScheme.version}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-2)', margin: 0 }}>
                      {pendingScheme.levels.length} levels
                      {pendingScheme.hasComment ? ' · includes comment field' : ''}
                    </p>
                  </div>
                  <button className="btn btn-primary" onClick={handleApply} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Apply Scheme
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // SchemeBuilder rendered outside the panel overlay so it layers on top
  return (
    <>
      {panel}
      <SchemeBuilder
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        currentScheme={currentScheme ?? DEFAULT_SCHEME}
        onSave={(s) => { onSchemeLoad(s); setBuilderOpen(false); onClose(); }}
      />
    </>
  );
}

const optionChipStyle = {
  fontSize: '0.7rem',
  padding: '0.15rem 0.45rem',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xs)',
  color: 'var(--text-2)',
};
