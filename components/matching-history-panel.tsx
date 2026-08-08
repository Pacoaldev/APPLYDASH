"use client";

import { useEffect, useState } from "react";
import { getMatchingHistory } from "@/app/dashboard/actions";
import { useLocale } from "@/components/locale-provider";
import { Loader2, X, Star, AlertTriangle, CheckCircle, HelpCircle, AlertOctagon, ExternalLink, ShieldCheck, FileText, MessageSquare, Award } from "lucide-react";
import { getAllMatchingHistory } from "@/utils/indexedDB";

type Props = {
  jobId: string | null;
  company: string | null;
  applicationLink: string | null;
  onClose: () => void;
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
    .replace(/\b(sl|s\.l\.|sa|s\.a\.|slu|s\.l\.u\.|consulting|grupo|spain|espana|s\.a\.u\.|sau)\b/gi, "") // remove common suffixes
    .replace(/[^a-z0-9]/gi, "") // remove non-alphanumeric characters
    .trim();
}

export function MatchingHistoryPanel({ jobId, company, applicationLink, onClose }: Props) {
  const { locale } = useLocale();
  const [matchingData, setMatchingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"evaluation" | "plan" | "legitimacy">("evaluation");

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);

    // Try client-side IndexedDB lookup first
    getAllMatchingHistory().then((localHistory) => {
      let matches: any[] = [];
      const url = applicationLink;

      const isValidUrl = url && url.trim().length > 10 && (url.includes("http") || url.includes("infojobs") || url.includes("linkedin"));

      console.log("[Matching Debug Panel] Local History records count:", localHistory.length);
      if (isValidUrl && localHistory.length > 0) {
        const cleanUrl = url.trim().toLowerCase();
        matches = localHistory.filter((item: any) => {
          if (!item.sourceUrl) return false;
          const itemUrl = item.sourceUrl.trim().toLowerCase();
          const cleanItemUrl = itemUrl.split("?")[0];
          const cleanTargetUrl = cleanUrl.split("?")[0];
          return cleanItemUrl.includes(cleanTargetUrl) || cleanTargetUrl.includes(cleanItemUrl);
        });
        console.log("[Matching Debug Panel] URL filter match count:", matches.length);
      }

      if (matches.length === 0 && company && localHistory.length > 0) {
        const normTargetCompany = normalizeText(company);
        console.log("[Matching Debug Panel] Normalized Target Company:", normTargetCompany);
        if (normTargetCompany) {
          matches = localHistory.filter((item: any) => {
            const itemCompany = item.brief?.company || "";
            const normItemCompany = normalizeText(itemCompany);
            console.log(`[Matching Debug Panel] Comparing itemCompany "${itemCompany}" (norm: "${normItemCompany}") with "${normTargetCompany}"`);
            return normItemCompany && (normItemCompany.includes(normTargetCompany) || normTargetCompany.includes(normItemCompany));
          });
        }
        console.log("[Matching Debug Panel] Company filter match count:", matches.length);
      }

      if (matches.length > 0) {
        console.log("[Matching Debug Panel] Using matches from IndexedDB:", matches);
        setMatchingData(matches);
        setLoading(false);
      } else {
        // Fallback to Server Action if not found locally in IndexedDB
        console.log("[Matching Debug Panel] Falling back to server getMatchingHistory with:", { applicationLink, company });
        getMatchingHistory(applicationLink, company).then((result) => {
          console.log("[Matching Debug Panel] Server fallback result:", result);
          if (result.success && result.data) {
            setMatchingData(result.data);
          } else {
            setMatchingData([]);
          }
          setLoading(false);
        });
      }
    }).catch((err) => {
      console.error("Local matching lookup failed, falling back to server:", err);
      getMatchingHistory(applicationLink, company).then((result) => {
        if (result.success && result.data) {
          setMatchingData(result.data);
        } else {
          setMatchingData([]);
        }
        setLoading(false);
      });
    });
  }, [jobId, applicationLink, company]);

  if (!jobId) return null;

  const currentMatch = matchingData[0]; // Take the first match if multiple exist
  console.log("[Matching Debug Panel] Current Match selected:", currentMatch);

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < score ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const getWeightColor = (weight: string) => {
    if (weight === "positive") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (weight === "negative") return "text-red-400 bg-red-500/10 border-red-500/20";
    return "text-slate-400 bg-slate-900 border-slate-800";
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl relative animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/50">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                Matching Data
              </span>
              {currentMatch?.evaluation?.globalScore && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  ★ {currentMatch.evaluation.globalScore} / 5.0
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {currentMatch?.brief?.role || "Matching History"}
            </h3>
            <p className="text-sm text-slate-400">{company || currentMatch?.brief?.company}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p>{locale === "es" ? "Cargando análisis de matching..." : "Loading matching analysis..."}</p>
            </div>
          ) : !currentMatch ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-amber-500/80" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-300">
                  {locale === "es" ? "No se encontraron datos de matching" : "No matching data found"}
                </p>
                <p className="text-xs text-slate-500 max-w-sm">
                  {locale === "es" 
                    ? "Este puesto no tiene un registro de matching correspondiente en el archivo local de historial."
                    : "This position doesn't have a matching record in the local history file."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  onClick={() => setActiveTab("evaluation")}
                  className={`pb-2.5 px-2 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === "evaluation"
                      ? "border-b-blue-500 text-blue-400"
                      : "border-b-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Award className="h-4 w-4" />
                  {locale === "es" ? "Evaluación" : "Evaluation"}
                </button>
                <button
                  onClick={() => setActiveTab("plan")}
                  className={`pb-2.5 px-2 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === "plan"
                      ? "border-b-blue-500 text-blue-400"
                      : "border-b-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  {locale === "es" ? "Plan de CV / Charla" : "CV Plan / Interview"}
                </button>
                <button
                  onClick={() => setActiveTab("legitimacy")}
                  className={`pb-2.5 px-2 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === "legitimacy"
                      ? "border-b-blue-500 text-blue-400"
                      : "border-b-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {locale === "es" ? "Legitimidad" : "Legitimacy"}
                </button>
              </div>

              {/* TAB 1: Evaluation */}
              {activeTab === "evaluation" && (
                <div className="space-y-6 animate-in fade-in-50 duration-200">
                  {/* Recommendation Card */}
                  {(() => {
                    const globalScore = currentMatch.evaluation?.globalScore;
                    const recommendApply = currentMatch.evaluation?.recommendApply === true || 
                      (typeof currentMatch.evaluation?.recommendApply === 'string' && 
                       ['si', 'yes', 'true'].includes(currentMatch.evaluation.recommendApply.toLowerCase())) ||
                      (typeof globalScore === 'number' && globalScore >= 4.0);

                    return (
                      <div className={`p-4 rounded-xl border flex gap-4 ${
                        recommendApply 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-red-500/10 border-red-500/20 text-red-300"
                      }`}>
                        <div className="mt-0.5">
                          {recommendApply ? (
                            <CheckCircle className="h-6 w-6 text-emerald-400" />
                          ) : (
                            <AlertOctagon className="h-6 w-6 text-red-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">
                            {recommendApply 
                              ? (locale === "es" ? "Se recomienda postular" : "Recommended to Apply")
                              : (locale === "es" ? "No se recomienda postular" : "Application Not Recommended")}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {currentMatch.evaluation?.rationale || currentMatch.evaluation?.summary}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Summary */}
                  {currentMatch.brief?.summary && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {locale === "es" ? "Resumen de la oferta" : "Job Summary"}
                      </h4>
                      <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/30 p-3 rounded-lg border border-slate-800/60">
                        {currentMatch.brief.summary}
                      </p>
                    </div>
                  )}

                  {/* Grid of criteria scores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CV Match */}
                    {currentMatch.evaluation?.cvMatch && (
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-300">CV Match</span>
                            {renderStars(currentMatch.evaluation.cvMatch.score)}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mt-2">
                            {currentMatch.evaluation.cvMatch.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* North Star */}
                    {currentMatch.evaluation?.northStar && (
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-300">North Star Fit</span>
                            {renderStars(currentMatch.evaluation.northStar.score)}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mt-2">
                            {currentMatch.evaluation.northStar.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Salary & Comp */}
                    {currentMatch.evaluation?.comp && (
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-300">{locale === "es" ? "Compensación" : "Compensation"}</span>
                            {renderStars(currentMatch.evaluation.comp.score)}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mt-2">
                            {currentMatch.evaluation.comp.notes}
                          </p>
                          {currentMatch.evaluation.compNotes && (
                            <span className="inline-block mt-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                              {currentMatch.evaluation.compNotes}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Culture */}
                    {currentMatch.evaluation?.culture && (
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-300">{locale === "es" ? "Cultura" : "Culture"}</span>
                            {renderStars(currentMatch.evaluation.culture.score)}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mt-2">
                            {currentMatch.evaluation.culture.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Red Flags / Risk */}
                    {currentMatch.evaluation?.redFlags && (
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 md:col-span-2">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                            <AlertOctagon className="h-3.5 w-3.5" />
                            {locale === "es" ? "Alertas / Competencia" : "Red Flags / Risk"}
                          </span>
                          {renderStars(currentMatch.evaluation.redFlags.score)}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mt-2">
                          {currentMatch.evaluation.redFlags.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Must Have & Nice Have requirements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentMatch.brief?.mustHave?.length > 0 && (
                      <div className="space-y-1.5">
                        <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Must Have
                        </h5>
                        <ul className="text-xs text-slate-300 space-y-1 bg-slate-950/20 p-3 rounded-lg border border-slate-800/40">
                          {currentMatch.brief.mustHave.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold shrink-0">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentMatch.brief?.niceToHave?.length > 0 && (
                      <div className="space-y-1.5">
                        <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Nice to Have
                        </h5>
                        <ul className="text-xs text-slate-300 space-y-1 bg-slate-950/20 p-3 rounded-lg border border-slate-800/40">
                          {currentMatch.brief.niceToHave.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-blue-400 font-bold shrink-0">+</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CV Plan / Interview */}
              {activeTab === "plan" && (
                <div className="space-y-6 animate-in fade-in-50 duration-200">
                  {/* CV Change Plan */}
                  {currentMatch.evaluation?.cvChangePlan?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-blue-400" />
                        {locale === "es" ? "Ajustes sugeridos al CV" : "CV Adjustments Plan"}
                      </h4>
                      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                        {currentMatch.evaluation.cvChangePlan.map((plan: string, i: number) => (
                          <div key={i} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                            <span className="text-blue-500 shrink-0 font-bold">↳</span>
                            <span>{plan}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Talking Points */}
                  {currentMatch.evaluation?.talkingPoints?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-emerald-400" />
                        {locale === "es" ? "Argumentos clave para la entrevista" : "Key Interview Talking Points"}
                      </h4>
                      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                        {currentMatch.evaluation.talkingPoints.map((point: string, i: number) => (
                          <div key={i} className="flex gap-3 items-start text-xs text-slate-300 leading-relaxed">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold shrink-0 text-[10px]">
                              {i + 1}
                            </span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Legitimacy */}
              {activeTab === "legitimacy" && (
                <div className="space-y-6 animate-in fade-in-50 duration-200">
                  {currentMatch.evaluation?.legitimacy && (
                    <div className="space-y-5">
                      {/* Tier and Summary */}
                      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-400">Tier:</span>
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                            currentMatch.evaluation.legitimacy.tier === "high" 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {currentMatch.evaluation.legitimacy.tier || "Medium"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-900 pt-3">
                          {currentMatch.evaluation.legitimacy.summary}
                        </p>
                      </div>

                      {/* Signals list */}
                      {currentMatch.evaluation.legitimacy.signals?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {locale === "es" ? "Señales analizadas" : "Analyzed Signals"}
                          </h4>
                          <div className="space-y-3">
                            {currentMatch.evaluation.legitimacy.signals.map((sig: any, i: number) => (
                              <div key={i} className={`p-3.5 rounded-xl border flex gap-3 ${getWeightColor(sig.weight)}`}>
                                <div className="mt-0.5">
                                  {sig.weight === "positive" ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : sig.weight === "negative" ? (
                                    <AlertTriangle className="h-4 w-4" />
                                  ) : (
                                    <HelpCircle className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="text-xs space-y-1">
                                  <span className="font-bold text-white block">{sig.signal}</span>
                                  <span className="text-slate-300 leading-relaxed block">{sig.finding}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Source link */}
              {currentMatch.sourceUrl && (
                <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-xs text-slate-500">
                  <span>
                    {locale === "es" ? "Extraído el: " : "Extracted on: "}
                    {new Date(currentMatch.createdAt).toLocaleDateString()}
                  </span>
                  <a
                    href={currentMatch.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline hover:text-blue-300"
                  >
                    {locale === "es" ? "Ver oferta original" : "View original posting"}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
