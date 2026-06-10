#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  Eduooz — Question Paper Page Generator
 *  Usage:  node question-papers/generate.js
 *  Run from the project root (d:\Eduooz\eduooz\)
 * ═══════════════════════════════════════════════════════════
 *
 *  Reads   → question-papers/papers.json
 *  Reads   → question-papers/_templates/{paper,exam,year}.html
 *
 *  Writes  → question-papers/{slug}/index.html
 *            question-papers/{exam-slug}/index.html
 *            question-papers/{exam-slug}/{year}/index.html
 *            question-papers/index.html          (library hub)
 *            sitemap-papers.xml                  (append to your main sitemap)
 *
 *  No npm dependencies — only Node.js built-in modules.
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT       = path.resolve(__dirname, '..');
const QP_DIR     = __dirname;
const TPL_DIR    = path.join(QP_DIR, '_templates');
const PAPERS_JSON = path.join(QP_DIR, 'papers.json');

// ── Load data ─────────────────────────────────────────────────────────────────
if (!fs.existsSync(PAPERS_JSON)) {
    console.error('❌  papers.json not found. Run from project root.');
    process.exit(1);
}
const data   = JSON.parse(fs.readFileSync(PAPERS_JSON, 'utf8'));
const { meta, papers, exams = [] } = data;
const BASE   = meta.baseUrl.replace(/\/$/, '');
const today  = new Date().toISOString().split('T')[0];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Simple {{KEY}} replacement — keys may contain spaces, nested not supported */
function fill(tpl, vars) {
    // Block tags: {{#IF_KEY}}...{{/IF_KEY}} — show when vars[KEY] is truthy
    tpl = tpl.replace(/\{\{#IF_(\w+)\}\}([\s\S]*?)\{\{\/IF_\1\}\}/g, (_, key, inner) => {
        return vars[key] ? inner : '';
    });
    // Variable substitution
    return tpl.replace(/\{\{([^}]+)\}\}/g, (_, k) => {
        const v = vars[k.trim()];
        return v !== undefined && v !== null ? String(v) : '';
    });
}

function mkdirp(p) {
    fs.mkdirSync(p, { recursive: true });
}

function readTpl(name) {
    const f = path.join(TPL_DIR, name + '.html');
    if (!fs.existsSync(f)) { console.error(`❌  Template missing: ${f}`); process.exit(1); }
    return fs.readFileSync(f, 'utf8');
}

function writeFile(filePath, content) {
    mkdirp(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
    const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
    console.log(`  ✅  ${rel}`);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
}

function jsonLD(obj) {
    return JSON.stringify(obj, null, 0);
}

function uniqueSorted(arr) {
    return [...new Set(arr)].sort().reverse();
}

// ── Schema builders ────────────────────────────────────────────────────────────

function breadcrumbSchema(items) {
    return jsonLD({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url
        }))
    });
}

function faqSchema(faqs) {
    if (!faqs || faqs.length === 0) return '';
    return jsonLD({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer }
        }))
    });
}

function webpageSchema(title, desc, url) {
    return jsonLD({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description: desc,
        url: url,
        publisher: { '@type': 'Organization', name: 'Eduooz International Academy', url: BASE }
    });
}

// ── Paper card HTML (used in exam & year pages) ───────────────────────────────

