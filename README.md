# Video Annotation Tool

A browser-based tool for annotating screen-recording videos with behavioral codes. Built as a replacement for a Google Sheets workflow.

## What it does

You load an MP4 video and watch it. When a behavioral segment ends, you press `E` (or click Mark End), fill in the annotation codes in the modal that appears, and move on. The next segment starts automatically from one second after the last end time. When you are done, you export a CSV in the same format used by the original sheets workflow.

Sessions are saved to the browser's IndexedDB as you work, so you can close the tab and resume later.

## Getting started

```bash
cd annotation-app
npm install
npm run dev
```

Then open `http://localhost:5173`.

To build for production:

```bash
npm run build
```

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `E` | Mark end of current segment |
| `Space` | Play / pause |
| `Esc` | Close annotation modal |

## Annotation workflow

1. Drop an MP4 onto the video area, or click "Load Video".
2. Watch the video. When a segment ends, press `E`. The video pauses.
3. Fill in the codes in the modal. The time range is pre-filled.
4. Submit. The next segment start is set automatically.
5. Repeat until the video is fully coded.
6. Click "Export CSV" in the top bar and give the file a name.

## CSV format

```
Time Start,Time End,Primary Code,Secondary Code,Task,Comment
0:00:00,0:00:10,WC (WRITE CODE),ME (ENTER/EDIT),Task 2,
```

Primary and secondary codes are stored as full label strings. The format matches the original annotation CSV used in this project.

## Annotation scheme

The default scheme encodes 11 primary codes (VT, VC, VW, VA, VD, VR, WC, TC, IN, WP, ID) with secondary codes that vary by primary. Tasks run from Task 1 to Task 7.

You can replace this with your own scheme:

- Click the layers icon in the top bar to open the Scheme panel.
- Click "Build / Edit" to open the scheme builder, where you can add levels, define options, and set up dependencies between levels (e.g. secondary codes that vary by primary code).
- Or click "Load Scheme" to load a JSON file you prepared elsewhere.
- Click "Download Sample" to get an example JSON file showing the format.

A scheme JSON looks like this:

```json
{
  "name": "My Scheme",
  "version": "1.0",
  "description": "...",
  "hasComment": true,
  "levels": [
    {
      "id": "primaryCode",
      "label": "Primary Code",
      "type": "select",
      "required": true,
      "options": [
        { "value": "A", "label": "A (ACTION)" }
      ]
    },
    {
      "id": "secondaryCode",
      "label": "Secondary Code",
      "type": "select",
      "required": true,
      "dependsOn": "primaryCode",
      "optionsByParent": {
        "A": [
          { "value": "X", "label": "X (EXAMPLE)" }
        ]
      }
    }
  ]
}
```

Schemes are saved to `localStorage` and persist across sessions.

## Sessions

The database icon in the top bar opens the Sessions panel. From there you can:

- See all saved sessions with their video name, annotation count, and last modified time.
- Rename a session by clicking its name.
- Load a previous session (you will still need to re-load the video file).
- Delete sessions you no longer need.

## Importing a CSV

Click "Import CSV" to load an existing annotations file. The video will seek to the last annotated position so you can continue from where the file left off.

## Tech stack

- React 19 + Vite
- Custom CSS design system (light and dark mode via `data-theme`)
- Lucide React for icons
- IndexedDB for session persistence (no server required)
