import { useState, useEffect } from 'react';
import { X, Flag } from 'lucide-react';
import { EVENT_CODES } from '../utils/scheme';

export default function EventModal({ open, timestamp, onSubmit, onCancel }) {
  const [selectedCode, setSelectedCode] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCode) return;
    const ev = EVENT_CODES.find(c => c.value === selectedCode);
    onSubmit({
      id: Date.now().toString(),
      type: 'event',
      timestamp,
      eventCode: ev.value,
      eventLabel: ev.label,
      comment,
    });
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-card" style={{ maxWidth: 480 }}>
        <div className="modal-hd">
          <div className="modal-title">
            <Flag size={14} color="var(--warning)" />
            Log Event
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--warning)', fontSize: '0.8rem', fontWeight: 600 }}>
              @ {timestamp}
            </span>
          </div>
          <button className="modal-x" onClick={onCancel} title="Cancel (Esc)">
            <X size={14} />
          </button>
        </div>

        <div className="modal-bd">
          <form onSubmit={handleSubmit}>
            <div className="f-label" style={{ marginBottom: '0.5rem' }}>Event Code</div>
            <div className="event-code-grid">
              {EVENT_CODES.map(ev => (
                <button
                  key={ev.value}
                  type="button"
                  className={`event-code-btn${selectedCode === ev.value ? ' selected' : ''}`}
                  onClick={() => setSelectedCode(ev.value)}
                  title={ev.description}
                >
                  <span className="event-code-val">{ev.value}</span>
                  <span className="event-code-name">{ev.label.split(' — ')[1]}</span>
                </button>
              ))}
            </div>

            {selectedCode && (
              <div className="event-desc">
                {EVENT_CODES.find(c => c.value === selectedCode)?.description}
              </div>
            )}

            <div className="f-field" style={{ marginTop: '0.75rem' }}>
              <label className="f-label">
                Comment{' '}
                <span style={{ color: 'var(--text-3)', textTransform: 'none', letterSpacing: 0 }}>
                  (optional)
                </span>
              </label>
              <textarea
                className="f-textarea"
                rows={2}
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>

            <div className="f-actions">
              <button type="submit" className="btn btn-warning" disabled={!selectedCode}>
                <Flag size={13} /> Log Event
              </button>
              <button type="button" className="btn btn-ghost" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
