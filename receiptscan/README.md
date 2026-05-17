# 🧾 ReceiptScan

**AI-powered receipt extractor — Gemini Vision + Vercel serverless, zero backend setup.**

Upload a receipt photo and Gemini 2.5 Flash automatically pulls out the merchant name, date, total, line items, tax, payment method, and invoice number. Review, edit, and save locally.

---

## Project Structure

```
receiptscan/
├── api/
│   └── extract.js      ← Vercel serverless function (Gemini call lives here)
├── public/
│   └── index.html      ← Full frontend (no API key inside)
├── vercel.json         ← Routing config
├── .gitignore
└── README.md
```

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create receiptscan --public --push
```

### 2. Import on Vercel

Go to [vercel.com/new](https://vercel.com/new) → import your GitHub repo.

### 3. Add the environment variable

Before clicking Deploy, go to **Environment Variables** and add:

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | your Gemini API key |

> The key is **never** in your code or git history — Vercel injects it server-side at runtime.

### 4. Deploy

Click **Deploy**. Your live URL will be something like `https://receiptscan.vercel.app`.

---

## Local Development

To run locally with the serverless function working, use the Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Then create a `.env.local` file (already in `.gitignore`):

```
GEMINI_API_KEY=your-key-here
```

---

## How It Works

1. User uploads a receipt image in the browser
2. The image is base64-encoded client-side and sent to `/api/extract`
3. The Vercel serverless function forwards it to the Gemini Vision API using the secret key
4. Gemini returns structured JSON — merchant, date, total, line items, etc.
5. The form is pre-filled; user reviews, edits if needed, and saves to `localStorage`

---

## Tech Stack

- **Frontend** — Vanilla HTML/CSS/JS, no framework
- **AI** — [Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) via Google Generative Language API
- **Hosting** — [Vercel](https://vercel.com) (serverless function + static file serving)
- **Fonts** — DM Sans + DM Serif Display via Google Fonts
