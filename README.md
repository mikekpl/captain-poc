# Captain PDF Parser

A Next.js application for parsing PDFs, querying a Captain knowledge collection, and running AI-powered Q&A over batches of PDFs — all powered by **@captain-sdk/pdf-parser** and **Gemini AI**.

---

## Features

| Feature | Description |
|---|---|
| **PDF Parser** | Upload a single billing PDF and extract charges, amounts, and account details into a structured dashboard |
| **Bill Comparison** | Select two parsed bills from history to compare charges side by side |
| **Knowledge Query** | Search a Captain collection and get a Gemini-synthesized answer with source references |
| **Batch Parse** | Select a local folder of PDFs, parse them all at once, then ask Gemini questions across the full set |

---

## Prerequisites

- Node.js 18.3 or later
- A **Captain API key** — [captain.dev](https://captain.dev)
- A **Gemini API key** — [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then fill in your keys:

```env
CAPTAIN_API_KEY=your_captain_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

> `.env.local` is gitignored — never commit API keys.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
app/
  page.tsx              # PDF Parser & bill history
  query/page.tsx        # Knowledge Query (Captain + Gemini)
  batch/page.tsx        # Batch PDF parsing + AI Q&A
  api/
    parse/route.ts      # POST: parse a single PDF
    batch-parse/        # POST: parse a folder of PDFs
    batch-query/        # POST: ask Gemini about parsed PDFs
    captain/query/      # POST: query Captain collection + Gemini
    health/             # GET: health check

src/
  components/           # UI components (BillDashboard, QueryUI, BatchUploadZone, …)
  hooks/                # useParseBill, useParseBatch, useQueryForm, useBillHistory
  lib/
    parser.ts           # WASM PDF parser wrapper
    extractor/          # Bill extraction logic (charges, amounts, comparisons)
    captainTypes.ts     # Captain API types
```

---

## Usage

### PDF Parser

1. Go to **PDF Parser** (home page)
2. Drop or browse a billing PDF
3. Extracted charges and account details appear in the dashboard
4. Bills are saved to local browser storage for later comparison

### Knowledge Query

1. Go to **Knowledge Query**
2. Enter your Captain **Collection ID**
3. Type a question — results are fetched from the collection and summarized by Gemini

### Batch Parse

1. Go to **Batch Parse**
2. Click **Choose Directory** and select a folder containing PDFs
3. Click **Parse All PDFs** — all PDFs are parsed server-side in parallel
4. Once parsed, type a question in the query box and click **Ask**
5. Gemini answers using the full text of all parsed documents as context

---

## Running Tests

```bash
npm test
```

Tests use [Vitest](https://vitest.dev) with jsdom and @testing-library/react.

---

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router)
- [@captain-sdk/pdf-parser](https://www.npmjs.com/package/@captain-sdk/pdf-parser) — WASM-based PDF layout extraction
- [Google Gemini](https://ai.google.dev) (`gemini-3.6-flash`) via `@google/genai`
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Vitest](https://vitest.dev) + [@testing-library/react](https://testing-library.com)
