// ─── Helpers ─────────────────────────────────────────────────────────────────

function text(...selectors) {
  for (const sel of selectors) {
    const t = document.querySelector(sel)?.textContent?.trim();
    if (t) return t;
  }
  return "";
}

function attr(attribute, ...selectors) {
  for (const sel of selectors) {
    const v = document.querySelector(sel)?.[attribute]?.trim();
    if (v) return v;
  }
  return "";
}

function findInPage(regex) {
  return document.body.innerText.match(regex)?.[0]?.trim() || "";
}

// ─── JSON-LD extractor (most reliable — used by LinkedIn, InfoJobs, Michael Page, etc.) ──

function extractJsonLd() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      // Handle arrays or single objects
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        // Look for JobPosting schema
        const job = findJobPosting(item);
        if (job) return parseJobPosting(job);
      }
    } catch { /* malformed JSON, skip */ }
  }
  return null;
}

function findJobPosting(obj) {
  if (!obj || typeof obj !== "object") return null;
  const type = obj["@type"];
  if (type === "JobPosting" || type === "jobPosting") return obj;
  if (Array.isArray(type) && type.includes("JobPosting")) return obj;
  // Recurse into @graph
  if (obj["@graph"]) {
    for (const node of [].concat(obj["@graph"])) {
      const found = findJobPosting(node);
      if (found) return found;
    }
  }
  return null;
}

