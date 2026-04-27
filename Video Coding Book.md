**VideoCoding Schemes**

# **1\. Definition of States/Events**

## **1.1 Primary States**

Primary states are duration-coded spans representing the developer’s main activity. Subject to the 3-second rule unless explicitly exempted. Each state below includes a definition, start/stop criteria, and boundary or source notes.

### **VT — View Task Materials**

**Definition:** The participant is reading or scrolling through the task/assignment instructions, including the Swagger API documentation page. This state captures time spent understanding what the task requires.

**Start:** Cursor/focus is in the Task Materials window or Swagger API page; participant verbally reads instructions; Task Materials window is maximized or resized.

**Stop:** Task materials or Swagger page go out of view; start criteria for another state are satisfied.

### **VC — View Code**

**Definition:** The participant is browsing, searching, or reading code in the editor or the VS Code file explorer. This captures code comprehension activity outside of active writing or AI interaction.

**Start:** Cursor/focus is in the Code Window or file explorer; participant verbally reads code; code window is maximized or resized.

**Stop:** Code window goes out of view; start criteria for another state are satisfied.

***Boundary:*** If Copilot is actively streaming edits into the editor (agent or edit mode running), code as AW, not VC. Once Copilot stops and the developer reads the resulting code without an active review flow (no accept/reject affordances visible), this becomes VC.

### **VW — View Web Materials**

**Definition:** The participant is browsing external web resources in a browser window for information gathering (e.g., Stack Overflow, documentation sites).

**Start:** Cursor/focus is in a web browser window (not one running the application or Copilot docs within the IDE); participant verbally reads web content; web browser window is maximized or resized.

**Stop:** Web browser goes out of view; start criteria for another state are satisfied.

### **VA — View App**

**Definition:** The participant is viewing the running web application in the browser to check behavior, UI, or the results of code changes.

**Start:** Participant launches the app (e.g., types npm run start) or switches focus to the running application in the browser.

**Stop:** Application view goes out of view; the console window where the app was started goes out of view; start criteria for another state are satisfied.

### **VD — View Dev Tools**

**Definition:** The participant is viewing browser developer tools (e.g., console, network tab, elements inspector).

**Start:** Browser dev tools are launched or come into focus.

**Stop:** Cursor/focus leaves browser dev tools.

### **WP — Write Prompt**

**Definition:** The participant is composing a prompt or instruction for Copilot in the chat panel, regardless of the active mode (Ask, Edit, Agent, or Plan). This includes typing, pasting task text, pasting errors, pasting code snippets, or any other input into the Copilot chat/prompt interface prior to submission. See Section 5.2 for secondary categories that distinguish the source of prompt content.

**Start:** Participant begins typing, highlighting, or pasting content into the Copilot prompt/chat input area.

**Stop:** Participant submits the prompt; start criteria for another state are satisfied.

### **VR — View Copilot Response**

**Definition:** The participant is reading Copilot’s response in the chat panel. This applies to Ask mode answers and Edit mode previews where the response appears in the chat window.

**Start:** Copilot response appears, and the cursor/focus is in the chat window; participant verbalizes Copilot response content.

**Stop:** Cursor leaves chat window; participant begins a new prompt; start criteria for another state are satisfied.

***Boundary:*** VR covers reading text responses in the chat panel. For reviewing code diffs proposed by the agent or edit mode, use RV. For watching Copilot actively execute in agent mode, use AW.

### **AW — Await Agent Execution**

**Definition:** The participant has submitted an instruction in Agent mode (or Edit mode), and Copilot is autonomously executing: reading files, proposing edits, running terminal commands, and self-correcting errors. The participant is watching this process. This also covers agent-driven testing (e.g., agent running Playwright or terminal test scripts).

**Start:** Participant submits a prompt in Agent or Edit mode, and Copilot begins autonomous execution (file reads, edits streaming, terminal commands running).

