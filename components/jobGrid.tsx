"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import {
  CellValueChangedEvent,
  ColDef,
  ICellRendererParams,
  RowClickedEvent,
  themeQuartz,
} from "ag-grid-community";
import { Job } from "@/types/job";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { createJob, updateJob, deleteJob, importJobs } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Check,
  Download,
  Loader2,
  PlusCircle,
  X,
  Trash2,
  Upload,
  History,
  ExternalLink,
  Bell,
} from "lucide-react";
import { GlowingButton } from "./ui/glowing-button";
import { useTheme } from "@/components/theme-provider";
import { useLocale } from "@/components/locale-provider";
import { getAgGridLocale } from "@/lib/ag-grid-locale";
import { getStatusStyle, isFollowUpDue, parseTagsInput, formatDateDDMMYY, displayStatus, canonicalStatus } from "@/lib/job-utils";
import cellContents from "@/data/cellContents";

const GRID_HEIGHT_KEY = "applydash-grid-height";
const GRID_WIDTH_KEY = "applydash-grid-width";
const GRID_MIN_H = 160;
const GRID_MIN_W = 600;

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

ModuleRegistry.registerModules([AllCommunityModule]);

const lightGridTheme = themeQuartz.withParams({
  accentColor: "#087AD1",
  backgroundColor: "#FFFFFF",
  borderColor: "#D7E2E6",
  borderRadius: 2,
  browserColorScheme: "light",
  cellHorizontalPaddingScale: 1,
  chromeBackgroundColor: { ref: "backgroundColor" },
  columnBorder: true,
  fontSize: 13,
  foregroundColor: "#555B62",
  headerBackgroundColor: "#FFFFFF",
  headerFontWeight: 400,
  headerTextColor: "#84868B",
  rowBorder: true,
  rowVerticalPaddingScale: 0.8,
  sidePanelBorder: true,
  spacing: 6,
  wrapperBorder: true,
  wrapperBorderRadius: 10,
});

const darkGridTheme = themeQuartz.withParams({
  accentColor: "#60A5FA",
  backgroundColor: "#1e293b",
  borderColor: "#334155",
  borderRadius: 2,
  browserColorScheme: "dark",
  cellHorizontalPaddingScale: 1,
  chromeBackgroundColor: { ref: "backgroundColor" },
  columnBorder: true,
  fontSize: 13,
  foregroundColor: "#cbd5e1",
  headerBackgroundColor: "#0f172a",
  headerFontWeight: 400,
  headerTextColor: "#94a3b8",
  rowBorder: true,
  rowVerticalPaddingScale: 0.8,
  sidePanelBorder: true,
  spacing: 6,
  wrapperBorder: true,
  wrapperBorderRadius: 10,
});

function StatusCellRenderer(params: ICellRendererParams<Job>) {
  const { locale } = useLocale();
  const style = getStatusStyle(params.data?.status ?? null);
  const label = displayStatus(params.data?.status ?? null, locale);
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {label}
    </span>
  );
}

function LinkCellRenderer(params: ICellRendererParams<Job>) {
  const url = params.value as string | null;
  if (!url) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={url.startsWith("http") ? url : `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline truncate"
      onClick={(e) => e.stopPropagation()}
    >
      <ExternalLink className="h-3 w-3 shrink-0" />
      <span className="truncate">{url.replace(/^https?:\/\//, "").slice(0, 30)}</span>
    </a>
  );
}

function FollowUpCellRenderer(params: ICellRendererParams<Job>) {
  const job = params.data;
  if (!job) return null;
  const due = isFollowUpDue(job);
  const display = formatDateDDMMYY(params.value as string);
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${due ? "text-cyan-600 font-semibold" : ""}`}>
      {due && <Bell className="h-3 w-3" />}
      {display || "—"}
    </span>
  );
}


type Props = {
  data: Job[];
  onJobsChange?: (jobs: Job[]) => void;
  onShowHistory?: (job: Job) => void;
};

function getInitialGridWidth(): number | "100%" {
  if (typeof window === "undefined") return "100%";
  try {
    const stored = localStorage.getItem(GRID_WIDTH_KEY);
    if (stored) return Math.max(GRID_MIN_W, Number(stored));
  } catch {
    // ponytail: ignore
  }
  return "100%";
}

function getInitialGridHeight(rowCount: number): number {
  if (typeof window === "undefined") return 280;
  try {
    const stored = localStorage.getItem(GRID_HEIGHT_KEY);
    if (stored) return Math.max(GRID_MIN_H, Number(stored));
  } catch {
    // ponytail: storage blocked
  }
  return Math.min(480, Math.max(200, 100 + rowCount * 42 + 56));
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.match(/("([^"]|"")*"|[^,]*)/g) ?? [];
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").trim().replace(/^"|"$/g, "").replace(/""/g, '"');
    });
    return row;
  });
}