function parseJobPosting(job) {
  const position = job.title || job.name || "";

  // Company can be nested: hiringOrganization.name
  const hiringOrg = job.hiringOrganization;
  const company = (typeof hiringOrg === "string" ? hiringOrg : hiringOrg?.name) || "";

  // Location
  const loc = job.jobLocation;
  let location = "";
  if (loc) {
    const locObj = Array.isArray(loc) ? loc[0] : loc;
    const addr = locObj?.address;
    if (typeof addr === "string") {
      location = addr;
    } else if (addr) {
      location = [addr.addressLocality, addr.addressRegion, addr.addressCountry]
        .filter(Boolean).join(", ");
    }
  }

  // Work type
  const typeRaw = [job.jobLocationType, job.employmentType, location]
    .filter(Boolean).join(" ");

  // Salary
  let salaryRaw = "";
  const sal = job.baseSalary || job.salary;
  if (sal) {
    const value = sal.value;
    const currency = sal.currency || "";
    const sym = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency;
    if (value) {
      if (value.minValue && value.maxValue) {
        salaryRaw = `${value.minValue}${sym} - ${value.maxValue}${sym}`;
      } else if (value.value) {
        salaryRaw = `${value.value}${sym}`;
      } else if (typeof value === "number") {
        salaryRaw = `${value}${sym}`;
      }
    }
  }

  return {
    position: position.trim(),
    company:  company.trim(),
    location: location.trim(),
    type:     normalizeType(typeRaw),
    salary:   salaryRaw ? normalizeSalary(salaryRaw) : "",
    _fromJsonLd: true,
  };
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

function normalizeType(raw) {
  if (!raw) return "";
  const r = raw.toLowerCase();
  if (/remot|teletrabajo|work.?from.?home|wfh|telecommut/i.test(r)) return "Remote";
  if (/h[ií]brid/i.test(r)) return "Hybrid";
  if (/presencial|on.?site|office|in.?person/i.test(r)) return "Office";
  return "";
}

function normalizeSalary(raw) {
  if (!raw) return "";
  const isEuro   = raw.includes("€") || /\beur\b/i.test(raw);
  const isDollar = raw.includes("$") || /\busd\b/i.test(raw);
  const isGBP    = raw.includes("£") || /\bgbp\b/i.test(raw);

  const nums = [...raw.matchAll(/(\d[\d.,]*)(\s*[kK])?/g)]
    .map(m => {
      let n = parseFloat(m[1].replace(/\./g, "").replace(/,/g, "."));
      if (m[2]) n *= 1000;
      return n;
    })
    .filter(n => !isNaN(n) && n >= 1000);

  if (nums.length === 0) return raw.trim();

  const fmt = (n) => {
    if (isEuro)   return n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + "€";
    if (isDollar) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (isGBP)    return "£" + n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
    // No currency detected — default to Euro format
    return n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + "€";
  };

  if (nums.length >= 2) {
    const lo = Math.min(...nums), hi = Math.max(...nums);
    if (lo !== hi) return `${fmt(lo)} - ${fmt(hi)}`;
    return fmt(lo);
  }
  return fmt(nums[0]);
}

// ─── Portal-specific scrapers ─────────────────────────────────────────────────
// These complement JSON-LD for fields it doesn't always include (platform, type from DOM)

function scrapeLinkedIn(base) {
  const position = base.position ||
    text(".job-details-jobs-unified-top-card__job-title h1",
         ".jobs-unified-top-card__job-title h1", "main h1", "h1");

  const company = base.company ||
    text(".job-details-jobs-unified-top-card__company-name a",
         ".job-details-jobs-unified-top-card__company-name",
         ".jobs-unified-top-card__company-name a",
         ".jobs-unified-top-card__company-name") ||
    (() => {
      const og = attr("content", "meta[property='og:title']");
      return og.match(/ at (.+?)( \||$)/)?.[1]?.trim() || "";
    })();

  const typeRaw = base.type ||
    text(".job-details-jobs-unified-top-card__workplace-type",
         ".jobs-unified-top-card__workplace-type");

  let location = base.location;
  if (!location) {
    for (const el of document.querySelectorAll(
      ".job-details-jobs-unified-top-card__primary-description-without-tagline .tvm__text," +
      ".jobs-unified-top-card__bullet"
    )) {
      const t = el.textContent?.trim();
      if (t && !/remot|h[ií]brid|presencial|on.?site|\d+ candidat/i.test(t) && t.length > 3) {
        location = t; break;
      }
    }
  }

  const salaryRaw = base.salary || (() => {
    for (const el of document.querySelectorAll(
      ".job-details-jobs-unified-top-card__job-insight," +
      ".jobs-unified-top-card__job-insight"
    )) {
      const t = el.textContent?.trim();
      if (t && /[\d][.\d,]*\s*[k€$£K]/.test(t)) return t;
    }
    return findInPage(/([$€£][\d][\d.,]*\s*[kK]?\s*[-–]\s*[$€£]?[\d][\d.,]*|[\d][\d.,]*\s*[kK]?\s*[-–]\s*[\d][\d.,]*\s*[$€£])/);
  })();

  return { company, position, platform: "LinkedIn",
           type: normalizeType(typeRaw), location: location || "",
           salary: normalizeSalary(salaryRaw) };
}

function scrapeInfoJobs(base) {
  return {
    position: base.position || text("h1.ij-OfferDetail-title", ".ij-OfferDetail-mainSection h1", "h1"),
    company:  base.company  || text(".ij-OfferDetail-company-name a", ".ij-OfferDetail-company-name", "[class*='company']"),
    location: base.location || text(".ij-OfferDetail-location", "[data-test='offer-location']", "[class*='location']"),
    type:     base.type     || normalizeType(text(".ij-OfferDetail-infoItem--jobType", "[class*='telecommuting']", "[class*='workingHours']")),
    salary:   base.salary   || normalizeSalary(text(".ij-OfferDetail-salary", ".ij-OfferDetail-infoItem--salary", "[data-test='offer-salary']") ||
                               findInPage(/[\d][\d.,]*\s*€\s*[-–]\s*[\d][\d.,]*\s*€/)),
    platform: "InfoJobs",
  };
}

function scrapeMichaelPage(base) {
  // Michael Page uses JSON-LD reliably — DOM selectors as fallback
  return {
    position: base.position || text("h1", ".job-title"),
    company:  base.company  || text("[class*='client']", "[class*='company']", ".job-client") || "Michael Page",
    location: base.location || text("[class*='location']", ".job-location", "[data-bind*='location']"),
    type:     base.type     || normalizeType(text("[class*='workType']", "[class*='remote']", "[class*='modalidad']")),
    salary:   base.salary   || normalizeSalary(
                text("[class*='salary']", ".job-salary", "[data-bind*='salary']") ||
                findInPage(/([\d][\d.,]*\s*[€$£]\s*[-–]\s*[\d][\d.,]*|[\d][\d.,]*\s*[kK]\s*[-–]\s*[\d][\d.,]*)/)),
    platform: "Michael Page",
  };
}

function scrapeTecnoempleo(base) {
  return {
    position: base.position || text("h1.oferta-titulo", "h1", ".job-title"),
    company:  base.company  || text(".empresa a", ".empresa", "[itemprop='name']", "[class*='empresa']"),
    location: base.location || text(".localidad", "[itemprop='addressLocality']", "[class*='localidad']"),
    type:     base.type     || normalizeType(text("[class*='modalidad']", "[class*='teletrabajo']", "[class*='jornada']")),
    salary:   base.salary   || normalizeSalary(
                text("[class*='salario']", "[itemprop='baseSalary']") ||
                findInPage(/[\d][\d.,]*\s*€\s*[-–]\s*[\d][\d.,]*/)),
    platform: "Tecnoempleo",
  };
}

function scrapeInfoempleo(base) {
  return {
    position: base.position || text("h1.title-offer", "h1.oferta-title", "h1", "[class*='title']"),
    company:  base.company  || text(".company-name a", ".company-name", "[class*='empresa']", "[class*='company']"),
    location: base.location || text(".location", "[class*='location']", "[class*='localidad']"),
    type:     base.type     || normalizeType(text("[class*='modalidad']", "[class*='jornada']", "[class*='teletra']")),
    salary:   base.salary   || normalizeSalary(
                text("[class*='salario']", "[class*='salary']") ||
                findInPage(/[\d][\d.,]*\s*€\s*[-–]\s*[\d][\d.,]*/)),
    platform: "Infoempleo",
  };
}

function scrapeJoppy(base) {
  // Joppy is a SPA — JSON-LD is the most reliable; DOM fallbacks for when it loads
  return {
    position: base.position || text("h1", "[class*='title']", "[class*='position']"),
    company:  base.company  || text("[class*='company']", "[class*='employer']", "[class*='startup']"),
    location: base.location || text("[class*='location']", "[class*='city']", "[class*='ciudad']"),
    type:     base.type     || normalizeType(
                text("[class*='remote']", "[class*='modalidad']", "[class*='worktype']") ||
                findInPage(/\b(remoto|remote|h[ií]brido|hybrid|presencial|on-?site)\b/i)),
    salary:   base.salary   || normalizeSalary(
                text("[class*='salary']", "[class*='salario']", "[class*='compensation']") ||
                findInPage(/([\d][\d.,]*[kK]?\s*[-–]\s*[\d][\d.,]*[kK]?\s*[$€£]|[$€£]\s*[\d][\d.,]*[kK]?\s*[-–]\s*[\d][\d.,]*[kK]?)/)),
    platform: "Joppy",
  };
}

function scrapeIndeed(base) {
  return {
    position: base.position || text(".jobsearch-JobInfoHeader-title", "h1"),
    company:  base.company  || text("[data-company-name]", "[data-testid='inlineHeader-companyName'] a",
                                   "[data-testid='inlineHeader-companyName']", "[class*='companyName']"),
    location: base.location || text("[data-testid='job-location']", "[data-testid='inlineHeader-companyLocation']"),
    type:     base.type     || normalizeType(text("[data-testid='job-type-label']", "[class*='jobType']", "[class*='remoteLabel']")),
    salary:   base.salary   || normalizeSalary(
                text("[data-testid='attribute_snippet_testid']", "#salaryInfoAndJobType", "[class*='salary']") ||
                findInPage(/([$€£][\d][\d.,]*\s*[kK]?\s*[-–]\s*[$€£]?[\d][\d.,]*)/ )),
    platform: "Indeed",
  };
}

function scrapeGeneric(base) {
  const host = window.location.hostname.replace("www.", "");
  return {
    position: base.position || text("h1") || attr("content", "meta[property='og:title']") || document.title.split(/[|\-–]/)[0].trim(),
    company:  base.company  || text("[class*='company']", "[class*='employer']", "[itemprop='name']") || attr("content", "meta[property='og:site_name']") || "",
    location: base.location || text("[class*='location']", "[class*='ciudad']", "[class*='city']", "[itemprop='addressLocality']"),
    type:     base.type     || normalizeType(findInPage(/\b(remoto|remote|teletrabajo|h[ií]brido|hybrid|presencial|on-?site|office)\b/i)),
    salary:   base.salary   || normalizeSalary(findInPage(/([$€£][\d][\d.,]*[kK]?\s*[-–]\s*[$€£]?[\d][\d.,]*[kK]?|[\d][\d.,]*[kK]?\s*[-–]\s*[\d][\d.,]*[kK]?\s*[$€£])/)),
    platform: host,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function scrapeJobPage() {
  const host = window.location.hostname;

  // Step 1: Try JSON-LD first (most stable across all portals)
  const base = extractJsonLd() || {};

  // Step 2: Enrich with portal-specific DOM selectors
  if (host.includes("linkedin.com"))    return scrapeLinkedIn(base);
  if (host.includes("infojobs."))       return scrapeInfoJobs(base);
  if (host.includes("michaelpage."))    return scrapeMichaelPage(base);
  if (host.includes("tecnoempleo."))    return scrapeTecnoempleo(base);
  if (host.includes("infoempleo."))     return scrapeInfoempleo(base);
  if (host.includes("joppy."))          return scrapeJoppy(base);
  if (host.includes("indeed."))         return scrapeIndeed(base);
  return scrapeGeneric(base);
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "scrape") {
    const delay = msg.delay || 0;
    if (delay > 0) {
      setTimeout(() => sendResponse(scrapeJobPage()), delay);
      return true;
    }
    sendResponse(scrapeJobPage());
  }
  return true;
});