**Stop:** Copilot finishes execution and stops streaming; participant intervenes to cancel or redirect (Event ES); start criteria for another state are satisfied.

***Note:*** Approval/rejection of terminal commands during AW is logged as an Event (EA/ER on Tier 2\) and does not end the AW state. This state subsumes Doc 1’s TA (Test through Agentic Workflow) when the agent is running tests autonomously.

### **RV — Review Agent/Edit Output**

**Definition:** After Copilot completes execution (agent or edit mode), the participant reviews the proposed changes. This includes examining diffs, reading through modified files, and deciding whether to accept or reject changes.

**Start:** Copilot has completed its execution, and the participant is examining the resulting diffs, changed files, or proposed edits.

**Stop:** Participant accepts/rejects all changes and moves on; participant begins a new prompt; participant starts manually editing the output (transitions to WC); start criteria for another state are satisfied.

***Boundary:*** RV applies when the participant is in a review flow after agent/edit mode execution, with accept/reject affordances visible. VC applies when browsing code outside of this review context. Individual accept/reject actions on specific hunks or files during RV are logged as Events (ED/EX on Tier 2\) and do not end the RV state.

### **WC — Write Code**

**Definition:** The participant is writing or modifying code in the editor. Use the secondary categories in Section 5.2 to distinguish the source and nature of the code being written.

**Start:** Participant begins typing, pasting, or accepting code in the code editor.

**Stop:** Participant stops editing, and the cursor moves away from the editor; start criteria for another state are satisfied.

### **TC — Test CLI**

**Definition:** The participant is running or viewing tests from the command line. This covers manually initiated testing only; for agent-driven testing, use AW.

**Start:** Participant begins typing a test command in the terminal.

**Stop:** Participant’s cursor leaves the test/terminal window; start criteria for another state are satisfied.

### **IN — Interact with Experimenter**

**Definition:** The participant is interacting with the experimenter. This category covers only human-to-human interaction (questions, think-aloud prompts), not Copilot dialogue (which falls under WP/QA).

**Start:** Participant or experimenter initiates a conversation.

**Stop:** Either participant or experimenter ends the conversation; start criteria for another state are satisfied.

### **CI — Configure Agent Instructions**

**Definition:** The participant is writing or editing files that configure Copilot’s behavior. This includes custom instruction files (e.g., .github/copilot-instructions.md, prompt files, agent configuration files, MCP server settings) that shape how Copilot responds in subsequent interactions.

**Start:** Participant opens and begins editing an agent instruction or configuration file.

**Stop:** Participant saves/closes the file; start criteria for another state are satisfied.

***Note:*** Only code CI if the participant spends sustained time writing/editing instruction files. Brief settings changes (toggling a checkbox, switching a model) are Events, not states.

### **ID — Idle**

**Definition:** No active coding, viewing, or interaction activity is occurring. The participant is not engaged in any observable task-related behavior.

**Start:** Any of the above stop criteria are met, and no other start criteria are satisfied.

**Stop:** Any of the above start criteria are satisfied.

## **1.2 Secondary Categories**

Secondary categories refine the primary state. When a secondary applies, annotate as Primary-Secondary (e.g., WP-PT, WC-ME). If no secondary fits, use the primary code alone.

### **Write Prompt (WP) Secondaries**

**PT — Paste Task Materials**  
**Definition:** The participant copies/pastes content from the task instructions or Swagger API documentation into the Copilot prompt.

**Start:** Participant starts highlighting the item to copy/paste from the task materials.

**Stop:** Participant submits the prompt.

**PP — Paste Previous Response**  
**Definition:** The participant copies/pastes content from a previous Copilot response into a new prompt.

**Start:** Participant starts highlighting an item in the Copilot chat history.

**Stop:** Participant submits the prompt.

**PE — Paste Error**  
**Definition:** The participant copies/pastes content from testing error messages or console output into the Copilot prompt.

**Start:** Participant starts highlighting the error message text.

