// Point-annotation event codes (Section 1.3 of the coding book).
// Events are logged at a single timestamp and do not end the current state.
export const EVENT_CODES = [
  { value: 'EA', label: 'EA — Approve Agent Action',  description: 'Click approve/confirm on a terminal command or tool call requested by Copilot. Typically during AW.' },
  { value: 'ER', label: 'ER — Reject Agent Action',   description: 'Click reject/deny on a terminal command or tool call requested by Copilot. Typically during AW.' },
  { value: 'ED', label: 'ED — Accept Diff Chunk',     description: 'Accept a specific code change (hunk or file) during review. Typically during RV.' },
  { value: 'EX', label: 'EX — Reject Diff Chunk',     description: 'Reject/revert a specific code change during review. Typically during RV.' },
  { value: 'EU', label: 'EU — Undo Agent Step',       description: 'Use undo to revert a step taken by Copilot (e.g. Undo Last Edit button). Typically during RV/WC.' },
  { value: 'EM', label: 'EM — Switch Copilot Mode',   description: 'Switch between Ask, Edit, Agent, or Plan mode. Log which mode is selected. Any state.' },
  { value: 'EH', label: 'EH — Agent Handoff',         description: 'Hand off a task from one agent type to another (e.g. local → cloud, invoke subagent). Typically WP/AW.' },
  { value: 'ES', label: 'ES — Stop AI Generation',    description: 'Click stop button while AI is generating. May end an AW state.' },
  { value: 'EK', label: 'EK — Use Custom Skill',      description: 'Type / and invoke a customized skill in the Copilot prompt. Typically during WP.' },
  { value: 'ET', label: 'ET — Monitor Token Usage',   description: 'Open or check the token usage panel to monitor AI resource consumption. Any state.' },
];

export const DEFAULT_SCHEME = {
  name: 'Yunhan Expert Annotation Scheme',
  version: '2.0.0',
  description: 'Annotation scheme for coding expert screen-recording sessions. 14 primary states · 14 secondaries · 10 events.',
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
        { value: 'WP', label: 'WP (WRITE PROMPT)' },
        { value: 'VR', label: 'VR (VIEW COPILOT RESPONSE)' },
        { value: 'AW', label: 'AW (AWAIT AGENT EXECUTION)' },
        { value: 'RV', label: 'RV (REVIEW AGENT/EDIT OUTPUT)' },
        { value: 'WC', label: 'WC (WRITE CODE)' },
        { value: 'TC', label: 'TC (TEST CLI)' },
        { value: 'IN', label: 'IN (INTERACT WITH EXPERIMENTER)' },
        { value: 'CI', label: 'CI (CONFIGURE AGENT INSTRUCTIONS)' },
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
        WP: [
          { value: 'PT', label: 'PT (PASTE TASK MATERIALS)' },
          { value: 'PP', label: 'PP (PASTE PREVIOUS RESPONSE)' },
          { value: 'PE', label: 'PE (PASTE ERROR)' },
          { value: 'EP', label: 'EP (ENTER PROMPT)' },
          { value: 'QA', label: 'QA (ANSWER COPILOT QUERY)' },
        ],
        VR: [{ value: 'NO', label: 'NO (NONE)' }],
        AW: [{ value: 'NO', label: 'NO (NONE)' }],
        RV: [{ value: 'NO', label: 'NO (NONE)' }],
        WC: [
          { value: 'ME', label: 'ME (MANUAL EDIT)' },
          { value: 'AC', label: 'AC (ACCEPT COPILOT CODE)' },
          { value: 'MC', label: 'MC (MODIFY COPILOT CODE)' },
          { value: 'PW', label: 'PW (PASTE FROM WEB)' },
          { value: 'PS', label: 'PS (PASTE FROM SELF)' },
        ],
        TC: [
          { value: 'TR', label: 'TR (RUN TEST)' },
          { value: 'TV', label: 'TV (VIEW TEST RESULTS)' },
        ],
        IN: [
          { value: 'RQ', label: 'RQ (RESOLVE QUESTION)' },
          { value: 'PP', label: 'PP (PROMPT PARTICIPANT)' },
        ],
        CI: [{ value: 'NO', label: 'NO (NONE)' }],
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
