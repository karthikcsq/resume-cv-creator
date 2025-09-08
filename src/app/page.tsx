"use client";
import { useState, useMemo } from "react";

const sample = `{
  "name": "John Doe",
  "contact": [
    "john.doe@example.com",
    "555-123-4567"
  ],
  "links": [
    { "label": "GitHub", "url": "https://github.com/johndoe" },
    { "label": "LinkedIn", "url": "https://linkedin.com/in/johndoe" },
    { "label": "Portfolio", "url": "https://www.johndoe.com" }
  ],
  "education": [
    {
      "institution": "Stanford University",
      "location": "Stanford, CA",
      "degree": "B.S. of Computer Science",
      "gpa": "4.0",
      "dates": "Aug 2024 - May 2028 (Expected)"
    }
  ],
  "skills": [
    {
      "category": "AI / ML",
      "bullets": [
        "LLM pipelines and RAG (LangChain, retrieval, evaluation)"
      ],
      "show_on": ["cv", "resume"]
    },
    {
      "category": "Data & Tools",
      "bullets": ["Pandas, NumPy, PostgreSQL"],
      "show_on": ["cv", "resume"]
    },
    {
      "category": "Languages & Frameworks",
      "bullets": ["Python, JavaScript (React)"],
      "show_on": ["cv", "resume"]
    }
  ],
  "experience": [
    {
      "role": "Software Engineer",
      "company": "Google",
      "location": "Mountain View, CA",
      "work_type": "Internship / Part-Time",
      "start_date": "Jun 2025",
      "end_date": "Present",
      "show_on": ["cv", "resume"],
      "bullets": ["Coded YouTube", "Worked on Google Search"]
    }
  ],
  "projects": [
    {
      "title": "ChatGPT",
      "tools": "Brain",
      "date": "Ongoing",
      "link": "https://chatgpt.com/",
      "show_on": ["cv", "resume"],
      "bullets": ["Built ChatGPT"]
    }
  ]
}`;

export default function Home() {
  const [jsonText, setJsonText] = useState<string>(sample);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prettyError = useMemo(() => {
    if (!error) return null;
    try {
      const obj = JSON.parse(error);
      return JSON.stringify(obj, null, 2);
    } catch {
      return error;
    }
  }, [error]);

  async function download(type: "resume" | "cv") {
    setBusy(true);
    setError(null);
    try {
      const payload = JSON.parse(jsonText);
      const res = await fetch(`/api/render?type=${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      const href = URL.createObjectURL(blob);
      a.href = href;
      a.download = `${type}_output.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e: any) {
      setError(e?.message || "Render failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen p-6 sm:p-10 bg-white text-black">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Resume/CV Renderer</h1>

        <div className="grid grid-cols-1 gap-4">
          <label className="text-sm font-medium">Resume JSON</label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full min-h-[320px] p-3 rounded-md border border-gray-300 font-mono text-sm"
            spellCheck={false}
          />
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => download("resume")}
            disabled={busy}
            className="px-4 py-2 rounded-md border disabled:opacity-50"
          >
            Download Resume
          </button>
          <button
            onClick={() => download("cv")}
            disabled={busy}
            className="px-4 py-2 rounded-md border disabled:opacity-50"
          >
            Download CV
          </button>
        </div>

        {prettyError && (
          <pre className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-xs whitespace-pre-wrap">
            {prettyError}
          </pre>
        )}
      </div>
    </div>
  );
}
