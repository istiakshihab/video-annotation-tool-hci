import { useEffect } from 'react';
import { X } from 'lucide-react';
import AnnotationForm from './AnnotationForm';

export default function AnnotationModal({ open, scheme, timeStart, timeEnd, editingAnnotation, defaultTask, onSubmit, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-card">
        <div className="modal-hd">
          <div className="modal-title">
            Annotate Segment
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
              {timeStart}
            </span>
            <span style={{ color: 'var(--text-3)' }}>→</span>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>
              {timeEnd}
            </span>
          </div>
          <button className="modal-x" onClick={onCancel} title="Cancel (Esc)">
            <X size={14} />
          </button>
        </div>
        <div className="modal-bd">
          <AnnotationForm
            scheme={scheme}
            timeStart={timeStart}
            timeEnd={timeEnd}
            editingAnnotation={editingAnnotation}
            defaultTask={defaultTask}
            onSubmit={onSubmit}
            onCancelEdit={onCancel}
          />
        </div>
      </div>
    </div>
  );
}
