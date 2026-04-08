import { useState, useCallback } from 'react';
import {
  X, Plus, Trash2, ChevronUp, ChevronDown,
  Check, Download, Layers, AlertCircle,
} from 'lucide-react';
import { DEFAULT_SCHEME, validateScheme } from '../utils/scheme';

// ── helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function slugify(str) {
  return str
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('');
}

function optionsToEditable(opts = []) {
  return opts.map((o) => ({ _key: uid(), value: o.value, label: o.label }));
}

function levelToEditable(level) {
  return {
    _key: uid(),
    id: level.id ?? '',
    label: level.label ?? '',
    type: level.type ?? 'select',
    required: level.required !== false,
    dependsOn: level.dependsOn ?? '',
    options: optionsToEditable(level.options),
    optionsByParent: Object.fromEntries(
      Object.entries(level.optionsByParent ?? {}).map(([k, v]) => [k, optionsToEditable(v)])
    ),
  };
}

function schemeToEditable(scheme) {
  return {
    name: scheme.name ?? '',
    version: scheme.version ?? '1.0',
    description: scheme.description ?? '',
    hasComment: scheme.hasComment !== false,
    levels: (scheme.levels ?? []).map(levelToEditable),
  };
}

function editableToScheme(draft) {
  return {
    name: draft.name.trim(),
    version: draft.version.trim(),
    description: draft.description.trim(),
    hasComment: draft.hasComment,
    levels: draft.levels.map((lev) => {
      const base = {
        id: lev.id.trim(),
        label: lev.label.trim(),
        type: lev.type,
        required: lev.required,
      };
      if (lev.type === 'select') {
        if (lev.dependsOn) {
          return {
            ...base,
            dependsOn: lev.dependsOn,
            optionsByParent: Object.fromEntries(
              Object.entries(lev.optionsByParent).map(([k, opts]) => [
                k,
                opts.map((o) => ({ value: o.value.trim(), label: o.label.trim() })).filter((o) => o.value),
              ])
            ),
          };
        }
        return {
          ...base,
          options: lev.options.map((o) => ({ value: o.value.trim(), label: o.label.trim() })).filter((o) => o.value),
        };
      }
      return base;
    }),
  };
}

// ── component ──────────────────────────────────────────────────────────────

