"use client";
import { useMemo, useState } from "react";

type ShowOn = Array<"cv" | "resume">;

type LinkItem = { label: string; url: string };
type EducationItem = {
  institution: string;
  location: string;
  degree: string;
  gpa: string;
  dates: string;
};
type SkillItem = { category: string; bullets: string[]; show_on: ShowOn };
type ExperienceItem = {
  role: string;
  company: string;
  location: string;
  work_type: string;
  start_date: string;
  end_date: string;
  show_on: ShowOn;
  bullets: string[];
};
type ProjectItem = {
  title: string;
  tools: string;
  date: string;
  link: string;
  show_on: ShowOn;
  bullets: string[];
};

type ResumeData = {
  name: string;
  contact: string[];
  links: LinkItem[];
  education: EducationItem[];
  skills: SkillItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
};

const defaultData: ResumeData = {
  name: "John Doe",
  contact: ["john.doe@example.com", "555-123-4567"],
  links: [
    { label: "GitHub", url: "https://github.com/johndoe" },
    { label: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
  ],
  education: [
    {
      institution: "Stanford University",
      location: "Stanford, CA",
      degree: "B.S. of Computer Science",
      gpa: "4.0",
      dates: "Aug 2024 - May 2028 (Expected)",
    },
  ],
  skills: [
    {
      category: "AI / ML",
      bullets: [
        "LLM pipelines and RAG (LangChain, retrieval, evaluation)",
      ],
  show_on: ["cv", "resume"] as ShowOn,
    },
  ],
  experience: [
    {
      role: "Software Engineer",
      company: "Google",
      location: "Mountain View, CA",
      work_type: "Internship / Part-Time",
      start_date: "Jun 2025",
      end_date: "Present",
  show_on: ["cv", "resume"] as ShowOn,
      bullets: ["Coded YouTube", "Worked on Google Search"],
    },
  ],
  projects: [
    {
      title: "ChatGPT",
      tools: "Brain",
      date: "Ongoing",
      link: "https://chatgpt.com/",
  show_on: ["cv", "resume"] as ShowOn,
      bullets: ["Built ChatGPT"],
    },
  ],
};

export default function Home() {
  const [data, setData] = useState<ResumeData>(defaultData);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const prettyError = useMemo(() => error ?? null, [error]);

  const updateField = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const toggleShowOn = (arr: ShowOn, target: "cv" | "resume") =>
    arr.includes(target) ? arr.filter((x) => x !== target) : [...arr, target];

  async function download(type: "resume" | "cv") {
    setBusy(true);
    setError(null);
    try {
      // Strip whitespace-only bullets and empty items
      const payload: ResumeData = {
        ...data,
        contact: data.contact.filter((c) => c.trim() !== ""),
        links: data.links.filter((l) => l.label.trim() || l.url.trim()),
        education: data.education.filter(
          (e) => e.institution.trim() || e.degree.trim() || e.dates.trim()
        ),
        skills: data.skills
          .map((s) => ({
            ...s,
            bullets: s.bullets.filter((b) => b.trim() !== ""),
          }))
          .filter((s) => s.category.trim() || s.bullets.length > 0),
        experience: data.experience
          .map((x) => ({ ...x, bullets: x.bullets.filter((b) => b.trim()) }))
          .filter((x) => x.role.trim() || x.company.trim()),
        projects: data.projects
          .map((p) => ({ ...p, bullets: p.bullets.filter((b) => b.trim()) }))
          .filter((p) => p.title.trim()),
      };

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Render failed");
    } finally {
      setBusy(false);
    }
  }

  function normalizeShowOn(v: unknown): ShowOn {
    if (Array.isArray(v)) {
      const filtered = v.filter((x): x is "cv" | "resume" => x === "cv" || x === "resume");
      return (filtered.length ? filtered : ["cv", "resume"]) as ShowOn;
    }
    return ["cv", "resume"] as ShowOn;
  }

  function asString(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback;
  }

  function asStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.map((x) => asString(x, "")).filter(Boolean) : [];
  }

  function normalizeLinks(value: unknown): LinkItem[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((x) => ({ label: asString(x?.label, ""), url: asString(x?.url, "") }))
      .filter((x) => x.label || x.url);
  }

  function normalizeEducation(value: unknown): EducationItem[] {
    if (!Array.isArray(value)) return [];
    return value.map((e) => ({
      institution: asString(e?.institution, ""),
      location: asString(e?.location, ""),
      degree: asString(e?.degree, ""),
      gpa: asString(e?.gpa, ""),
      dates: asString(e?.dates, ""),
    }));
  }

  function normalizeSkills(value: unknown): SkillItem[] {
    if (!Array.isArray(value)) return [];
    return value.map((s) => ({
      category: asString(s?.category, ""),
      bullets: asStringArray(s?.bullets),
      show_on: normalizeShowOn(s?.show_on),
    }));
  }

  function normalizeExperience(value: unknown): ExperienceItem[] {
    if (!Array.isArray(value)) return [];
    return value.map((x) => ({
      role: asString(x?.role, ""),
      company: asString(x?.company, ""),
      location: asString(x?.location, ""),
      work_type: asString(x?.work_type, ""),
      start_date: asString(x?.start_date, ""),
      end_date: asString(x?.end_date, ""),
      show_on: normalizeShowOn(x?.show_on),
      bullets: asStringArray(x?.bullets),
    }));
  }

  function normalizeProjects(value: unknown): ProjectItem[] {
    if (!Array.isArray(value)) return [];
    return value.map((p) => ({
      title: asString(p?.title, ""),
      tools: asString(p?.tools, ""),
      date: asString(p?.date, ""),
      link: asString(p?.link, ""),
      show_on: normalizeShowOn(p?.show_on),
      bullets: asStringArray(p?.bullets),
    }));
  }

  function normalizeData(input: unknown): ResumeData {
    const obj = (typeof input === "object" && input) ? (input as Record<string, unknown>) : {};
    return {
      name: asString(obj.name, ""),
      contact: asStringArray(obj.contact),
      links: normalizeLinks(obj.links),
      education: normalizeEducation(obj.education),
      skills: normalizeSkills(obj.skills),
      experience: normalizeExperience(obj.experience),
      projects: normalizeProjects(obj.projects),
    };
  }

  return (
    <div className="min-h-screen p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Resume/CV Builder</h1>
          <div className="flex gap-2">
            <button
              className="btn"
              onClick={() => setData(defaultData)}
              disabled={busy}
            >
              Load Sample
            </button>
            <button
              className="btn"
              onClick={() =>
                setData({
                  name: "",
                  contact: [""],
                  links: [{ label: "", url: "" }],
                  education: [
                    {
                      institution: "",
                      location: "",
                      degree: "",
                      gpa: "",
                      dates: "",
                    },
                  ],
                  skills: [
                    { category: "", bullets: [""], show_on: ["cv", "resume"] as ShowOn },
                  ],
                  experience: [
                    {
                      role: "",
                      company: "",
                      location: "",
                      work_type: "",
                      start_date: "",
                      end_date: "",
                      show_on: ["cv", "resume"] as ShowOn,
                      bullets: [""],
                    },
                  ],
                  projects: [
                    {
                      title: "",
                      tools: "",
                      date: "",
                      link: "",
                      show_on: ["cv", "resume"] as ShowOn,
                      bullets: [""],
                    },
                  ],
                })
              }
              disabled={busy}
            >
              Clear All
            </button>
            <button
              className="btn"
              onClick={() => setShowImport((v) => !v)}
              disabled={busy}
            >
              {showImport ? "Close Import" : "Import JSON"}
            </button>
          </div>
        </header>

        {showImport && (
          <div className="card shadow-soft p-4 space-y-3">
            <div className="text-sm muted">Paste your JSON to auto-fill the form.</div>
            <textarea
              className="w-full min-h-[180px] input font-mono text-xs"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`{
  "name": "John Doe",
  ...
}`}
            />
            <div className="flex gap-2 justify-end">
              <button className="btn" onClick={() => setShowImport(false)}>Cancel</button>
              <button
                className="btn btn-accent"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(importText);
                    const normalized = normalizeData(parsed);
                    setData(normalized);
                    setShowImport(false);
                  } catch (e: unknown) {
                    setError(e instanceof Error ? e.message : "Invalid JSON");
                  }
                }}
              >
                Load JSON
              </button>
            </div>
          </div>
        )}

        {/* Personal */}
  <Section title="Personal">
          <div className="grid sm:grid-cols-2 gap-3">
            <TextInput
              label="Full name"
              value={data.name}
              onChange={(v) => updateField("name", v)}
              placeholder="John Doe"
            />
          </div>
          <ArrayOfTextInputs
            label="Contact methods"
            items={data.contact}
            addLabel="Add contact"
            placeholder="email / phone / location"
            onChange={(items) => updateField("contact", items)}
          />
          <ArrayOfPairs
            label="Links"
            aLabel="Label"
            bLabel="URL"
            items={data.links}
            addLabel="Add link"
            placeholderA="Label"
            placeholderB="https://example.com/your-page"
            headerActions={
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    const exists = data.links.some(
                      (l) => l.label.trim().toLowerCase() === "linkedin"
                    );
                    if (!exists) updateField("links", [...data.links, { label: "LinkedIn", url: "" }]);
                  }}
                >
                  Add LinkedIn
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    const exists = data.links.some(
                      (l) => l.label.trim().toLowerCase() === "github"
                    );
                    if (!exists) updateField("links", [...data.links, { label: "GitHub", url: "" }]);
                  }}
                >
                  Add GitHub
                </button>
              </div>
            }
            onChange={(items) => updateField("links", items)}
          />
        </Section>

        {/* Education */}
        <Section title="Education">
          <Repeater
            items={data.education}
            onChange={(items) => updateField("education", items)}
            emptyItem={{
              institution: "",
              location: "",
              degree: "",
              gpa: "",
              dates: "",
            }}
            render={(item, setItem) => (
              <div className="grid sm:grid-cols-2 gap-3">
                <TextInput
                  label="Institution"
                  value={item.institution}
                  onChange={(v) => setItem({ ...item, institution: v })}
                />
                <TextInput
                  label="Location"
                  value={item.location}
                  onChange={(v) => setItem({ ...item, location: v })}
                />
                <TextInput
                  label="Degree"
                  value={item.degree}
                  onChange={(v) => setItem({ ...item, degree: v })}
                />
                <TextInput
                  label="GPA"
                  value={item.gpa}
                  onChange={(v) => setItem({ ...item, gpa: v })}
                />
                <TextInput
                  label="Dates"
                  value={item.dates}
                  onChange={(v) => setItem({ ...item, dates: v })}
                  placeholder="Aug 2024 - May 2028"
                />
              </div>
            )}
          />
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <Repeater
            items={data.skills}
            onChange={(items) => updateField("skills", items)}
            emptyItem={{ category: "", bullets: [""], show_on: ["cv", "resume"] as ShowOn }}
            render={(item, setItem) => (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <TextInput
                    label="Category"
                    value={item.category}
                    onChange={(v) => setItem({ ...item, category: v })}
                  />
                  <ShowOnToggles
                    value={item.show_on}
                    onChange={(v) => setItem({ ...item, show_on: v })}
                  />
                </div>
                <ArrayOfTextInputs
                  label="Bullets"
                  items={item.bullets}
                  addLabel="Add bullet"
                  placeholder="e.g., Pandas, NumPy, PostgreSQL"
                  onChange={(bullets) => setItem({ ...item, bullets })}
                />
              </div>
            )}
          />
        </Section>

        {/* Experience */}
        <Section title="Experience">
          <Repeater
            items={data.experience}
            onChange={(items) => updateField("experience", items)}
            emptyItem={{
              role: "",
              company: "",
              location: "",
              work_type: "",
              start_date: "",
              end_date: "",
              show_on: ["cv", "resume"] as ShowOn,
              bullets: [""],
            }}
            render={(item, setItem) => (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <TextInput
                    label="Role"
                    value={item.role}
                    onChange={(v) => setItem({ ...item, role: v })}
                  />
                  <TextInput
                    label="Company"
                    value={item.company}
                    onChange={(v) => setItem({ ...item, company: v })}
                  />
                  <TextInput
                    label="Location"
                    value={item.location}
                    onChange={(v) => setItem({ ...item, location: v })}
                  />
                  <TextInput
                    label="Work Type"
                    value={item.work_type}
                    onChange={(v) => setItem({ ...item, work_type: v })}
                    placeholder="Internship / Full-Time"
                  />
                  <TextInput
                    label="Start Date"
                    value={item.start_date}
                    onChange={(v) => setItem({ ...item, start_date: v })}
                    placeholder="Jun 2025"
                  />
                  <TextInput
                    label="End Date"
                    value={item.end_date}
                    onChange={(v) => setItem({ ...item, end_date: v })}
                    placeholder="Present"
                  />
                  <ShowOnToggles
                    value={item.show_on}
                    onChange={(v) => setItem({ ...item, show_on: v })}
                  />
                </div>
                <ArrayOfTextInputs
                  label="Bullets"
                  items={item.bullets}
                  addLabel="Add bullet"
                  placeholder="Accomplishment or impact"
                  onChange={(bullets) => setItem({ ...item, bullets })}
                />
              </div>
            )}
          />
        </Section>

        {/* Projects */}
        <Section title="Projects">
          <Repeater
            items={data.projects}
            onChange={(items) => updateField("projects", items)}
            emptyItem={{
              title: "",
              tools: "",
              date: "",
              link: "",
              show_on: ["cv", "resume"] as ShowOn,
              bullets: [""],
            }}
            render={(item, setItem) => (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <TextInput
                    label="Title"
                    value={item.title}
                    onChange={(v) => setItem({ ...item, title: v })}
                  />
                  <TextInput
                    label="Tools"
                    value={item.tools}
                    onChange={(v) => setItem({ ...item, tools: v })}
                    placeholder="Typescript, Next.js, Tailwind"
                  />
                  <TextInput
                    label="Date"
                    value={item.date}
                    onChange={(v) => setItem({ ...item, date: v })}
                    placeholder="2025"
                  />
                  <TextInput
                    label="Link"
                    value={item.link}
                    onChange={(v) => setItem({ ...item, link: v })}
                    placeholder="https://example.com"
                  />
                  <ShowOnToggles
                    value={item.show_on}
                    onChange={(v) => setItem({ ...item, show_on: v })}
                  />
                </div>
                <ArrayOfTextInputs
                  label="Bullets"
                  items={item.bullets}
                  addLabel="Add bullet"
                  placeholder="What you built or achieved"
                  onChange={(bullets) => setItem({ ...item, bullets })}
                />
              </div>
            )}
          />
        </Section>

        {/* Actions */}
    <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => download("resume")}
            disabled={busy}
      className="btn btn-accent disabled:opacity-50"
          >
            Download Resume
          </button>
          <button
            onClick={() => download("cv")}
            disabled={busy}
      className="btn btn-accent disabled:opacity-50"
          >
            Download CV
          </button>
          <JsonPreview data={data} />
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-4 p-5 card shadow-soft">{children}</div>
    </section>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6v-.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function ArrayOfTextInputs({
  label,
  items,
  onChange,
  addLabel,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          className="btn"
          onClick={() => onChange([...items, ""]) }
        >
          {addLabel}
        </button>
      </div>
      <div className="space-y-2">
        {items.map((v, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              className="flex-1 input"
              value={v}
              placeholder={placeholder}
              onChange={(e) => {
                const next = items.slice();
                next[idx] = e.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              className="btn"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              aria-label="Remove"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrayOfPairs({
  label,
  items,
  onChange,
  addLabel,
  aLabel,
  bLabel,
  placeholderA,
  placeholderB,
  headerActions,
}: {
  label: string;
  items: Array<{ label: string; url: string }>;
  onChange: (items: Array<{ label: string; url: string }>) => void;
  addLabel: string;
  aLabel: string;
  bLabel: string;
  placeholderA?: string;
  placeholderB?: string;
  headerActions?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {headerActions}
          <button
            type="button"
            className="btn"
            onClick={() => onChange([...items, { label: "", url: "" }])}
          >
            {addLabel}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="grid sm:grid-cols-2 gap-2 items-end">
            <TextInput
              label={aLabel}
              value={it.label}
              onChange={(v) => {
                const next = items.slice();
                next[idx] = { ...next[idx], label: v };
                onChange(next);
              }}
              placeholder={placeholderA}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 input"
                value={it.url}
                onChange={(e) => {
                  const next = items.slice();
                  next[idx] = { ...next[idx], url: e.target.value };
                  onChange(next);
                }}
                placeholder={placeholderB}
              />
              <button
                type="button"
                className="btn"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                aria-label="Remove link"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShowOnToggles({
  value,
  onChange,
}: {
  value: ShowOn;
  onChange: (v: ShowOn) => void;
}) {
  const has = (k: "cv" | "resume") => value.includes(k);
  const toggle = (k: "cv" | "resume") =>
    onChange(has(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">Show on</span>
      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={has("resume")}
          onChange={() => toggle("resume")}
        />
        Resume
      </label>
      <label className="flex items-center gap-1 text-sm">
        <input type="checkbox" checked={has("cv")} onChange={() => toggle("cv")} />
        CV
      </label>
    </div>
  );
}

function Repeater<T>({
  items,
  onChange,
  render,
  emptyItem,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, setItem: (item: T) => void) => React.ReactNode;
  emptyItem: T;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="card p-3 shadow-soft">
            <div className="flex justify-end items-center mb-2">
              <button
                type="button"
                className="btn"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                aria-label="Remove item"
                title="Remove"
              >
                <TrashIcon />
              </button>
            </div>
            {render(item, (updated) => {
              const next = items.slice();
              next[idx] = updated;
              onChange(next);
            })}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-accent"
        onClick={() => onChange([...items, JSON.parse(JSON.stringify(emptyItem))])}
      >
        Add Item
      </button>
    </div>
  );
}

function JsonPreview({ data }: { data: unknown }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-auto">
      <button
        type="button"
        className="btn"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Hide JSON" : "Preview JSON"}
      </button>
      {open && (
        <pre className="mt-3 max-h-72 overflow-auto text-xs p-3 card shadow-soft">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
