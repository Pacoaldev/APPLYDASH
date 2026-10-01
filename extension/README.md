# ApplyDash Browser Extension

Chrome/Edge extension to capture job postings and save them to your ApplyDash dashboard.

## Icons

Extension icons are generated from `public/applydashlogo.svg` (Chrome requires PNG):

```bash
npm install --save-dev @resvg/resvg-js
node scripts/generate-extension-icons.mjs
```

Then reload the extension in `chrome://extensions`.

## Install (developer mode)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder in this repo

## Usage

1. Log in to your ApplyDash instance in the browser
2. Open a job posting (LinkedIn, Indeed, InfoJobs, etc.)
3. Click the ApplyDash extension icon
4. Set your ApplyDash URL (e.g. `http://localhost:3000` or your Vercel URL)
5. Review auto-detected fields and click **Save to ApplyDash**

## API

Uses `POST /api/jobs` with session cookies (`credentials: include`).
