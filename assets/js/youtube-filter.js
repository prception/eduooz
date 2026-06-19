/**
 * youtube-filter.js
 * Filters the nursing video carousel to show exam-relevant videos first.
 * Loaded only on nursing landing pages (gcc / kerala / central).
 * Depends on course-landing.js exposing:
 *   window._eduoozData      — { nursing: [...], category: {...} }
 *   window._renderPlaylistCards(playlist) — re-renders the carousel
 */
(function () {
  // Only runs on pages that have an EXAM_CONFIG (nursing landing pages)
  if (typeof window.EXAM_CONFIG === "undefined") return;

  // ─── Keyword map ───────────────────────────────────────────────────────────
  // Key: substring of examSlug (case-insensitive)
  // Value: array of keywords checked against video title / desc / stats
  // Add new entries here to support future landing pages.
  const KEYWORD_MAP = {
    // ── Kerala ──
    "dhs-nursing":          ["DHS", "Staff Nurse"],
    "dme-nursing":          ["DME"],
    "jphn-dhs":             ["JPHN", "DHS"],
    "jphn-dme":             ["JPHN", "DME"],
    "apn":                  ["APN", "Assistant Professor"],
    "ims-staff-nurse":      ["IMS"],
    "lsgd-nursing":         ["LSGD"],
    "msc-nursing-entrance": ["MSc", "Nursing Entrance"],
    "nursing-tutor":        ["Nursing Tutor", "Tutor"],
    "treatment-organiser":  ["Treatment Organiser"],
    "homeo-nursing":        ["Homoeo", "Homeo", "Ayurved"],

    // ── GCC ──
    "dha-nursing":          ["DHA", "Dubai"],
    "haad-nursing":         ["HAAD", "DOH", "Abu Dhabi"],
    "moh-nursing":          ["MOH"],
    "saudi-nursing":        ["Saudi", "SCFHS"],
    "kuwait-nursing":       ["Kuwait"],
    "qatar-nursing":        ["Qatar"],
    "oman-nursing":         ["Oman", "OMSB"],
    "sharjah-nursing":      ["Sharjah", "Prometric"],

    // ── Central ──
    "aiims-norcet":         ["NORCET", "AIIMS"],
    "jipmer-nursing":       ["JIPMER"],
    "dsssb-nursing":        ["DSSSB"],
    "esic-nursing":         ["ESIC"],
    "military-nursing":     ["Military", "MNS"],
    "nvs-school-nurse":     ["NVS"],
    "pgimer-nursing":       ["PGIMER"],
    "rcc-nursing":          ["RCC"],
    "rml-nursing":          ["RML"],
    "rrb-nursing":          ["RRB"],
    "sgpgims-nursing":      ["SGPGIMS"],
    "sree-chitra-nursing":  ["Sree Chitra"],
    "ssc-staff-nurse":      ["SSC"],
  };

  // ─── Resolve keywords for the current page ─────────────────────────────────
  function getKeywords(slug) {
    if (!slug) return [];
    const lower = slug.toLowerCase();

    for (const [key, kws] of Object.entries(KEYWORD_MAP)) {
      if (lower.includes(key)) return kws;
    }

    // Generic fallback for any unmatched GCC prometric/pearson-vue slug
    if (lower.includes("prometric") || lower.includes("pearson")) {
      return ["Prometric", "Pearson VUE"];
    }

    return [];
  }

  // ─── Score a single video against keywords ─────────────────────────────────
  function scoreVideo(video, keywords) {
    const haystack = [video.title, video.desc, video.stats]
      .join(" ")
      .toLowerCase();
    return keywords.reduce(
      (n, kw) => n + (haystack.includes(kw.toLowerCase()) ? 1 : 0),
      0
    );
  }

  // ─── Build filtered playlist (matched first, unmatched fill the rest) ──────
  function buildFilteredPlaylist(playlist, keywords) {
    if (!keywords.length) return [...playlist];

    const scored = playlist.map((v) => ({ v, s: scoreVideo(v, keywords) }));
    const matched   = scored.filter((i) => i.s > 0).sort((a, b) => b.s - a.s).map((i) => i.v);
    const unmatched = scored.filter((i) => i.s === 0).map((i) => i.v);

    return [...matched, ...unmatched];
  }

  // ─── Main: apply filter after course-landing.js DOMContentLoaded runs ──────
  function applyFilter() {
    const data   = window._eduoozData;
    const render = window._renderPlaylistCards;

    // Guard: course-landing.js expose lines haven't run yet (shouldn't happen with defer order)
    if (!data || !render) return;

    const slug     = (window.EXAM_CONFIG.examSlug || "").toLowerCase();
    const keywords = getKeywords(slug);
    const filtered = buildFilteredPlaylist(data.nursing, keywords);

    // Override the initial "All" render with exam-specific nursing videos
    render(filtered);

    // Also patch the Nursing tab so clicking it shows the filtered order too
    if (data.category && data.category["Nursing"]) {
      data.category["Nursing"] = filtered;
    }
  }

  // Defer scripts run before DOMContentLoaded; registering here ensures
  // this handler fires after all course-landing.js DOMContentLoaded handlers.
  document.addEventListener("DOMContentLoaded", applyFilter);
})();