**Stop:** Participant submits the prompt.

**EP — Enter Prompt**  
**Definition:** The participant is manually typing or editing the prompt text without copy/paste. This includes typing a free-form question or copying a code snippet directly from the editor into the prompt.

**Start:** Participant starts typing into the prompt window.

**Stop:** Participant submits the prompt.

**QA — Answer Copilot Query**  
**Definition:** In Plan mode, Copilot may ask clarifying questions before proceeding. When the participant is responding to these AI-initiated questions, code as QA. The participant is still providing input to Copilot, but the directionality is reversed (AI-initiated rather than human-initiated).

**Start:** Participant begins responding to a Copilot-initiated clarifying question.

**Stop:** Participant submits the response; start criteria for another state are satisfied.

### **Write Code (WC) Secondaries**

**ME — Manual Edit**  
**Definition:** The participant is typing, deleting, or editing code themselves without direct AI assistance. Applies to pre-existing code or code the participant authored.

**Start:** Participant begins typing original code.

**Stop:** Participant stops typing, and the cursor moves or scrolls; start criteria for another state are satisfied.

***Boundary:*** If editing pre-existing code or code the participant wrote themselves, code as ME. If editing code that Copilot generated, code as MC. When in doubt, default to ME.

**AC — Accept Copilot Code**  
**Definition:** The participant incorporates AI-generated code into the editor by any mechanism. This includes: accepting an autocomplete ghost-text suggestion (tab), accepting a Next Edit Suggestion (tab-navigate then tab-accept), pasting code from Copilot chat, clicking Accept on an inline edit suggestion, clicking “Keep all”, or clicking the “+” button to stage changes.

**Start:** Participant initiates acceptance (tab key, paste, click accept, click Keep all, etc.).

**Stop:** AI-generated code is incorporated; suggestion visual changes from gray to committed text; changes are staged; cursor settles.

***3-second exemption:*** AC may have a duration of just one keystroke. It is not subject to the 3-second rule.

**MC — Modify Copilot Code**  
**Definition:** The participant manually edits code that was generated by Copilot. This applies to any Copilot-generated code the participant modifies after acceptance, regardless of how it was originally incorporated (autocomplete, agent mode, edit mode, chat paste) or how recently it was accepted.

**Start:** Participant begins editing code that was produced by Copilot.

**Stop:** Participant stops editing; start criteria for another state are satisfied.

***Boundary:*** If editing code that Copilot generated in this session, code as MC. If editing code the participant wrote or pre-existing code not generated by Copilot in this session, code as ME.

**PW — Paste from Web**  
**Definition:** The participant copies code from a web browser and pastes it into the code editor.

**Start:** Participant copies code from a web browser.

**Stop:** Participant pastes into the code window.

**PS — Paste from Self**  
**Definition:** The participant copies code from within the current project and pastes it elsewhere in the project.

**Start:** Participant copies code from within the current project.

**Stop:** Participant pastes into the code project.

### **Test CLI (TC) Secondaries**

**TR — Run Test**  
**Definition:** The participant is typing and executing a test command from the command line.

**Start:** Participant begins typing a test command in the terminal.

**Stop:** Tests complete their execution.

**TV — View Test Results**  
**Definition:** The participant is reading the test output after execution completes.

**Start:** Tests completed, and the cursor is on the test output window.

**Stop:** Cursor leaves the test window.

### **Interact with Experimenter (IN) Secondaries**

**RQ — Resolve Question**  
**Definition:** The participant asks the experimenter a question about the task, environment, or procedure.

**Start:** Participant starts asking a question.

**Stop:** Either participant or experimenter ends the conversation.

**PP — Prompt Participant**  
**Definition:** The experimenter prompts the participant (e.g., think-aloud reminder, time check, procedural instruction).

**Start:** Experimenter starts prompting the participant.

**Stop:** Either participant or experimenter ends the conversation.

## **1.3 Events**

