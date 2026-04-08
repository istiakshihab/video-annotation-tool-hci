import { useState, useEffect, useCallback } from 'react';
import { X, Database, Trash2, Edit2, Check, Film, Clock, FileText } from 'lucide-react';
import { listSessions, loadSession, deleteSession, renameSession } from '../utils/db';

const DRAWER_STYLES = `
.session-drawer {
  position: fixed;
  top: 0; right: 0;
  width: 360px; height: 100vh;
  background: var(--bg-card);
  border-left: 1px solid var(--border);
  box-shadow: -8px 0 32px rgba(0,0,0,0.15);
  transform: translateX(100%);
  transition: transform 0.25s ease;
  z-index: 200;
  display: flex; flex-direction: column;
}
.session-drawer.open { transform: translateX(0); }
.session-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 199;
  backdrop-filter: blur(2px);
}
`;

function relativeTime(ms) {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

function SessionCard({ session, isCurrent, onLoad, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(session.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function commitRename() {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === session.name) {
      setNameValue(session.name);
      setEditing(false);
      return;
    }
    await onRename(session.id, trimmed);
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setNameValue(session.name); setEditing(false); }
  }

  return (
    <div style={{
      padding: '0.75rem',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'}`,
      background: isCurrent ? 'var(--accent-dim)' : 'var(--bg-raised)',
      marginBottom: '0.5rem',
      transition: 'border-color var(--transition)',
    }}>
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
        {editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: 0 }}>
            <input
              className="f-input"
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, minWidth: 0, fontSize: '0.82rem', padding: '0.25rem 0.45rem' }}
            />
            <button
              className="btn-icon"
              title="Save"
              onMouseDown={(e) => { e.preventDefault(); commitRename(); }}
            >
              <Check size={12} />
            </button>
            <button
              className="btn-icon"
              title="Cancel"
              onMouseDown={(e) => { e.preventDefault(); setNameValue(session.name); setEditing(false); }}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <>
            <span
              style={{
                flex: 1, minWidth: 0, fontSize: '0.83rem', fontWeight: 600,
                color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                cursor: 'text',
              }}
              title="Click to rename"
              onClick={() => setEditing(true)}
            >
              {session.name}
            </span>
            <button
              className="btn-icon"
              title="Rename"
              onClick={() => setEditing(true)}
              style={{ flexShrink: 0 }}
            >
              <Edit2 size={11} />
            </button>
          </>
        )}
      </div>

      {/* Video filename */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.45rem' }}>
        <Film size={11} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        <span style={{
          fontSize: '0.72rem', color: 'var(--text-3)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {session.videoName || '—'}
        </span>
      </div>

      {/* Meta row: annotation count + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
          fontSize: '0.7rem', padding: '0.1rem 0.4rem',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xs)', color: 'var(--text-2)',
        }}>
          <FileText size={10} />
          {(session.annotations || []).length} annotations
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-3)' }}>
          <Clock size={10} />
          {relativeTime(session.updatedAt)}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <button
          className={`btn ${isCurrent ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
          onClick={() => onLoad(session.id)}
        >
          {isCurrent ? 'Active' : 'Load'}
        </button>

        {confirmDelete ? (
          <>
            <span style={{ fontSize: '0.7rem', color: 'var(--danger)', whiteSpace: 'nowrap' }}>Delete?</span>
            <button className="btn btn-danger" style={{ fontSize: '0.73rem', padding: '0.28rem 0.55rem' }} onClick={() => onDelete(session.id)}>
              Yes
            </button>
            <button className="btn btn-ghost" style={{ fontSize: '0.73rem', padding: '0.28rem 0.55rem' }} onClick={() => setConfirmDelete(false)}>
              No
            </button>
          </>
        ) : (
          <button
            className="btn-icon"
            title="Delete session"
            onClick={() => setConfirmDelete(true)}
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function SessionPanel({ isOpen, onClose, currentSessionId, onSessionLoad, onSessionDelete }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listSessions();
      setSessions(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  async function handleLoad(id) {
    const session = await loadSession(id);
    if (session) {
      onSessionLoad(session);
      onClose();
    }
  }

  async function handleDelete(id) {
    await deleteSession(id);
    onSessionDelete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleRename(id, newName) {
    const updated = await renameSession(id, newName);
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  return (
    <>
      {/* Inject drawer CSS once */}
      <style>{DRAWER_STYLES}</style>

      {isOpen && (
        <div className="session-backdrop" onClick={onClose} />
      )}

      <div className={`session-drawer${isOpen ? ' open' : ''}`}>
        {/* Header */}
        <div style={{
          padding: '0.9rem 1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' }}>Sessions</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', margin: '0.1rem 0 0' }}>
              {sessions.length} saved session{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="modal-x" onClick={onClose} title="Close">
            <X size={13} />
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {loading && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', textAlign: 'center', paddingTop: '2rem' }}>
              Loading…
            </p>
          )}

          {!loading && sessions.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', paddingTop: '3rem', gap: '0.75rem',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--bg-raised)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Database size={22} style={{ color: 'var(--text-3)' }} />
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', margin: 0 }}>
                No saved sessions yet
              </p>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-3)', margin: 0, textAlign: 'center', maxWidth: 220 }}>
                Sessions are saved automatically as you annotate.
              </p>
            </div>
          )}

          {!loading && sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isCurrent={session.id === currentSessionId}
              onLoad={handleLoad}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
        </div>
      </div>
    </>
  );
}
