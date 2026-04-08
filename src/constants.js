export const PRIMARY_CODES = [
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
];

export const SECONDARY_CODES = {
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
};

export function DEFAULT_SECONDARY(primaryValue) {
  const options = SECONDARY_CODES[primaryValue];
  return options ? options[0] : null;
}
