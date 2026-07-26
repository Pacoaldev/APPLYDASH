"use client";

import { useEffect, useRef, useState } from "react";
import { Job } from "@/types/job";
import { useLocale } from "@/components/locale-provider";
import { updateJob } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { X, Save, ExternalLink, Loader2, FileText, Mail, Lock, Eye } from "lucide-react";
import { displayStatus, displayType, canonicalStatus, canonicalType } from "@/lib/job-utils";
import cellContents from "@/data/cellContents";

type Props = {
  job: Job | null;
  onClose: () => void;
  onSave: (updated: Job) => void;
};

export function JobDetailPanel({ job, onClose, onSave }: Props) {
  const { t, locale } = useLocale();
  const [form, setForm] = useState<Job | null>(null);
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync form when job changes
  useEffect(() => {
    setForm(job ? { ...job } : null);
  }, [job]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
  };

  if (!form) return null;

  const set = (key: keyof Job, value: string | string[] | null) =>
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);

  const isDirty = JSON.stringify(form) !== JSON.stringify(job);

  const handleSave = async () => {
    if (!form || !isDirty) return;
    setSaving(true);
    try {
      const result = await updateJob(form);
      if (result.error) {
        toast.error(t.dashboard.toast.updateError, { description: result.error });
      } else if (result.success && result.data) {
        toast.success(t.dashboard.toast.updateSuccess);
        onSave(result.data as Job);
        onClose();
      }
    } catch {
      toast.error(t.dashboard.toast.unexpectedError);
    } finally {
      setSaving(false);
    }
  };

  const typeOptions  = locale === "es" ? cellContents.typeEs   : cellContents.type;
  const statusOptions = locale === "es" ? cellContents.statusEs : cellContents.status;

  const inputCls = "w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "text-xs text-muted-foreground mb-1 block";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex justify-end"
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <p className="font-semibold text-base truncate">{form.company || "—"}</p>
            <p className="text-sm text-muted-foreground truncate">{form.position || "—"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.dashboard.columns.company}</label>
              <input className={inputCls} value={form.company ?? ""} onChange={(e) => set("company", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{t.dashboard.columns.platform}</label>
              <input className={inputCls} value={form.platform ?? ""} onChange={(e) => set("platform", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>{t.dashboard.columns.position}</label>
            <input className={inputCls} value={form.position ?? ""} onChange={(e) => set("position", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.dashboard.columns.status}</label>
              <select
                className={inputCls}
                value={displayStatus(form.status, locale)}
                onChange={(e) => set("status", canonicalStatus(e.target.value) || e.target.value)}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.dashboard.columns.type}</label>
              <select
                className={inputCls}
                value={displayType(form.type, locale)}
                onChange={(e) => set("type", canonicalType(e.target.value) || e.target.value)}
              >
                {typeOptions.map((tp) => (
                  <option key={tp} value={tp}>{tp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.dashboard.columns.appliedDate}</label>
              <input
                className={inputCls}
                type="date"
                value={form.appliedDate ?? ""}
                onChange={(e) => set("appliedDate", e.target.value || null)}
              />
            </div>
            <div>
              <label className={labelCls}>{t.dashboard.nextFollowUp}</label>
              <input
                className={inputCls}
                type="date"
                value={form.nextFollowUpDate ?? ""}
                onChange={(e) => set("nextFollowUpDate", e.target.value || null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.dashboard.columns.location}</label>
              <input className={inputCls} value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{t.dashboard.columns.salary}</label>
              <input className={inputCls} value={form.salary ?? ""} onChange={(e) => set("salary", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>{locale === "es" ? "Seguimiento" : "Tracking"}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const currentTags = form.tags ?? [];
                  const nextTags = currentTags.includes("CV Visto")
                    ? currentTags.filter((t) => t !== "CV Visto")
                    : [...currentTags, "CV Visto"];
                  set("tags", nextTags);
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  (form.tags ?? []).includes("CV Visto")
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <FileText className="h-4 w-4" />
                {locale === "es" ? "CV Visto" : "CV Seen"}
              </button>

              <button
                type="button"
                onClick={() => {
                  const currentTags = form.tags ?? [];
                  const nextTags = currentTags.includes("Solicitud Vista")
                    ? currentTags.filter((t) => t !== "Solicitud Vista")
                    : [...currentTags, "Solicitud Vista"];
                  set("tags", nextTags);
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  (form.tags ?? []).includes("Solicitud Vista")
                    ? "border-purple-500/30 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Eye className="h-4 w-4" />
                {locale === "es" ? "Vista" : "Seen"}
              </button>

              <button
                type="button"
                onClick={() => {
                  const currentTags = form.tags ?? [];
                  const nextTags = currentTags.includes("Carta Presentación")
                    ? currentTags.filter((t) => t !== "Carta Presentación")
                    : [...currentTags, "Carta Presentación"];
                  set("tags", nextTags);
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  (form.tags ?? []).includes("Carta Presentación")
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Mail className="h-4 w-4" />
                {locale === "es" ? "Carta" : "Cover Letter"}
              </button>

              <button
                type="button"
                onClick={() => {
                  const currentTags = form.tags ?? [];
                  const nextTags = currentTags.includes("Cerrada")
                    ? currentTags.filter((t) => t !== "Cerrada")
                    : [...currentTags, "Cerrada"];
                  set("tags", nextTags);
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  (form.tags ?? []).includes("Cerrada")
                    ? "border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Lock className="h-4 w-4" />
                {locale === "es" ? "Cerrada" : "Closed"}
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>{t.dashboard.tags}</label>
            <input
              className={inputCls}
              value={(form.tags ?? []).join(", ")}
              onChange={(e) => set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="Frontend, Remote EU, ..."
            />
          </div>

          <div>
            <label className={labelCls}>{t.dashboard.columns.notes}</label>
            <textarea
              className={`${inputCls} resize-none h-24`}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>{t.dashboard.columns.link}</label>
            <div className="flex gap-2">
              <input className={inputCls} value={form.applicationLink ?? ""} onChange={(e) => set("applicationLink", e.target.value)} />
              {form.applicationLink && (
                <a
                  href={form.applicationLink.startsWith("http") ? form.applicationLink : `https://${form.applicationLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-1.5 rounded border border-border hover:bg-muted transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex gap-2 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t.dashboard.update}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            {t.dashboard.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
