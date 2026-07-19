// ─── Helpers ─────────────────────────────────────────────────────────────────

function text(selector, root = document) {
  return root.querySelector(selector)?.textContent?.trim() || "";
}

function attr(selector, attribute, root = document) {
  return root.querySelector(selector)?.[attribute]?.trim() || "";
}

// Normalize work type to canonical English value
function normalizeType(raw) {
  if (!raw) return "";
  const r = raw.toLowerCase();
  if (r.includes("remote") || r.includes("remoto") || r.includes("teletrabajo")) return "Remote";
  if (r.includes("hybrid") || r.includes("híbrido") || r.includes("hibrido")) return "Hybrid";
  if (r.includes("presencial") || r.includes("on-site") || r.includes("onsite") || r.includes("office") || r.includes("in person")) return "Office";
  return "";
}

// Normalize salary to "35.000€ - 40.000€" or "$50,000 - $70,000" format
function normalizeSalary(raw) {
  if (!raw) return "";

  // Detect currency
  const isEuro   = raw.includes("€") || raw.toLowerCase().includes("eur");
  const isDollar = raw.includes("$") || raw.toLowerCase().includes("usd");
  const symbol   = isEuro ? "€" : isDollar ? "$" : "";

  // Extract all numbers (handle 35000, 35.000, 35,000)
  const nums = [...raw.matchAll(/[\d][.\d,]*/g)]
    .map(m => parseFloat(m[0].replace(/\./g, "").replace(/,/g, ".")))
    .filter(n => !isNaN(n) && n >= 1000);

  if (nums.length === 0) return raw.trim();

  const fmt = (n) => {
    if (isEuro) return n.toLocaleString("es-ES") + "€";
    if (isDollar) return "$" + n.toLocaleString("en-US");
    return n.toLocaleString("es-ES") + (symbol ? symbol : "");
  };

  if (nums.length >= 2) {
    const [lo, hi] = [Math.min(...nums), Math.max(...nums)];
    return `${fmt(lo)} - ${fmt(hi)}`;
  }
  return fmt(nums[0]);
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

function scrapeLinkedIn() {
  // Position
  const position =
    text(".job-details-jobs-unified-top-card__job-title h1") ||
    text(".job-details-jobs-unified-top-card__job-title") ||
    text(".jobs-unified-top-card__job-title h1") ||
    text(".jobs-unified-top-card__job-title") ||
    text("h1");

  // Company
  const company =
    text(".job-details-jobs-unified-top-card__company-name a") ||
    text(".job-details-jobs-unified-top-card__company-name") ||
    text(".jobs-unified-top-card__company-name a") ||
    text(".jobs-unified-top-card__company-name") ||
    text("[data-test-id='job-details-company-name']") ||
    attr("meta[property='og:title']", "content").split(" at ")[1]?.split(" |")[0] ||
    "";

  // Location & type — LinkedIn shows them together: "Valencia (Presencial)" or "Remote"
  const locationRaw =
    text(".job-details-jobs-unified-top-card__primary-description-without-tagline .tvm__text") ||
    text(".jobs-unified-top-card__bullet") ||
    text(".job-details-jobs-unified-top-card__workplace-type") ||
    "";

  // Salary
  const salaryRaw =
    text(".job-details-jobs-unified-top-card__salary-info") ||
    text(".compensation__salary") ||
    text("[class*='salary']") ||
    text("[class*='compensation']") ||
    "";

  // Type: LinkedIn sometimes puts it in a separate span
  const typeRaw =
    text(".job-details-jobs-unified-top-card__workplace-type") ||
    text(".jobs-unified-top-card__workplace-type") ||
    text("[class*='workplace-type']") ||
    "";

  // Location: strip the type part if present
  let location = locationRaw.replace(typeRaw, "").replace(/[·•|]/g, "").trim();
  // Also try to find city specifically
  const locationSpecific =
    text(".job-details-jobs-unified-top-card__primary-description-container .tvm__text--neutral") ||
    "";
  if (locationSpecific) location = locationSpecific.split("·")[0].trim();

  return {
    company: company.replace(/\n/g, " ").trim(),
    position: position.replace(/\n/g, " ").trim(),
    platform: "LinkedIn",
    type: normalizeType(typeRaw || locationRaw),
    location: location || "",
    salary: normalizeSalary(salaryRaw),
  };
}

// ─── Indeed ──────────────────────────────────────────────────────────────────

function scrapeIndeed() {
  const company =
    text("[data-company-name]") ||
    text(".jobsearch-CompanyInfoWithoutHeaderImage .icl-u-lg-mr--sm") ||
    text("[class*='companyName']") ||
    "";

  const position =
    text(".jobsearch-JobInfoHeader-title") ||
    text("h1") ||
    "";

  const locationRaw =
    text("[data-testid='job-location']") ||
    text(".jobsearch-JobInfoHeader-subtitle .icl-u-xs-mt--xs") ||
    text("[class*='location']") ||
    "";

  const typeRaw =
    text("[data-testid='job-type-label']") ||
    text("[class*='jobType']") ||
    "";

  const salaryRaw =
    text("[data-testid='attribute_snippet_testid']") ||
    text("[class*='salary']") ||
    text("#salaryInfoAndJobType span") ||
    "";

  return {
    company,
    position,
    platform: "Indeed",
    type: normalizeType(typeRaw || locationRaw),
    location: locationRaw.replace(typeRaw, "").trim(),
    salary: normalizeSalary(salaryRaw),
  };
}

// ─── InfoJobs ────────────────────────────────────────────────────────────────

function scrapeInfoJobs() {
  const company = text(".ij-OfferDetail-mainSection h2") || text(".ij-Offer-heading h2") || "";
  const position = text(".ij-OfferDetail-mainSection h1") || text("h1") || "";

  const locationRaw =
    text("[class*='location']") ||
    text(".ij-OfferDetail-infoItem--location") ||
    "";

  const typeRaw =
    text(".ij-OfferDetail-infoItem--jobType") ||
    text("[class*='telecommuting']") ||
    "";

  const salaryRaw =
    text(".ij-OfferDetail-infoItem--salary") ||
    text("[class*='salary']") ||
    "";

  return {
    company,
    position,
    platform: "InfoJobs",
    type: normalizeType(typeRaw),
    location: locationRaw,
    salary: normalizeSalary(salaryRaw),
  };
}

// ─── Generic fallback ────────────────────────────────────────────────────────

function scrapeGeneric() {
  const host = window.location.hostname.replace("www.", "");

  const position =
    text("h1") ||
    attr("meta[property='og:title']", "content") ||
    document.title.split("|")[0].trim();

  // Try common patterns for company
  const company =
    text("[class*='company']") ||
    text("[class*='employer']") ||
    text("[class*='organization']") ||
    attr("meta[property='og:site_name']", "content") ||
    "";

  // Try to find salary anywhere on page
  const allText = document.body.innerText;
  const salaryMatch = allText.match(
    /(\$|€|£)?\s*[\d][.\d,]*\s*[k€$£]?\s*[-–]\s*(\$|€|£)?\s*[\d][.\d,]*\s*[k€$£]?\s*(\/\s*(year|año|mes|month|hr|hour|hora))?/i
  );

  // Try to find type
  const typeMatch = allText.match(/\b(remoto|remote|híbrido|hybrid|presencial|on-site|office)\b/i);

  return {
    company,
    position,
    platform: host,
    type: normalizeType(typeMatch?.[0] || ""),
    location: "",
    salary: normalizeSalary(salaryMatch?.[0] || ""),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function scrapeJobPage() {
  const host = window.location.hostname;

  if (host.includes("linkedin.com"))  return scrapeLinkedIn();
  if (host.includes("indeed."))       return scrapeIndeed();
  if (host.includes("infojobs."))     return scrapeInfoJobs();
  return scrapeGeneric();
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "scrape") {
    sendResponse(scrapeJobPage());
  }
  return true;
});