export default function SchemeBuilder({ isOpen, onClose, currentScheme, onSave }) {
  const [draft, setDraft] = useState(() => schemeToEditable(currentScheme ?? DEFAULT_SCHEME));
  const [errors, setErrors] = useState([]);
  // Track which parent-value tab is selected per dependent level (levelKey → parentValue)
  const [parentTabs, setParentTabs] = useState({});

  // Re-initialise draft when panel opens with a new scheme
  const [lastScheme, setLastScheme] = useState(currentScheme);
  if (currentScheme !== lastScheme) {
    setLastScheme(currentScheme);
    setDraft(schemeToEditable(currentScheme ?? DEFAULT_SCHEME));
    setErrors([]);
  }

  // ALL hooks must appear before any early return (Rules of Hooks).
  const handleApply = useCallback(() => {
    const scheme = editableToScheme(draft);
    const errs = validateScheme(scheme);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    onSave(scheme);
    onClose();
  }, [draft, onSave, onClose]);

  const handleExport = useCallback(() => {
    const scheme = editableToScheme(draft);
    const json = JSON.stringify(scheme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(scheme.name || 'scheme').replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [draft]);

  if (!isOpen) return null;

  // ── draft helpers ──────────────────────────────────────────────────────

  const setMeta = (field) => (e) =>
    setDraft((d) => ({ ...d, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const setLevel = (key, field, value) =>
    setDraft((d) => ({
      ...d,
      levels: d.levels.map((l) => (l._key === key ? { ...l, [field]: value } : l)),
    }));

  const updateLevelLabel = (key, label) => {
    setDraft((d) => {
      const lev = d.levels.find((l) => l._key === key);
      const autoId = lev && (lev.id === '' || lev.id === slugify(lev.label));
      return {
        ...d,
        levels: d.levels.map((l) =>
          l._key === key ? { ...l, label, ...(autoId ? { id: slugify(label) } : {}) } : l
        ),
      };
    });
  };

  const setLevelType = (key, type) => {
    setDraft((d) => ({
      ...d,
      levels: d.levels.map((l) =>
        l._key === key ? { ...l, type, dependsOn: '', options: l.options, optionsByParent: l.optionsByParent } : l
      ),
    }));
  };

  const setLevelDependsOn = (key, parentId) => {
    setDraft((d) => {
      const parent = d.levels.find((l) => l.id === parentId);
      const parentOptions = parent?.type === 'select' && !parent.dependsOn ? parent.options : [];
      const existing = d.levels.find((l) => l._key === key);
      // Ensure optionsByParent has an entry for every parent option value
      const newOBP = { ...(existing?.optionsByParent ?? {}) };
      parentOptions.forEach((po) => {
        if (!newOBP[po.value]) newOBP[po.value] = [];
      });
      return {
        ...d,
        levels: d.levels.map((l) =>
          l._key === key ? { ...l, dependsOn: parentId, optionsByParent: newOBP } : l
        ),
      };
    });
  };

  const moveLevel = (key, dir) => {
    setDraft((d) => {
      const idx = d.levels.findIndex((l) => l._key === key);
      const next = idx + dir;
      if (next < 0 || next >= d.levels.length) return d;
      const arr = [...d.levels];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return { ...d, levels: arr };
    });
  };

  const addLevel = () => {
    const newLevel = levelToEditable({
      id: '', label: '', type: 'select', required: true,
      options: [{ value: '', label: '' }],
    });
    setDraft((d) => ({ ...d, levels: [...d.levels, newLevel] }));
  };

  const removeLevel = (key) => {
    setDraft((d) => ({
      ...d,
      levels: d.levels
        .filter((l) => l._key !== key)
        .map((l) => (l.dependsOn === d.levels.find((x) => x._key === key)?.id ? { ...l, dependsOn: '' } : l)),
    }));
  };

  // ── option helpers ────────────────────────────────────────────────────

  const setOption = (levelKey, optKey, field, value, parentValue = null) =>
    setDraft((d) => ({
      ...d,
      levels: d.levels.map((l) => {
        if (l._key !== levelKey) return l;
        if (parentValue != null) {
          return {
            ...l,
            optionsByParent: {
              ...l.optionsByParent,
              [parentValue]: (l.optionsByParent[parentValue] ?? []).map((o) =>
                o._key === optKey ? { ...o, [field]: value } : o
              ),
            },
          };
        }
        return { ...l, options: l.options.map((o) => (o._key === optKey ? { ...o, [field]: value } : o)) };
      }),
    }));

  const addOption = (levelKey, parentValue = null) =>
    setDraft((d) => ({
      ...d,
      levels: d.levels.map((l) => {
        if (l._key !== levelKey) return l;
        const newOpt = { _key: uid(), value: '', label: '' };
        if (parentValue != null) {
          return {
            ...l,
            optionsByParent: {
              ...l.optionsByParent,
              [parentValue]: [...(l.optionsByParent[parentValue] ?? []), newOpt],
            },
          };
        }
        return { ...l, options: [...l.options, newOpt] };
      }),
    }));

  const removeOption = (levelKey, optKey, parentValue = null) =>
    setDraft((d) => ({
      ...d,
      levels: d.levels.map((l) => {
        if (l._key !== levelKey) return l;
        if (parentValue != null) {
          return {
            ...l,
            optionsByParent: {
              ...l.optionsByParent,
              [parentValue]: (l.optionsByParent[parentValue] ?? []).filter((o) => o._key !== optKey),
            },
          };
        }
        return { ...l, options: l.options.filter((o) => o._key !== optKey) };
      }),
    }));

  const moveOption = (levelKey, optKey, dir, parentValue = null) =>
    setDraft((d) => ({
      ...d,
      levels: d.levels.map((l) => {
        if (l._key !== levelKey) return l;
        const reorder = (arr) => {
          const idx = arr.findIndex((o) => o._key === optKey);
          const next = idx + dir;
          if (next < 0 || next >= arr.length) return arr;
          const a = [...arr];
          [a[idx], a[next]] = [a[next], a[idx]];
          return a;
        };
        if (parentValue != null) {
          return {
            ...l,
            optionsByParent: {
              ...l.optionsByParent,
              [parentValue]: reorder(l.optionsByParent[parentValue] ?? []),
            },
          };
        }
        return { ...l, options: reorder(l.options) };
      }),
    }));

  // ── renders ───────────────────────────────────────────────────────────

  function renderOptions(levelKey, opts, parentValue = null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {opts.map((opt, i) => (
          <div key={opt._key} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <input
              className="f-input"
              style={{ width: 70, fontFamily: 'var(--mono)', fontSize: '0.75rem' }}
              placeholder="CODE"
              value={opt.value}
              onChange={(e) => setOption(levelKey, opt._key, 'value', e.target.value.toUpperCase(), parentValue)}
            />
            <input
              className="f-input"
              style={{ flex: 1, fontSize: '0.78rem' }}
              placeholder="Full label"
              value={opt.label}
              onChange={(e) => setOption(levelKey, opt._key, 'label', e.target.value, parentValue)}
            />
            <button
              className="btn-icon"
              style={{ width: 22, height: 22 }}
              onClick={() => moveOption(levelKey, opt._key, -1, parentValue)}
              disabled={i === 0}
              title="Move up"
            >
              <ChevronUp size={11} />
            </button>
            <button
              className="btn-icon"
              style={{ width: 22, height: 22 }}
              onClick={() => moveOption(levelKey, opt._key, 1, parentValue)}
              disabled={i === opts.length - 1}
              title="Move down"
            >
              <ChevronDown size={11} />
            </button>
            <button
              className="btn-icon"
              style={{ width: 22, height: 22, color: 'var(--danger)' }}
              onClick={() => removeOption(levelKey, opt._key, parentValue)}
              title="Remove option"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
        <button
          className="btn btn-ghost"
          style={{ alignSelf: 'flex-start', fontSize: '0.72rem', padding: '0.2rem 0.6rem', marginTop: '0.1rem' }}
          onClick={() => addOption(levelKey, parentValue)}
        >
          <Plus size={11} /> Add Option
        </button>
      </div>
    );
  }

  function renderLevel(lev, idx, total) {
    // Previous select levels (no dependsOn) can be parent candidates
    const parentCandidates = draft.levels
      .slice(0, idx)
      .filter((l) => l.type === 'select' && !l.dependsOn && l.id);

    // For dependent levels: figure out the parent's options to make tabs
    const parentLevel = lev.dependsOn
      ? draft.levels.find((l) => l.id === lev.dependsOn)
      : null;
    const parentOpts = parentLevel?.options ?? [];
    const currentTab = parentTabs[lev._key] ?? parentOpts[0]?.value ?? '';

    return (
      <div
        key={lev._key}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginBottom: '0.75rem',
          overflow: 'hidden',
        }}
      >
        {/* Level header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.55rem 0.75rem',
          background: 'var(--bg-raised)',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', minWidth: '1.2rem' }}>
            {idx + 1}
          </span>

          {/* Label */}
          <input
            className="f-input"
            style={{ flex: 1, fontWeight: 600, fontSize: '0.82rem' }}
            placeholder="Level label (e.g. Primary Code)"
            value={lev.label}
            onChange={(e) => updateLevelLabel(lev._key, e.target.value)}
          />

          {/* ID */}
          <input
            className="f-input"
            style={{ width: 130, fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--text-2)' }}
            placeholder="level-id"
            value={lev.id}
            onChange={(e) => setLevel(lev._key, 'id', e.target.value.replace(/\s+/g, ''))}
            title="Field ID (used in annotation object)"
          />

          {/* Type toggle */}
          <div style={{ display: 'flex', borderRadius: 'var(--radius-xs)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
            {['select', 'text'].map((t) => (
              <button
                key={t}
                onClick={() => setLevelType(lev._key, t)}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: lev.type === t ? 'var(--accent)' : 'transparent',
                  color: lev.type === t ? '#fff' : 'var(--text-2)',
                  transition: 'background var(--transition)',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Reorder */}
          <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={() => moveLevel(lev._key, -1)} disabled={idx === 0} title="Move up"><ChevronUp size={12} /></button>
          <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={() => moveLevel(lev._key, 1)} disabled={idx === total - 1} title="Move down"><ChevronDown size={12} /></button>
          <button className="btn-icon" style={{ width: 24, height: 24, color: 'var(--danger)' }} onClick={() => removeLevel(lev._key)} title="Remove level"><Trash2 size={12} /></button>
        </div>

        {/* Level body */}
        <div style={{ padding: '0.75rem' }}>
          {lev.type === 'select' && (
            <>
              {/* DependsOn */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                  Depends on:
                </label>
                <select
                  className="f-select"
                  style={{ fontSize: '0.78rem', flex: 1, maxWidth: 240 }}
                  value={lev.dependsOn}
                  onChange={(e) => setLevelDependsOn(lev._key, e.target.value)}
                >
                  <option value="">None (independent)</option>
                  {parentCandidates.map((pc) => (
                    <option key={pc._key} value={pc.id}>{pc.label || pc.id}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>
                  {lev.dependsOn ? 'Options vary by parent value' : 'Fixed option list'}
                </span>
              </div>

              {/* Options */}
              {lev.dependsOn ? (
                <>
                  {/* Per-parent tabs */}
                  {parentOpts.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontStyle: 'italic' }}>
                      Parent level has no options yet.
                    </p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                        {parentOpts.map((po) => (
                          <button
                            key={po.value}
                            onClick={() => setParentTabs((t) => ({ ...t, [lev._key]: po.value }))}
                            style={{
                              padding: '0.18rem 0.55rem',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              fontFamily: 'var(--mono)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-xs)',
                              cursor: 'pointer',
                              background: currentTab === po.value ? 'var(--accent)' : 'var(--bg-raised)',
                              color: currentTab === po.value ? '#fff' : 'var(--text-2)',
                              transition: 'background var(--transition)',
                            }}
                          >
                            {po.value || '—'}
                            {lev.optionsByParent[po.value]?.length
                              ? <span style={{ opacity: 0.75, marginLeft: 4 }}>({lev.optionsByParent[po.value].length})</span>
                              : null}
                          </button>
                        ))}
                      </div>
                      {currentTab && renderOptions(lev._key, lev.optionsByParent[currentTab] ?? [], currentTab)}
                    </>
                  )}
                </>
              ) : (
                renderOptions(lev._key, lev.options)
              )}
            </>
          )}
          {lev.type === 'text' && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: 0 }}>
              Free-text input — no options needed.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ zIndex: 400, alignItems: 'flex-start', padding: '2vh 1rem', overflowY: 'auto' }}
    >
      <div
        className="modal-card"
        style={{ maxWidth: 740, width: '100%', margin: '0 auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-hd">
          <div className="modal-title">
            <Layers size={15} style={{ color: 'var(--accent)' }} />
            Scheme Builder
            <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: '0.75rem' }}>
              Build a custom multi-level annotation scheme
            </span>
          </div>
          <button className="modal-x" onClick={onClose} title="Close"><X size={13} /></button>
        </div>

        <div className="modal-bd" style={{ padding: '1.1rem 1.25rem', maxHeight: '85vh', overflowY: 'auto' }}>

          {/* Metadata */}
          <fieldset style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1.25rem' }}>
            <legend style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-2)', padding: '0 0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Scheme Info
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div>
                <label className="f-label">Name</label>
                <input className="f-input" value={draft.name} onChange={setMeta('name')} placeholder="My Annotation Scheme" />
              </div>
              <div>
                <label className="f-label">Version</label>
                <input className="f-input" value={draft.version} onChange={setMeta('version')} placeholder="1.0" />
              </div>
            </div>
            <div style={{ marginBottom: '0.6rem' }}>
              <label className="f-label">Description <span style={{ textTransform: 'none', color: 'var(--text-3)' }}>(optional)</span></label>
              <input className="f-input" value={draft.description} onChange={setMeta('description')} placeholder="Describe what this scheme codes for…" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-1)' }}>
              <input
                type="checkbox"
                checked={draft.hasComment}
                onChange={setMeta('hasComment')}
                style={{ width: 14, height: 14, accentColor: 'var(--accent)' }}
              />
              Include free-text comment field
            </label>
          </fieldset>

          {/* Levels */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Levels ({draft.levels.length})
            </span>
            <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={addLevel}>
              <Plus size={12} /> Add Level
            </button>
          </div>

          {draft.levels.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)', fontSize: '0.8rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
              No levels yet — click "Add Level" to start building.
            </div>
          )}

          {draft.levels.map((lev, i) => renderLevel(lev, i, draft.levels.length))}

          {/* Validation errors */}
          {errors.length > 0 && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', marginBottom: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <AlertCircle size={13} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)' }}>Please fix the following:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {errors.map((e, i) => (
                  <li key={i} style={{ fontSize: '0.73rem', color: 'var(--danger)', marginBottom: '0.1rem' }}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost" onClick={handleExport}>
              <Download size={13} /> Export JSON
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleApply}>
              <Check size={13} /> Apply Scheme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
