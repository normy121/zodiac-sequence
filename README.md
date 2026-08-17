# Zodiac Sequence Tracker — Web Edition

A standalone English-only web version of the Zodiac Sequence Tracker.

## Features

- Choose 3 unique initial zodiac signs.
- Each sequence contains all 12 signs, with no repeats inside a sequence.
- Up to 5 sequences.
- A new sequence is unlocked after the previous sequence is complete.
- For the first 2 positions of a new sequence, the previous sequence's last 2 signs are temporarily unavailable.
- Rolling “Current three days” display.
- Automatic browser storage via `localStorage`.
- Export/import JSON backup.
- Responsive layout for desktop and mobile browsers.

## Run locally

You can simply double-click `index.html` and open it in a modern browser.

For a more production-like local test, run a simple local server from this folder, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Publish online

This is a static site. Upload the four files in this folder to any static host such as GitHub Pages, Cloudflare Pages, Netlify, or Vercel.

No server or database is required. User data stays in that user's browser unless they export a backup file.
