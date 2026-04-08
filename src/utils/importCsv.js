export function parseAnnotationsCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  // Skip header
  const rows = lines.slice(1);

  return rows.map((line, i) => {
    // Handle commas inside quoted fields
    const cols = parseCSVLine(line);
    const [timeStart = '', timeEnd = '', primaryLabel = '', secondaryLabel = '', featureTask = '', comment = ''] = cols;

    // Extract code from label like "TC (TEST CLI)" → "TC"
    const primaryCode = primaryLabel.split(' ')[0].trim();
    const secondaryCode = secondaryLabel.split(' ')[0].trim();

    return {
      id: `imported-${Date.now()}-${i}`,
      timeStart: timeStart.trim(),
      timeEnd: timeEnd.trim(),
      primaryCode,
      primaryLabel: primaryLabel.trim(),
      secondaryCode,
      secondaryLabel: secondaryLabel.trim(),
      featureTask: featureTask.trim(),
      comment: comment.trim(),
    };
  }).filter(a => a.timeStart && a.timeEnd);
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
