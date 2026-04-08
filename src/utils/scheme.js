export const DEFAULT_SCHEME = {
  name: 'Yunhan Expert Annotation Scheme',
  version: '1.0.0',
  description: 'Annotation scheme for coding expert screen-recording sessions.',
  levels: [
    {
      id: 'primaryCode',
      label: 'Primary Code',
      type: 'select',
      required: true,
      options: [
        { value: 'VT', label: 'VT (VIEW TASK)' },
        { value: 'VC', label: 'VC (VIEW CODE)' },
        { value: 'VW', label: 'VW (VIEW WEB)' },
        { value: 'VA', label: 'VA (VIEW APP)' },
        { value: 'VD', label: 'VD (VIEW DEV TOOLS)' },
        { value: 'VR', label: 'VR (VIEW RESPONSE)' },
        { value: 'WC', label: 'WC (WRITE CODE)' },
        { value: 'TC', label: 'TC (TEST CLI)' },
        { value: 'IN', label: 'IN (E INTERACTING)' },
        { value: 'WP', label: 'WP (WRITE PROMPT)' },
        { value: 'ID', label: 'ID (IDLE)' },
      ],
    },
    {
      id: 'secondaryCode',
      label: 'Secondary Code',
      type: 'select',
      required: true,
      dependsOn: 'primaryCode',
      optionsByParent: {
        VT: [{ value: 'NO', label: 'NO (NONE)' }],
        VC: [{ value: 'NO', label: 'NO (NONE)' }],
        VW: [{ value: 'NO', label: 'NO (NONE)' }],
        VA: [{ value: 'NO', label: 'NO (NONE)' }],
        VD: [{ value: 'NO', label: 'NO (NONE)' }],
        VR: [{ value: 'NO', label: 'NO (NONE)' }],
        WC: [
          { value: 'PC', label: 'PC (PASTE CP)' },
          { value: 'AA', label: 'AA (ACCEPT CP SUG)' },
          { value: 'IC', label: 'IC (INSERT VIA CP)' },
          { value: 'PW', label: 'PW (PASTE WEB)' },
          { value: 'ME', label: 'ME (ENTER/EDIT)' },
          { value: 'PS', label: 'PS (PASTE SELF)' },
          { value: 'MS', label: 'MS (MODIFY/DELETE CP SUG)' },
        ],
        TC: [
          { value: 'TR', label: 'TR (RUN TEST)' },
          { value: 'TV', label: 'TV (VIEW TEST)' },
        ],
        IN: [
          { value: 'RQ', label: 'RQ (RESOLVE QUESTION)' },
          { value: 'PP', label: 'PP (PROMPT PARTICIPANT)' },
        ],
        WP: [
          { value: 'EP', label: 'EP (ENTER PROMPT)' },
          { value: 'PT', label: 'PT (PASTE TASK)' },
          { value: 'PP', label: 'PP (PASTE PREV CP)' },
          { value: 'PE', label: 'PE (PASTE ERROR)' },
          { value: 'PC', label: 'PC (ENTER PROMPT AS CODE COMMENT)' },
        ],
        ID: [{ value: 'NO', label: 'NO (NONE)' }],
      },
    },
    {
      id: 'task',
      label: 'Task',
      type: 'select',
      required: true,
      options: [
        { value: 'T1', label: 'Task 1' },
        { value: 'T2', label: 'Task 2' },
        { value: 'T3', label: 'Task 3' },
        { value: 'T4', label: 'Task 4' },
        { value: 'T5', label: 'Task 5' },
        { value: 'T6', label: 'Task 6' },
        { value: 'T7', label: 'Task 7' },
      ],
    },
  ],
  hasComment: true,
};

// Returns options array for a given level given current parent selections.
export function getOptionsForLevel(scheme, levelId, parentValues = {}) {
  const level = scheme.levels.find((l) => l.id === levelId);
  if (!level) return [];

  if (level.type !== 'select') return [];

  if (level.dependsOn) {
    const parentVal = parentValues[level.dependsOn];
    if (!parentVal) return [];
    return (level.optionsByParent && level.optionsByParent[parentVal]) ?? [];
  }

  return level.options ?? [];
}

// Gets the first option value for a level given current parent context.
export function getFirstOption(scheme, levelId, parentValues = {}) {
  const options = getOptionsForLevel(scheme, levelId, parentValues);
  return options.length > 0 ? options[0].value : '';
}

// Returns a map of levelId -> first-option default value for all levels.
export function getDefaultValues(scheme) {
  const defaults = {};
  for (const level of scheme.levels) {
    if (level.type === 'select') {
      defaults[level.id] = getFirstOption(scheme, level.id, defaults);
    } else {
      defaults[level.id] = '';
    }
  }
  return defaults;
}

// Validates a scheme object. Returns [] if valid, otherwise an array of error strings.
export function validateScheme(scheme) {
  const errors = [];

  if (!scheme || typeof scheme !== 'object') {
    return ['Scheme must be an object.'];
  }
  if (!scheme.name || typeof scheme.name !== 'string') errors.push('Missing or invalid "name".');
  if (!scheme.version || typeof scheme.version !== 'string') errors.push('Missing or invalid "version".');
  if (!Array.isArray(scheme.levels) || scheme.levels.length === 0) {
    errors.push('"levels" must be a non-empty array.');
    return errors;
  }

  const ids = new Set();
  for (let i = 0; i < scheme.levels.length; i++) {
    const level = scheme.levels[i];
    const prefix = `Level[${i}]`;

    if (!level.id || typeof level.id !== 'string') {
      errors.push(`${prefix}: missing or invalid "id".`);
    } else if (ids.has(level.id)) {
      errors.push(`${prefix}: duplicate level id "${level.id}".`);
    } else {
      ids.add(level.id);
    }

    if (!level.label || typeof level.label !== 'string') {
      errors.push(`${prefix}: missing or invalid "label".`);
    }

    if (level.type !== 'select' && level.type !== 'text') {
      errors.push(`${prefix}: "type" must be "select" or "text".`);
    }

    if (level.type === 'select') {
      if (level.dependsOn) {
        if (!ids.has(level.dependsOn)) {
          errors.push(`${prefix}: "dependsOn" references unknown level id "${level.dependsOn}".`);
        }
        if (!level.optionsByParent || typeof level.optionsByParent !== 'object') {
          errors.push(`${prefix}: dependent select level must have "optionsByParent".`);
        }
      } else {
        if (!Array.isArray(level.options) || level.options.length === 0) {
          errors.push(`${prefix}: select level must have a non-empty "options" array.`);
        }
      }
    }
  }

  if (typeof scheme.hasComment !== 'boolean') {
    errors.push('"hasComment" must be a boolean.');
  }

  return errors;
}

// Parses a scheme from a JSON string. Returns { scheme, errors }.
export function parseSchemeJSON(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return { scheme: null, errors: [`Invalid JSON: ${e.message}`] };
  }
  const errors = validateScheme(parsed);
  return { scheme: errors.length === 0 ? parsed : null, errors };
}

// Returns the CSV header array for a scheme.
export function schemeToCSVHeaders(scheme) {
  const headers = scheme.levels.map((l) => l.label);
  if (scheme.hasComment) headers.push('Comment');
  return headers;
}

// Converts an annotation object to an ordered array of CSV cell values using the scheme.
export function annotationToCSVRow(annotation, scheme) {
  const row = scheme.levels.map((l) => annotation[l.id] ?? '');
  if (scheme.hasComment) row.push(annotation.comment ?? '');
  return row;
}