Events are point annotations logged at a single timestamp. They mark discrete decisions or actions that occur within a state without ending it. Events are not subject to the 3-second rule. Log the timestamp and the event code.

**EA — Approve Agent Action**  
**Definition:** Participant clicks approve/confirm on a terminal command or tool call requested by Copilot during agent execution. Typically occurs during AW.

**ER — Reject Agent Action**

**Definition:** Participant clicks reject/deny on a terminal command or tool call requested by Copilot. Typically occurs during AW.

**ED — Accept Diff Chunk**  
**Definition:** Participant accepts a specific code change (hunk or file) during review. Typically occurs during RV.

**EX — Reject Diff Chunk**  
**Definition:** Participant rejects/reverts a specific code change during review. Typically occurs during RV.

**EU — Undo Agent Step**  
**Definition:** Participant uses undo to revert a step taken by Copilot (e.g., Undo Last Edit button). The AI rolls back the changes made.

**EM — Switch Copilot Mode**  
**Definition:** Participant switches between Ask, Edit, Agent, or Plan mode. Log which mode is selected. This updates the parallel Copilot Mode context variable.

**EH — Agent Handoff**  
**Definition:** Participant hands off a task from one agent type to another (e.g., local to cloud agent, invoking a subagent).

**ES — Stop AI Generation**  
**Definition:** Participant clicks the stop button in the prompt box while AI is generating. AI stops generating. This may end an AW state.

**EK — Use Custom Skill**  
**Definition:** Participant types / and invokes a customized skill in the Copilot prompt. Occurs during WP.

**ET — Monitor Token Usage**  
**Definition:** Participant opens or checks the token usage panel to monitor AI resource consumption.

## **5.5 Summary: All Annotations at a Glance**

**14 Primary States  ·  14 Secondaries  ·  10 Events**

### **Table A — Primary States (Tier 1, Duration-Coded)**

| Code | Name | Start Criteria | Stop Criteria |
| :---- | :---- | :---- | :---- |
| **VT** | View Task Materials | Cursor/focus in Task Materials or Swagger; verbally reading instructions; window maximized/resized | Task materials go out of view; start criteria for another state satisfied |
| **VC** | View Code | Cursor/focus in Code Window or file explorer; verbally reading code; code window maximized/resized | Code window goes out of view; start criteria for another state satisfied. Boundary: if Copilot streaming edits → AW |
| **VW** | View Web Materials | Cursor/focus in web browser (not running app); verbally reading web content; browser maximized/resized | Web browser goes out of view; start criteria for another state satisfied |
| **VA** | View App | Participant launches app or switches focus to running application in browser | App view goes out of view; start criteria for another state satisfied |
| **VD** | View Dev Tools | Browser dev tools launched or come into focus | Cursor/focus leaves browser dev tools |
| **WP** | Write Prompt | Participant begins typing, highlighting, or pasting into the Copilot prompt/chat input | Participant submits the prompt; start criteria for another state satisfied |
| **VR** | View Copilot Response | Copilot response appears and cursor/focus is in chat window; participant verbalizes response | Cursor leaves chat; new prompt begins. Boundary: diffs → RV; execution → AW |
| **AW** | Await Agent Execution | Prompt submitted in Agent/Edit mode; Copilot begins autonomous execution (file reads, edits streaming, terminal commands) | Copilot finishes and stops streaming; participant cancels/redirects (ES); start criteria for another state satisfied |
| **RV** | Review Agent/Edit Output | Copilot completed execution; participant examining diffs, changed files, or proposed edits | All changes accepted/rejected; new prompt begins; participant starts manual editing (→ WC); start criteria for another state satisfied |
| **WC** | Write Code | Participant begins typing, pasting, or accepting code in the code editor | Participant stops editing and cursor moves away; start criteria for another state satisfied |
| **TC** | Test CLI | Participant begins typing a test command in the terminal | Cursor leaves test/terminal window; start criteria for another state satisfied |
| **IN** | Interact with Experimenter | Participant or experimenter initiates a conversation | Either party ends the conversation; start criteria for another state satisfied |
| **CI** | Configure Agent Instructions | Participant opens and begins editing an agent instruction or configuration file | Participant saves/closes file; start criteria for another state satisfied. Note: brief toggles are Events, not CI |
| **ID** | Idle | Any stop criteria met and no other start criteria satisfied | Any start criteria for another state satisfied |

