// Build step: writes one HTML file per route (dist/<route>.html) with that page's
// own <title>, description, canonical, Open Graph tags and a short crawlable
// text block. Without this, every URL served the homepage's HTML until the
// JavaScript ran, so Google treated the calculators as duplicates of "/".
import { readFileSync, writeFileSync } from "node:fs";
import { SEO } from "../src/seo.js";
import { CONTENT } from "../src/content.js";

const SITE = "https://www.paisamarg.in";
const ROUTES = ["emi", "prepay", "cardemi", "sip", "fd", "ppf", "fire", "ctc", "tax",
                "about", "contact", "privacy", "disclaimer"];
const CALCS = ["emi", "prepay", "cardemi", "sip", "fd", "ppf", "fire", "ctc", "tax"];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const template = readFileSync("dist/index.html", "utf8");

const swap = (html, re, replacement) => {
  if (!re.test(html)) throw new Error(`prerender: pattern not found ${re}`);
  return html.replace(re, replacement);
};

const nav = CALCS.map((k) => `<li><a href="/${k}">${esc(SEO[k].title.split(" — ")[0])}</a></li>`).join("");

function page(key) {
  const meta = SEO[key];
  const url = key === "home" ? `${SITE}/` : `${SITE}/${key}`;
  const h1 = meta.title.split(" | ")[0];
  let html = template;
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);
  html = swap(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(meta.description)}" />`);
  html = swap(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  html = swap(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(meta.title)}" />`);
  html = swap(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(meta.description)}" />`);
  html = swap(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = swap(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(meta.title)}" />`);
  html = swap(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(meta.description)}" />`);
  // Crawlable content inside #root; React replaces it on load.
  const c = CONTENT[key];
  const body = c
    ? `<p>${esc(c.intro)}</p>` +
      c.sections.map((sec) => `<h2>${esc(sec.h)}</h2>` + sec.p.map((t) => `<p>${esc(t)}</p>`).join("")).join("") +
      `<h2>Common questions</h2>` +
      c.faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")
    : `<p>${esc(meta.description)}</p>`;
  html = swap(html, /<div id="root"><\/div>/,
    `<div id="root"><main style="max-width:480px;margin:0 auto;padding:24px 20px;font-family:sans-serif;color:#0f172a">` +
    `<h1>${esc(h1)}</h1>${body}` +
    `<nav aria-label="Calculators"><ul>${nav}</ul></nav></main></div>`);
  // FAQ structured data for pages that have FAQs
  if (c?.faqs?.length) {
    const ld = { "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
    html = swap(html, /<\/head>/, `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>\n  </head>`);
  }
  return html;
}

writeFileSync("dist/index.html", page("home"));
for (const r of ROUTES) writeFileSync(`dist/${r}.html`, page(r));
console.log(`prerender: wrote index.html + ${ROUTES.length} route pages`);
