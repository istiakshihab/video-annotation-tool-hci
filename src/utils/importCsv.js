export function parseAnnotationsCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headerCols = parseCSVLine(lines[0]);
  const hasTypeCol = headerCols[0].trim().toLowerCase() === 'type';
  const rows = lines.slice(1);

  return rows.map((line, i) => {
    const cols = parseCSVLine(line);

    if (hasTypeCol) {
      const [type = 'state', col1 = '', col2 = '', col3 = '', col4 = '', col5 = '', col6 = ''] = cols;
      const rowType = type.trim().toLowerCase();

      if (rowType === 'event') {
        const eventLabel = col3.trim();
        // Extract code from "EA — Approve Agent Action" or "EA (LABEL)" format
        const eventCode = eventLabel.split(/\s[—–-]\s/)[0].split(' ')[0].trim();
        return {
          id: `imported-${Date.now()}-${i}`,
          type: 'event',
          timestamp: col1.trim(),
          eventCode,
          eventLabel,
          comment: col6.trim(),
        };
      }

      // State row
      const primaryLabel   = col3.trim();
      const secondaryLabel = col4.trim();
      return {
        id: `imported-${Date.now()}-${i}`,
        timeStart:     col1.trim(),
        timeEnd:       col2.trim(),
        primaryCode:   primaryLabel.split(' ')[0].trim(),
        primaryLabel,
        secondaryCode: secondaryLabel.split(' ')[0].trim(),
        secondaryLabel,
        featureTask:   col5.trim(),
        comment:       col6.trim(),
      };
    }

    // Legacy format (no Type column)
    const [timeStart = '', timeEnd = '', primaryLabel = '', secondaryLabel = '', featureTask = '', comment = ''] = cols;
    return {
      id: `imported-${Date.now()}-${i}`,
      timeStart: timeStart.trim(),
      timeEnd:   timeEnd.trim(),
      primaryCode:   primaryLabel.split(' ')[0].trim(),
      primaryLabel:  primaryLabel.trim(),
      secondaryCode: secondaryLabel.split(' ')[0].trim(),
      secondaryLabel: secondaryLabel.trim(),
      featureTask:   featureTask.trim(),
      comment:       comment.trim(),
    };
  }).filter(a => {
    if (a.type === 'event') return !!a.timestamp;
    return !!(a.timeStart && a.timeEnd);
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
