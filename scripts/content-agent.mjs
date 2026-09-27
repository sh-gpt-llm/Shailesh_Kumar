#!/usr/bin/env node
/**
 * Content Research Agent
 *
 * Picks one of four rotating themes, uses an AI model with live web search to
 * research the topic and draft a full article, then writes it into
 * src/content/writing/ as a DRAFT (draft: true) for human review in the CMS
 * before it ever appears on the live site.
 *
 * Requires OPENAI_API_KEY as an environment variable (set as a GitHub repo
 * secret; see the workflow file that calls this script).
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

const THEMES = [
  {
    name: "Enterprise Architecture & Governance",
    category: "Architecture",
    angle:
      "TOGAF-aligned design authority, architecture guardrails, portfolio rationalization, or reference architecture patterns for large regulated enterprises",
  },
  {
    name: "AI Strategy & Agentic AI",
    category: "Strategy",
    angle:
      "generative AI / agentic AI operating models, moving GenAI pilots to governed production, Responsible AI governance, or AI investment triage frameworks",
  },
  {
    name: "Digital Core & ERP Modernization",
    category: "Pattern",
    angle:
      "SAP HANA / digital core transformation, multi-ERP harmonization, cloud-native modernization patterns, or carve-out technology separation",
  },
  {
    name: "Management & Business Consulting",
    category: "Consulting",
    angle:
      "technology-driven business strategy, executive advisory frameworks, or how enterprise architecture intersects with broader management consulting",
  },
];

const STATE_FILE = path.join(process.cwd(), "scripts", ".content-agent-state.json");

async function getNextThemeIndex() {
  try {
    const raw = await readFile(STATE_FILE, "utf-8");
    const state = JSON.parse(raw);
    return (state.lastThemeIndex + 1) % THEMES.length;
  } catch {
    return 0;
  }
}

async function saveThemeIndex(index) {
  await writeFile(STATE_FILE, JSON.stringify({ lastThemeIndex: index }, null, 2));
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

async function researchAndDraft(theme) {
  const systemPrompt = `You are a ghostwriter for Shailesh Kumar, a Senior Principal Enterprise Architect at GSK with 18+ years across telecom, healthcare, and life sciences. You write sharp, evidence-based thought-leadership articles for his personal brand site. Voice: confident, precise, no fluff, grounded in real frameworks and real-world examples. Always research current, real information using web search before writing - cite concrete facts, recent developments, or named frameworks/companies where relevant.`;

  const userPrompt = `Research and write one original, well-grounded article (700-1000 words) on the theme "${theme.name}", specifically about ${theme.angle}. The body must be Markdown with ## headings, no title heading (title is separate), and can include inline markdown links to real sources found via research.`;

  const schema = {
    type: "object",
    properties: {
      title: { type: "string", description: "Punchy and specific, under 90 chars" },
      description: { type: "string", description: "1-2 sentences, under 200 chars" },
      tags: { type: "array", items: { type: "string" }, description: "3 to 5 relevant tags" },
      body: { type: "string", description: "Full article body in Markdown" },
    },
    required: ["title", "description", "tags", "body"],
    additionalProperties: false,
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      tools: [{ type: "web_search_preview" }],
      max_output_tokens: 4096,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "article",
          schema,
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  // Responses API: find the text output from the message item.
  const messageItem = data.output?.find((item) => item.type === "message");
  const textPart = messageItem?.content?.find((c) => c.type === "output_text");
  const rawText = textPart?.text ?? data.output_text;

  if (!rawText) {
    throw new Error(
      `No text output returned from OpenAI Responses API. Full response: ${JSON.stringify(data).slice(0, 2000)}`
    );
  }

  try {
    return JSON.parse(rawText);
  } catch (err) {
    throw new Error(
      `Failed to parse JSON from model output: ${err.message}\nRaw output (first 2000 chars): ${rawText.slice(0, 2000)}`
    );
  }
}

async function main() {
  const themeIndex = await getNextThemeIndex();
  const theme = THEMES[themeIndex];
  console.log(`Researching theme: ${theme.name} (category: ${theme.category})`);

  const article = await researchAndDraft(theme);
  const slug = slugify(article.title);
  const today = new Date().toISOString().slice(0, 10);

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(article.title)}`,
    `description: ${JSON.stringify(article.description)}`,
    `date: ${today}`,
    `category: ${JSON.stringify(theme.category)}`,
    `tags: ${JSON.stringify(article.tags ?? [])}`,
    "featured: false",
    "draft: true",
    "---",
    "",
  ].join("\n");

  const filePath = path.join(process.cwd(), "src", "content", "writing", `${today}-${slug}.md`);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, frontmatter + article.body + "\n");

  await saveThemeIndex(themeIndex);

  console.log(`Draft written to: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