export default function JobGrid({ data, onJobsChange, onShowHistory }: Props) {
  const { resolvedTheme } = useTheme();
  const { t, locale } = useLocale();
  const gridTheme = resolvedTheme === "dark" ? darkGridTheme : lightGridTheme;
  const localeText = useMemo(() => getAgGridLocale(locale), [locale]);
  const gridRef = useRef<AgGridReact<Job>>(null);
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rowData, setRowData] = useState<Job[]>(data);
  const [gridHeight, setGridHeight] = useState(() => getInitialGridHeight(data.length));
  const [gridWidth, setGridWidth] = useState<number | "100%">(() => getInitialGridWidth());

  const updateRows = (next: Job[]) => {
    setRowData(next);
    onJobsChange?.(next);
  };

  useEffect(() => {
    setRowData(data);
  }, [data]);

  useEffect(() => {
    const el = gridWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      const w = el.offsetWidth;
      if (h >= GRID_MIN_H) {
        setGridHeight(h);
        try {
          localStorage.setItem(GRID_HEIGHT_KEY, String(h));
        } catch {
          // ponytail: ignore
        }
      }
      if (w >= GRID_MIN_W) {
        setGridWidth(w);
        try {
          localStorage.setItem(GRID_WIDTH_KEY, String(w));
        } catch {
          // ponytail: ignore
        }
        gridRef.current?.api?.sizeColumnsToFit();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [tempRowId, setTempRowId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dirtyRowId, setDirtyRowId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const originalRowData = useRef<Job | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const columnDefs = useMemo<ColDef<Job>[]>(
    () => {
      const c = t.dashboard.columns;
      const typeOptions = locale === "es" ? cellContents.typeEs : cellContents.type;
      const statusOptions = locale === "es" ? cellContents.statusEs : cellContents.status;
      return [
      {
        headerName: "#",
        valueGetter: "node.rowIndex + 1",
        suppressMovable: true,
        pinned: "left",
        maxWidth: 40,
      },
      {
        headerName: c.company,
        field: "company",
        editable: true,
        minWidth: 130,
        tooltipField: "company",
      },
      {
        headerName: c.position,
        field: "position",
        editable: true,
        minWidth: 150,
        tooltipField: "position",
      },
      {
        headerName: c.type,
        field: "type",
        editable: true,
        minWidth: 110,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: typeOptions },
      },
      {
        headerName: c.appliedDate,
        field: "appliedDate",
        editable: true,
        minWidth: 110,
        cellEditor: "agDateCellEditor",
        valueFormatter: (p) => formatDateDDMMYY(p.value),
        valueParser: (p) => {
          if (!p.newValue) return null;
          const d = new Date(p.newValue);
          return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
        },
      },
      { headerName: c.platform, field: "platform", editable: true, minWidth: 110 },
      {
        headerName: c.status,
        field: "status",
        editable: true,
        minWidth: 120,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: statusOptions },
        valueGetter: (p) => displayStatus(p.data?.status ?? null, locale),
        valueSetter: (p) => {
          if (!p.data) return false;
          const next = canonicalStatus(String(p.newValue ?? "")) || String(p.newValue ?? "");
          if (!next) return false;
          p.data.status = next;
          return true;
        },
        cellRenderer: StatusCellRenderer,
      },
      { headerName: c.location, field: "location", editable: true, minWidth: 140, tooltipField: "location" },
      { headerName: c.salary, field: "salary", editable: true, minWidth: 130, tooltipField: "salary" },
      {
        headerName: t.dashboard.tags,
        field: "tags",
        editable: true,
        valueGetter: (p) => (p.data?.tags ?? []).join(", "),
        valueSetter: (p) => {
          if (p.data) p.data.tags = parseTagsInput(p.newValue ?? "");
          return true;
        },
      },
      {
        headerName: t.dashboard.nextFollowUp,
        field: "nextFollowUpDate",
        editable: true,
        minWidth: 110,
        cellEditor: "agDateCellEditor",
        cellRenderer: FollowUpCellRenderer,
        valueFormatter: (p) => formatDateDDMMYY(p.value),
        valueParser: (p) => {
          if (!p.newValue) return null;
          const d = new Date(p.newValue);
          return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
        },
      },
      { headerName: c.notes, field: "notes", editable: true, flex: 2, minWidth: 120 },
      {
        headerName: c.link,
        field: "applicationLink",
        editable: true,
        minWidth: 160,
        cellRenderer: LinkCellRenderer,
        tooltipField: "applicationLink",
      },
    ];
    },
    [t, locale]
  );

  const defaultColDef = useMemo<ColDef<Job>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 120,
      wrapText: true,
      autoHeight: false,
      tooltipValueGetter: (p) => (p.value != null ? String(p.value) : undefined),
    }),
    []
  );

  const fitColumns = () => {
    gridRef.current?.api?.sizeColumnsToFit();
  };

  const handleAddRow = () => {
    if (tempRowId) return;
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const nextFollowUp = new Date();
    nextFollowUp.setDate(nextFollowUp.getDate() + 7);
    const nextFollowUpString = `${nextFollowUp.getFullYear()}-${String(nextFollowUp.getMonth() + 1).padStart(2, "0")}-${String(nextFollowUp.getDate()).padStart(2, "0")}`;

    const newRow: Job = {
      id: `temp_${uuidv4()}`,
      company: "",
      position: "",
      type: "Office",
      appliedDate: todayString,
      status: "Applied",
      platform: "",
      applicationLink: "",
      location: "undisclosed",
      salary: "0",
      notes: " ",
      nextFollowUpDate: nextFollowUpString,
      tags: [],
      userid: "temp",
    };

    setTempRowId(newRow.id);
    updateRows([...rowData, newRow]);
    setTimeout(() => {
      const api = gridRef.current?.api;
      const node = api?.getRowNode(newRow.id);
      if (node && typeof node.rowIndex === "number") {
        api?.ensureNodeVisible(node);
        api?.startEditingCell({ rowIndex: node.rowIndex, colKey: "company" });
      }
    }, 0);
  };

  const handleSaveRow = async () => {
    if (!tempRowId) return;
    setIsSaving(true);
    const api = gridRef.current?.api;
    if (!api) {
      setIsSaving(false);
      return;
    }
    api.stopEditing();
    const rowNode = api.getRowNode(tempRowId);
    if (!rowNode?.data) {
      toast.error(t.dashboard.toast.rowNotFound);
      setIsSaving(false);
      return;
    }
    try {
      const result = await createJob({ ...rowNode.data, type: rowNode.data.type || "Office" });
      if (result.error) {
        toast.error(t.dashboard.toast.saveError, { description: result.error });
      } else if (result.success && result.data) {
        toast.success(t.dashboard.toast.saveSuccess);
        updateRows([
          ...rowData.filter((j) => j.id !== rowNode.data!.id),
          result.data as Job,
        ]);
        setTempRowId(null);
      }
    } catch {
      toast.error(t.dashboard.toast.unexpectedError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAdd = () => {
    if (!tempRowId) return;
    updateRows(rowData.filter((j) => j.id !== tempRowId));
    setTempRowId(null);
  };

  const onCellValueChanged = (event: CellValueChangedEvent<Job>) => {
    if (event.data.id.toString().startsWith("temp_")) return;
    if (!dirtyRowId) {
      originalRowData.current = { ...event.data };
      setDirtyRowId(event.data.id);
    } else if (dirtyRowId !== event.data.id) {
      originalRowData.current = { ...event.data };
      setDirtyRowId(event.data.id);
    }
  };

  const handleUpdateRow = async () => {
    if (!dirtyRowId) return;
    setIsUpdating(true);
    const api = gridRef.current?.api;
    const rowNode = api?.getRowNode(dirtyRowId);
    if (!rowNode?.data) {
      toast.error(t.dashboard.toast.rowNotFound);
      setIsUpdating(false);
      return;
    }
    try {
      const result = await updateJob(rowNode.data);
      if (result.error) {
        toast.error(t.dashboard.toast.updateError, { description: result.error });
      } else if (result.success && result.data) {
        toast.success(t.dashboard.toast.updateSuccess);
        updateRows(rowData.map((j) => (j.id === rowNode.data!.id ? (result.data as Job) : j)));
        setDirtyRowId(null);
        originalRowData.current = null;
      }
    } catch {
      toast.error(t.dashboard.toast.unexpectedError);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelUpdate = () => {
    if (!dirtyRowId || !originalRowData.current) return;
    const api = gridRef.current?.api;
    api?.applyTransaction({ update: [{ ...originalRowData.current }] });
    setDirtyRowId(null);
    originalRowData.current = null;
  };

  const handleDeleteRow = async () => {
    if (!selectedRowId) return;
    setIsDeleting(true);
    const rowNode = gridRef.current?.api?.getRowNode(selectedRowId);
    if (!rowNode?.data) {
      setIsDeleting(false);
      return;
    }
    try {
      const result = await deleteJob(rowNode.data.id);
      if (result.error) {
        toast.error(t.dashboard.toast.deleteError, { description: result.error });
      } else {
        toast.success(t.dashboard.toast.deleteSuccess);
        updateRows(rowData.filter((j) => j.id !== rowNode.data!.id));
        setSelectedRowId(null);
      }
    } catch {
      toast.error(t.dashboard.toast.unexpectedError);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    gridRef.current?.api?.exportDataAsCsv({ fileName: "jobs.csv" });
    toast.success(t.dashboard.toast.exportSuccess);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const mapped = rows.map((r) => ({
        company: r.company || r.Company || null,
        position: r.position || r.Position || null,
        type: r.type || r.Type || "Remote",
        applicationLink: r.applicationLink || r.Link || r.link || null,
        status: r.status || r.Status || "Applied",
        appliedDate: r.appliedDate || r["Applied Date"] || null,
        location: r.location || r.Location || null,
        platform: r.platform || r.Platform || null,
        salary: r.salary || r.Salary || null,
        notes: r.notes || r.Notes || null,
        nextFollowUpDate: r.nextFollowUpDate || r["Next follow-up"] || null,
        tags: r.tags || r.Tags || "",
      }));
      if (mapped.length === 0) {
        toast.error(t.dashboard.importError, {
          description: "El CSV está vacío o no tiene filas de datos.",
        });
        return;
      }
      const result = await importJobs(mapped);
      if (result.error) {
        toast.error(t.dashboard.importError, { description: result.error });
      } else {
        toast.success(t.dashboard.importSuccess.replace("{count}", String(result.imported ?? 0)));
        if (result.errors?.length) {
          toast.warning(`${result.errors.length} fila(s) no se importaron.`);
        }
        window.location.reload();
      }
    } catch (error) {
      toast.error(t.dashboard.importError, {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const selectedJob = rowData.find((j) => j.id === selectedRowId);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {!tempRowId && !dirtyRowId && (
          <GlowingButton onClick={handleAddRow} className="w-fit" variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> {t.dashboard.addJob}
          </GlowingButton>
        )}
        {tempRowId && (
          <>
            <GlowingButton onClick={handleSaveRow} disabled={isSaving} className="w-fit" variant="outline">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4 text-green-600" />}
              {t.dashboard.save}
            </GlowingButton>
            <GlowingButton onClick={handleCancelAdd} disabled={isSaving} className="w-fit" variant="ghost">
              <X className="mr-2 h-4 w-4 text-red-600" /> {t.dashboard.cancel}
            </GlowingButton>
          </>
        )}
        {dirtyRowId && (
          <>
            <GlowingButton onClick={handleUpdateRow} disabled={isUpdating} className="w-fit" variant="outline">
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4 text-green-600" />}
              {t.dashboard.update}
            </GlowingButton>
            <GlowingButton onClick={handleCancelUpdate} disabled={isUpdating} className="w-fit" variant="ghost">
              <X className="mr-2 h-4 w-4 text-red-600" /> {t.dashboard.cancelUpdate}
            </GlowingButton>
          </>
        )}
        {selectedRowId && (
          <>
            <GlowingButton onClick={handleDeleteRow} disabled={isDeleting} className="w-fit text-red-600" variant="ghost">
              <Trash2 className="mr-2 h-4 w-4 text-red-600" /> {t.dashboard.delete}
            </GlowingButton>
            {selectedJob && onShowHistory && (
              <GlowingButton onClick={() => onShowHistory(selectedJob)} className="w-fit" variant="ghost">
                <History className="mr-2 h-4 w-4" /> {t.dashboard.history}
              </GlowingButton>
            )}
            <GlowingButton onClick={() => setSelectedRowId(null)} className="w-fit" variant="ghost">
              <X className="mr-2 h-4 w-4" /> {t.dashboard.hide}
            </GlowingButton>
          </>
        )}
        <Button onClick={handleExportCSV} variant="ghost" className="w-fit" title={t.dashboard.export}>
          <Download className="mr-2 h-4 w-4" />
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          className="w-fit"
          disabled={isImporting}
          title={t.dashboard.import}
        >
          {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        </Button>
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
      </div>

      <div className="w-full overflow-x-auto touch-pan-y">
        <div
          ref={gridWrapRef}
          title={t.dashboard.resizeHint}
          className="ag-theme-quartz resize overflow-hidden min-h-[160px] max-h-[92dvh] border border-border rounded-lg"
          style={{
            height: gridHeight,
            width: gridWidth === "100%" ? "100%" : gridWidth,
            minWidth: "100%",
            touchAction: "pan-y",
          }}
        >
          <div className="w-full h-full">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows
            pagination
            theme={gridTheme}
            localeText={localeText}
            stopEditingWhenCellsLoseFocus
            getRowId={(p) => p.data.id}
            onCellValueChanged={onCellValueChanged}
            onRowClicked={(e: RowClickedEvent<Job>) => setSelectedRowId(e.data?.id ?? null)}
            onGridReady={fitColumns}
            onFirstDataRendered={fitColumns}
            domLayout="normal"
            enableBrowserTooltips
            tooltipShowDelay={400}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