function paperListCard(p) {
    const diffBadge = p.difficulty
        ? `<span class="pp-diff-chip pp-diff-${p.difficulty}">${cap(p.difficulty)}</span>`
        : '';
    return `<a href="${BASE}/question-papers/${p.slug}/" class="pp-list-card">
  <div class="pp-list-icon"><i class="fa-solid fa-file-pdf"></i></div>
  <div class="pp-list-info">
    <div class="pp-list-top">
      <span class="pp-list-year">${p.year}</span>
      ${p.shift ? `<span class="pp-list-shift">${p.shift}</span>` : ''}
      ${diffBadge}
    </div>
    <h3 class="pp-list-title">${p.shortTitle || p.title}</h3>
    <p class="pp-list-meta">${[
        p.questionCount ? p.questionCount + ' Questions' : '',
        p.duration || '',
        p.pages ? p.pages + ' pages' : ''
    ].filter(Boolean).join(' · ')}</p>
  </div>
  <div class="pp-list-arrow"><i class="fa-solid fa-arrow-right"></i></div>
</a>`;
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

// ── Related paper card HTML ────────────────────────────────────────────────────

function relatedCard(p) {
    return `<a href="${BASE}/question-papers/${p.slug}/" class="pp-related-card">
  <span class="pp-rel-year">${p.year}</span>
  <span class="pp-rel-shift">${p.shift || ''}</span>
  <span class="pp-rel-title">${p.shortTitle || p.title}</span>
  <i class="fa-solid fa-arrow-right"></i>
</a>`;
}

// ── Subject breakdown bars ─────────────────────────────────────────────────────

function breakdownBars(breakdown) {
    if (!breakdown || breakdown.length === 0) return '';
    return breakdown.map(b => `
  <div class="pp-breakdown-item">
    <div class="pp-bk-label">
      <span>${b.subject}</span>
      <span>${b.percent}% (${b.questions} Qs)</span>
    </div>
    <div class="pp-bk-track"><div class="pp-bk-fill" style="width:${b.percent}%"></div></div>
  </div>`).join('');
}

// ── Topic tags HTML ────────────────────────────────────────────────────────────

function topicTags(topics) {
    if (!topics || topics.length === 0) return '';
    return topics.map(t => `<span class="pp-topic-tag">${t}</span>`).join('');
}

// ── FAQ HTML ───────────────────────────────────────────────────────────────────

function faqHtml(faqs) {
    if (!faqs || faqs.length === 0) return '';
    return faqs.map(f => `
  <div class="pp-faq-item">
    <button class="pp-faq-q">${f.question}<i class="fa-solid fa-chevron-down"></i></button>
    <div class="pp-faq-a"><p>${f.answer}</p></div>
  </div>`).join('');
}

// ═════════════════════════════════════════════════════════════════════════════
//  1. INDIVIDUAL PAPER PAGES
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n📄  Generating individual paper pages…');
const paperTpl = readTpl('paper');
const slugIndex = {};  // slug → paper object
papers.forEach(p => { slugIndex[p.slug] = p; });

papers.forEach(p => {
    const pageUrl  = `${BASE}/question-papers/${p.slug}/`;
    const examUrl  = `${BASE}/question-papers/${p.examSlug}/`;
    const yearUrl  = `${BASE}/question-papers/${p.examSlug}/${p.year}/`;
    const diffColor = { easy: '#10b981', moderate: '#f59e0b', hard: '#ef4444' }[p.difficulty] || '#64748b';

    const relatedHtml = (p.relatedPapers || [])
        .map(s => slugIndex[s])
        .filter(Boolean)
        .map(relatedCard)
        .join('');

    const vars = {
        // Meta
        TITLE:             p.title,
        META_DESCRIPTION:  p.description,
        META_KEYWORDS:     (p.keywords || []).join(', '),
        CANONICAL_URL:     pageUrl,
        OG_TITLE:          p.title,
        OG_DESCRIPTION:    p.description,
        BASE_URL:          BASE,
        // Schemas
        BREADCRUMB_SCHEMA: breadcrumbSchema([
            { name: 'Home',             url: BASE + '/' },
            { name: 'Question Papers',  url: BASE + '/question-papers/' },
            { name: p.exam,             url: examUrl },
            { name: p.year,             url: yearUrl },
            { name: p.shortTitle || p.shift || p.title, url: pageUrl }
        ]),
        FAQ_SCHEMA:        faqSchema(p.faqs),
        WEBPAGE_SCHEMA:    webpageSchema(p.title, p.description, pageUrl),
        // Hero
        H1:                p.h1 || p.title,
        EXAM_NAME:         p.exam,
        EXAM_URL:          examUrl,
        YEAR:              p.year,
        YEAR_URL:          yearUrl,
        SHIFT:             p.shift || '',
        EDITION:           p.edition || '',
        DATE_FORMATTED:    formatDate(p.date),
        QUESTION_COUNT:    p.questionCount || '',
        DURATION:          p.duration || '',
        PAGES:             p.pages || '',
        DIFFICULTY:        cap(p.difficulty || ''),
        DIFFICULTY_CLASS:  p.difficulty || '',
        DIFFICULTY_COLOR:  diffColor,
        // Content
        TOPICS:            topicTags(p.topics),
        SUBJECT_BREAKDOWN: breakdownBars(p.subjectWiseBreakdown),
        PREP_NOTES:        p.preparationNotes || '',
        PDF_URL:           p.pdfUrl || '#enroll',
        // Conditionals
        IF_DIFFICULTY:     p.difficulty ? '1' : '',
        IF_QS:             p.questionCount ? '1' : '',
        IF_DUR:            p.duration ? '1' : '',
        IF_PDF:            p.pdfUrl ? '1' : '',
        IF_NO_PDF:         !p.pdfUrl ? '1' : '',
        IF_TOPICS:         (p.topics && p.topics.length) ? '1' : '',
        IF_PREP:           p.preparationNotes ? '1' : '',
        IF_BREAKDOWN:      (p.subjectWiseBreakdown && p.subjectWiseBreakdown.length) ? '1' : '',
        IF_RELATED:        relatedHtml ? '1' : '',
        IF_FAQ:            (p.faqs && p.faqs.length) ? '1' : '',
        // Blocks
        RELATED_PAPERS:    relatedHtml,
        BREAKDOWN_BARS:    breakdownBars(p.subjectWiseBreakdown),
        FAQ_HTML:          faqHtml(p.faqs),
        // Share
        WHATSAPP_SHARE:    encodeURIComponent(`${p.title} – Download free PDF: ${pageUrl}`),
        TWITTER_SHARE:     encodeURIComponent(`${p.title} – Free PDF via @Eduooz`)
    };

    const html = fill(paperTpl, vars);
    writeFile(path.join(QP_DIR, p.slug, 'index.html'), html);
});

// ═════════════════════════════════════════════════════════════════════════════
//  2. EXAM LANDING PAGES
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n📚  Generating exam landing pages…');
const examTpl = readTpl('exam');
const examSlugs = [...new Set(papers.map(p => p.examSlug))];

examSlugs.forEach(examSlug => {
    const examPapers = papers.filter(p => p.examSlug === examSlug);
    const examMeta   = exams.find(e => e.slug === examSlug) || {};
    const examName   = examPapers[0]?.exam || examSlug;
    const examUrl    = `${BASE}/question-papers/${examSlug}/`;
    const years      = uniqueSorted(examPapers.map(p => p.year));
    const yearRange  = years.length > 1 ? `${years[years.length-1]}–${years[0]}` : years[0] || '';

    const yearTabs = years.map(y =>
        `<a href="${BASE}/question-papers/${examSlug}/${y}/" class="pp-year-tab-link">${y}</a>`
    ).join('');

    const vars = {
        EXAM_NAME:        examName,
        EXAM_SLUG:        examSlug,
        EXAM_DESCRIPTION: examMeta.description || `Download all ${examName} previous year question papers with answer keys. Free PDF for nursing officer exam preparation.`,
        CANONICAL_URL:    examUrl,
        BASE_URL:         BASE,
        YEAR_TABS:        yearTabs,
        PAPER_CARDS:      examPapers.map(paperListCard).join(''),
        PAPER_COUNT:      examPapers.length,
        YEAR_RANGE:       yearRange,
        BREADCRUMB_SCHEMA: breadcrumbSchema([
            { name: 'Home',            url: BASE + '/' },
            { name: 'Question Papers', url: BASE + '/question-papers/' },
            { name: examName,          url: examUrl }
        ]),
        WEBPAGE_SCHEMA: webpageSchema(
            `${examName} Previous Year Question Papers`,
            `Download all ${examName} previous year question papers with answer keys.`,
            examUrl
        )
    };

    const html = fill(examTpl, vars);
    writeFile(path.join(QP_DIR, examSlug, 'index.html'), html);
});

// ═════════════════════════════════════════════════════════════════════════════
//  3. YEAR PAGES
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n📅  Generating year pages…');
const yearTpl = readTpl('year');

examSlugs.forEach(examSlug => {
    const examPapers = papers.filter(p => p.examSlug === examSlug);
    const examName   = examPapers[0]?.exam || examSlug;
    const examUrl    = `${BASE}/question-papers/${examSlug}/`;
    const years      = uniqueSorted(examPapers.map(p => p.year));

    years.forEach(year => {
        const yearPapers = examPapers.filter(p => p.year === year);
        const yearUrl    = `${BASE}/question-papers/${examSlug}/${year}/`;
        const otherYears = years.filter(y => y !== year)
            .map(y => `<a href="${BASE}/question-papers/${examSlug}/${y}/" class="pp-oy-link">${y}</a>`)
            .join('');

        const vars = {
            EXAM_NAME:        examName,
            EXAM_SLUG:        examSlug,
            EXAM_URL:         examUrl,
            YEAR:             year,
            CANONICAL_URL:    yearUrl,
            BASE_URL:         BASE,
            PAPER_CARDS:      yearPapers.map(paperListCard).join(''),
            OTHER_YEAR_LINKS: otherYears,
            BREADCRUMB_SCHEMA: breadcrumbSchema([
                { name: 'Home',            url: BASE + '/' },
                { name: 'Question Papers', url: BASE + '/question-papers/' },
                { name: examName,          url: examUrl },
                { name: year,              url: yearUrl }
            ])
        };

        const html = fill(yearTpl, vars);
        writeFile(path.join(QP_DIR, examSlug, year, 'index.html'), html);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
//  4. QUESTION PAPERS HUB INDEX PAGE
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n🏠  Generating question papers hub index…');

const hubExamCards = examSlugs.map(slug => {
    const ep = papers.filter(p => p.examSlug === slug);
    const name = ep[0]?.exam || slug;
    const years = uniqueSorted(ep.map(p => p.year));
    return `<a href="${BASE}/question-papers/${slug}/" class="pp-hub-card">
  <div class="pp-hub-icon"><i class="fa-solid fa-file-lines"></i></div>
  <div class="pp-hub-info">
    <h2 class="pp-hub-name">${name}</h2>
    <p class="pp-hub-meta">${ep.length} Papers · ${years.join(', ')}</p>
  </div>
  <i class="fa-solid fa-arrow-right pp-hub-arrow"></i>
</a>`;
}).join('');

const hubHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Previous Year Question Papers — Free PDF Download | Eduooz</title>
<meta name="description" content="Download free previous year question papers for AIIMS NORCET, DHA, HAAD and more nursing exams. PDFs with answer keys.">
<link rel="canonical" href="${BASE}/question-papers/">
<script type="application/ld+json">${breadcrumbSchema([
    { name: 'Home', url: BASE + '/' },
    { name: 'Question Papers', url: BASE + '/question-papers/' }
])}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link rel="stylesheet" href="${BASE}/assets/css/header-footer.css">
<link rel="stylesheet" href="${BASE}/assets/css/courses-landing.css">
<link rel="stylesheet" href="${BASE}/assets/css/paper-page.css">
</head>
<body class="paper-page-body">
<div id="header-container"></div>
<nav class="pp-breadcrumb-bar" aria-label="Breadcrumb">
  <div class="container">
    <ol class="pp-breadcrumb">
      <li><a href="${BASE}/">Home</a></li>
      <li aria-current="page">Question Papers</li>
    </ol>
  </div>
</nav>
<section class="pp-hero">
  <div class="container">
    <div class="pp-hero-badge"><span class="pp-badge-pill"><i class="fa-solid fa-folder-open"></i> Free Download</span></div>
    <h1 class="pp-h1">Previous Year Question Papers</h1>
    <p class="pp-hero-sub">Free PDF downloads for nursing competitive exams — AIIMS NORCET, DHA, HAAD, and more.</p>
  </div>
</section>
<main class="pp-main">
  <div class="container">
    <div class="pp-hub-grid">${hubExamCards}</div>
  </div>
</main>
<div id="footer-container"></div>
<script>
(function(){
  function load(id,url){var e=document.getElementById(id);if(!e)return;fetch(url).then(r=>r.text()).then(h=>e.innerHTML=h).catch(()=>{});}
  load('header-container','${BASE}/assets/partials/header.html');
  load('footer-container','${BASE}/assets/partials/footer.html');
})();
</script>
</body>
</html>`;

writeFile(path.join(QP_DIR, 'index.html'), hubHtml);

// ═════════════════════════════════════════════════════════════════════════════
//  5. SITEMAP
// ═════════════════════════════════════════════════════════════════════════════

console.log('\n🗺️   Generating sitemap-papers.xml…');

const urls = [
    { loc: `${BASE}/question-papers/`,          freq: 'weekly',  pri: '0.9' },
    ...examSlugs.map(s => ({
        loc: `${BASE}/question-papers/${s}/`, freq: 'weekly', pri: '0.8'
    })),
    ...examSlugs.flatMap(slug => {
        const years = uniqueSorted(papers.filter(p => p.examSlug === slug).map(p => p.year));
        return years.map(y => ({
            loc: `${BASE}/question-papers/${slug}/${y}/`, freq: 'monthly', pri: '0.7'
        }));
    }),
    ...papers.map(p => ({
        loc: `${BASE}/question-papers/${p.slug}/`, freq: 'yearly', pri: '0.6'
    }))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join('\n')}
</urlset>`;

writeFile(path.join(ROOT, 'sitemap-papers.xml'), sitemap);

// ─────────────────────────────────────────────────────────────────────────────

const total = papers.length + examSlugs.length
    + examSlugs.reduce((n, s) => n + uniqueSorted(papers.filter(p => p.examSlug === s).map(p => p.year)).length, 0)
    + 2; // hub index + sitemap

console.log(`\n🎉  Done! Generated ${total} files.`);
console.log(`\n   ➤  Add new papers by editing question-papers/papers.json`);
console.log(`   ➤  Re-run "node question-papers/generate.js" to regenerate all pages.\n`);
