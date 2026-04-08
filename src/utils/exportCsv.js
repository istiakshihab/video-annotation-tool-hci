export function secondsToTimestamp(totalSeconds) {
  // Convert seconds (float/int) to H:MM:SS
  const s = Math.floor(totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function timestampToSeconds(ts) {
  // Parse H:MM:SS or MM:SS to seconds
  const parts = ts.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(ts) || 0;
}

export function exportAnnotationsCsv(annotations, filename = 'annotations.csv') {
  // annotations is array of { id, timeStart, timeEnd, primaryCode, primaryLabel, secondaryCode, secondaryLabel, featureTask, comment }
  // timeStart and timeEnd are stored as H:MM:SS strings directly
  const header = 'Time Start,Time End,Primary Code,Secondary Code,Task,Comment';
  const rows = annotations.map(a => {
    const comment = (a.comment || '').replace(/,/g, ';'); // escape commas in comments
    // Support both new (primaryCodeLabel) and old (primaryLabel) annotation formats.
    const primaryLabel   = a.primaryCodeLabel   ?? a.primaryLabel   ?? '';
    const secondaryLabel = a.secondaryCodeLabel ?? a.secondaryLabel ?? '';
    return `${a.timeStart},${a.timeEnd},${primaryLabel},${secondaryLabel},${a.featureTask || ''},${comment}`;
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
