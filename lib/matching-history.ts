/** MinionJobker JobRun shape (subset used for matching). */
export type HistoryRun = {
  id?: string;
  createdAt?: string;
  sourceUrl?: string;
  brief?: { company?: string; role?: string };
};

export type MatchContext = {
  applicationLink?: string | null;
  company?: string | null;
  position?: string | null;
};

const ROLE_STOPWORDS = new Set([
  "de",
  "del",
  "la",
  "el",
  "en",
  "con",
  "para",
  "and",
  "the",
]);

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(
      /\b(sl|s\.l\.|sa|s\.a\.|slu|s\.l\.u\.|consulting|grupo|spain|espana|s\.a\.u\.|sau)\b/gi,
      "",
    )
    .replace(/[^a-z0-9]/gi, "")
    .trim();
}

export function extractJobId(
  u: string,
): { type: string; id: string } | null {
  const liMatch = u.match(/(?:view|jobs\/view)\/(\d+)/);
  if (liMatch) return { type: "linkedin", id: liMatch[1] };

  const ijMatch = u.match(/(?:id=|_|detail\/)(of-[a-zA-Z0-9]+|\d+)/);
  if (ijMatch) return { type: "infojobs", id: ijMatch[1] };

  const indMatch =
    u.match(/[?&]jk=([a-f0-9]+)/i) || u.match(/\/viewjob.*jk=([a-f0-9]+)/i);
  if (indMatch) return { type: "indeed", id: indMatch[1].toLowerCase() };

  return null;
}

function roleTokens(role: string): Set<string> {
  const norm = role
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, " ");
  const tokens = norm.split(/\s+/).filter((t) => t.length >= 3);
  return new Set(tokens.filter((t) => !ROLE_STOPWORDS.has(t)));
}

export function roleTokenOverlap(a: string, b: string): number {
  const ta = roleTokens(a);
  const tb = roleTokens(b);
  let n = 0;
  for (const t of ta) {
    if (tb.has(t)) n++;
  }
  return n;
}

function companiesMatch(a: string, b: string): boolean {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return false;
  return na.includes(nb) || nb.includes(na);
}

function urlPathMatch(target: string, item: string): boolean {
  const cleanItem = item.split("?")[0].replace(/\/$/, "");
  const cleanTarget = target.split("?")[0].replace(/\/$/, "");
  if (
    cleanItem.length < 35 ||
    cleanTarget.length < 35 ||
    cleanItem.includes("indeed.com/viewjob") ||
    cleanTarget.includes("indeed.com/viewjob") ||
    cleanItem.includes("indeed.com/rc/clk") ||
    cleanTarget.includes("indeed.com/rc/clk")
  ) {
    return false;
  }
  return cleanItem.includes(cleanTarget) || cleanTarget.includes(cleanItem);
}

/** Higher = better. 0 = no match. Company-only without role overlap never matches. */
export function scoreHistoryMatch(
  item: HistoryRun,
  ctx: MatchContext,
): number {
  const url = ctx.applicationLink?.trim();
  const itemUrl = item.sourceUrl?.trim();

  if (url && itemUrl) {
    const targetId = extractJobId(url.toLowerCase());
    const itemId = extractJobId(itemUrl.toLowerCase());
    if (targetId && itemId) {
      if (targetId.type === itemId.type && targetId.id === itemId.id) {
        return 1000;
      }
      return 0;
    }
    if (targetId || itemId) {
      return 0;
    }
    if (urlPathMatch(url.toLowerCase(), itemUrl.toLowerCase())) {
      return 800;
    }
  }

  const company = ctx.company?.trim();
  const itemCompany = item.brief?.company?.trim();
  if (!company || !itemCompany || !companiesMatch(company, itemCompany)) {
    return 0;
  }

  const position = ctx.position?.trim();
  const itemRole = item.brief?.role?.trim();
  if (!position || !itemRole) {
    return 0;
  }

  const overlap = roleTokenOverlap(position, itemRole);
  if (overlap >= 2) return 500 + overlap;
  if (overlap >= 1) return 300 + overlap;
  return 0;
}

export function pickBestHistoryMatch(
  history: HistoryRun[],
  ctx: MatchContext,
): HistoryRun | null {
  const scored = history
    .map((item) => ({ item, score: scoreHistoryMatch(item, ctx) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const tb = new Date(b.item.createdAt || 0).getTime();
      const ta = new Date(a.item.createdAt || 0).getTime();
      return tb - ta;
    });

  return scored[0]?.item ?? null;
}

export function filterHistoryMatches(
  history: HistoryRun[],
  ctx: MatchContext,
): HistoryRun[] {
  const best = pickBestHistoryMatch(history, ctx);
  return best ? [best] : [];
}
