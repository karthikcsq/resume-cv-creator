This app is a simple Next.js UI for sending resume JSON to a backend and downloading generated Resume/CV PDFs.

## Getting Started

Environment variables (optional):

- BACKEND_URL: defaults to `https://resume-builder-m9v5.onrender.com`

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

Usage:

1. Paste or edit the JSON payload in the textarea.
2. Click "Render" to POST to `/api/render` which proxies to the backend `/render_json` using body `{ data: <your-json> }`.
3. When a request_id is returned, the "Download Resume" and "Download CV" buttons are enabled.
4. Click a download button to stream the PDF via `/api/download?id=<id>&type=resume|cv`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

You can deploy to any Node hosting. On Vercel/Netlify, set the `BACKEND_URL` env if you want to point elsewhere.