### **Table B — Secondary Categories (Tier 1, Duration-Coded)**

Annotate as Parent-Secondary (e.g., WP-PT, WC-AC). If no secondary fits, use the primary code alone.

| Parent | Code | Name | Start Criteria | Stop Criteria |
| :---- | :---- | :---- | :---- | :---- |
| **WP** | **PT** | Paste Task Materials | Highlighting item to copy from task materials | Prompt submitted |
| **WP** | **PP** | Paste Previous Response | Highlighting item in Copilot chat history | Prompt submitted |
| **WP** | **PE** | Paste Error | Highlighting error message text | Prompt submitted |
| **WP** | **EP** | Enter Prompt | Participant starts typing into prompt window | Prompt submitted |
| **WP** | **QA** | Answer Copilot Query | Participant begins responding to Copilot-initiated clarifying question | Response submitted; start criteria for another state satisfied |
| **WC** | **ME** | Manual Edit | Participant begins typing original code (no AI assistance) | Stops typing, cursor moves/scrolls; start criteria for another state satisfied. Boundary: Copilot code → MC |
| **WC** | **AC** | Accept Copilot Code | Initiates acceptance (tab, paste, click Accept, Keep All, \+). 3s exemption | Code incorporated; suggestion turns from gray to committed text; cursor settles |
| **WC** | **MC** | Modify Copilot Code | Begins editing code produced by Copilot (any mechanism, any time after acceptance) | Stops editing; start criteria for another state satisfied. Boundary: pre-existing code → ME |
| **WC** | **PW** | Paste from Web | Copies code from web browser | Pastes into code window |
| **WC** | **PS** | Paste from Self | Copies code from within the current project | Pastes into the code project |
| **TC** | **TR** | Run Test | Begins typing test command in terminal | Tests complete their execution |
| **TC** | **TV** | View Test Results | Tests completed and cursor on test output window | Cursor leaves test window |
| **IN** | **RQ** | Resolve Question | Participant starts asking a question | Either party ends the conversation |
| **IN** | **PP** | Prompt Participant | Experimenter starts prompting the participant | Either party ends the conversation |

### **Table C — Events (Tier 2, Point Annotations)**

Events are logged at a single timestamp. They do not interrupt or end states. Log the event code and the state in which it occurs.

| Code | Name | Description | Typical State |
| :---- | :---- | :---- | :---- |
| **EA** | Approve Agent Action | Click approve/confirm on a terminal command or tool call requested by Copilot | AW |
| **ER** | Reject Agent Action | Click reject/deny on a terminal command or tool call requested by Copilot | AW |
| **ED** | Accept Diff Chunk | Accept a specific code change (hunk or file) during review | RV |
| **EX** | Reject Diff Chunk | Reject/revert a specific code change during review | RV |
| **EU** | Undo Agent Step | Use undo to revert a step taken by Copilot (e.g., Undo Last Edit button) | RV / WC |
| **EM** | Switch Copilot Mode | Switch between Ask, Edit, Agent, or Plan mode. Log which mode is selected | Any |
| **EH** | Agent Handoff | Hand off task from one agent type to another (e.g., local to cloud, invoke subagent) | WP / AW |
| **ES** | Stop AI Generation | Click stop button while AI is generating. May end an AW state | AW |
| **EK** | Use Custom Skill | Type / and invoke a customized skill in the Copilot prompt | WP |
| **ET** | Monitor Token Usage | Open or check the token usage panel to monitor AI resource consumption | Any |

