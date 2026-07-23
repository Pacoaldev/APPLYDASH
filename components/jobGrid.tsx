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
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { GlowingButton } from "./ui/glowing-button";
import { useTheme } from "@/components/theme-provider";
import { useLocale } from "@/components/locale-provider";
import { getAgGridLocale } from "@/lib/ag-grid-locale";
import { getStatusStyle, isFollowUpDue, parseTagsInput, formatDateDDMMYY, displayStatus, canonicalStatus, displayType, canonicalType } from "@/lib/job-utils";
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
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide
        ${style.bg} ${style.text} ${style.shadow}
        translate-y-0 active:translate-y-[1px] active:shadow-none
        transition-all duration-75 select-none`}
    >
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
  onRowDoubleClick?: (job: Job) => void;
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

function parseCsvLine(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (!inQuotes && line.slice(i, i + sep.length) === sep) {
      result.push(current.trim());
      current = "";
      i += sep.length - 1;
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Auto-detect separator: semicolon or comma
  const sep = lines[0].includes(";") ? ";" : ",";

  const rawHeaders = parseCsvLine(lines[0], sep);
  // Drop leading index column (#, "", "1", etc.) if present
  const firstHeader = rawHeaders[0].replace(/^"|"$/g, "").trim();
  const skipFirst = firstHeader === "#" || firstHeader === "" || /^\d+$/.test(firstHeader);
  const headers = (skipFirst ? rawHeaders.slice(1) : rawHeaders)
    .map((h) => h.replace(/^"|"$/g, "").trim());

  return lines.slice(1).map((line) => {
    const rawValues = parseCsvLine(line, sep);
    const values = skipFirst ? rawValues.slice(1) : rawValues;
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").replace(/^"|"$/g, "").trim();
    });
    return row;
  });
}

export default function JobGrid({ data, onJobsChange, onShowHistory, onRowDoubleClick }: Props) {
  const { resolvedTheme } = useTheme();
  const { t, locale } = useLocale();
  const gridTheme = resolvedTheme === "dark" ? darkGridTheme : lightGridTheme;
  const localeText = useMemo(() => getAgGridLocale(locale), [locale]);
  const gridRef = useRef<AgGridReact<Job>>(null);
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rowData, setRowData] = useState<Job[]>(data);
  const [gridHeight, setGridHeight] = useState(GRID_MIN_H);
  const [gridWidth, setGridWidth] = useState<number | "100%">("100%");

  // Read persisted size from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const storedH = localStorage.getItem(GRID_HEIGHT_KEY);
      setGridHeight(storedH ? Math.max(GRID_MIN_H, Number(storedH)) : Math.min(480, Math.max(200, 100 + data.length * 42 + 56)));
      const storedW = localStorage.getItem(GRID_WIDTH_KEY);
      setGridWidth(storedW ? Math.max(GRID_MIN_W, Number(storedW)) : "100%");
    } catch {
      // storage blocked — use defaults
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const [dirtyRows, setDirtyRows] = useState<Map<string, Job>>(new Map()); // id → original snapshot
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Column Visibility & Drag state
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    company: true,
    position: true,
    type: true,
    appliedDate: true,
    platform: true,
    status: true,
    location: true,
    salary: true,
    tags: true,
    nextFollowUpDate: true,
    notes: true,
    daysAgo: true,
    applicationLink: true,
  });

  const toggleableColumns = useMemo(() => [
    { id: "company", label: t.dashboard.columns.company },
    { id: "position", label: t.dashboard.columns.position },
    { id: "type", label: t.dashboard.columns.type },
    { id: "appliedDate", label: t.dashboard.columns.appliedDate },
    { id: "platform", label: t.dashboard.columns.platform },
    { id: "status", label: t.dashboard.columns.status },
    { id: "location", label: t.dashboard.columns.location },
    { id: "salary", label: t.dashboard.columns.salary },
    { id: "tags", label: t.dashboard.tags },
    { id: "nextFollowUpDate", label: t.dashboard.nextFollowUp },
    { id: "notes", label: t.dashboard.columns.notes },
    { id: "daysAgo", label: locale === "es" ? "Días" : "Days" },
    { id: "applicationLink", label: t.dashboard.columns.link },
  ], [t, locale]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(event.target as Node)) {
        setShowColMenu(false);
      }
    };
    if (showColMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColMenu]);

  const onColumnStateChanged = () => {
    const api = gridRef.current?.api;
    if (api) {
      const state = api.getColumnState();
      localStorage.setItem("applydash-column-state", JSON.stringify(state));

      const nextMap: Record<string, boolean> = {};
      state.forEach((col) => {
        if (col.colId) {
          nextMap[col.colId] = !col.hide;
        }
      });
      setVisibleCols(nextMap);
    }
  };

  const toggleColumnVisibility = (colId: string) => {
    const api = gridRef.current?.api;
    if (api) {
      const isVisible = visibleCols[colId] !== false;
      api.setColumnsVisible([colId], !isVisible);
    }
  };

  const resetColumnState = () => {
    const api = gridRef.current?.api;
    if (api) {
      localStorage.removeItem("applydash-column-state");
      api.resetColumnState();
      api.sizeColumnsToFit();

      const state = api.getColumnState();
      const nextMap: Record<string, boolean> = {};
      state.forEach((col) => {
        if (col.colId) {
          nextMap[col.colId] = !col.hide;
        }
      });
      setVisibleCols(nextMap);
      toast.success(locale === "es" ? "Diseño de columnas restablecido" : "Column layout reset");
    }
  };

  const columnDefs = useMemo<ColDef<Job>[]>(
    () => {
      const c = t.dashboard.columns;
      const typeOptions = locale === "es" ? cellContents.typeEs : cellContents.type;
      const statusOptions = locale === "es" ? cellContents.statusEs : cellContents.status;
      return [
      {
        headerName: "#",
        colId: "index",
        valueGetter: "node.rowIndex + 1",
        suppressMovable: true,
        pinned: "left",
        maxWidth: 40,
        cellStyle: (p): Record<string, string> => {
          if (p.data?.id === selectedRowId) {
            const color = resolvedTheme === "dark" ? "#60A5FA" : "#087AD1";
            return {
              boxShadow: `inset 3px 0 0 0 ${color}`,
            };
          }
          return {};
        },
      },
      {
        headerName: c.company,
        field: "company",
        colId: "company",
        editable: true,
        minWidth: 130,
        tooltipField: "company",
      },
      {
        headerName: c.position,
        field: "position",
        colId: "position",
        editable: true,
        minWidth: 150,
        tooltipField: "position",
      },
      {
        headerName: c.type,
        field: "type",
        colId: "type",
        editable: true,
        minWidth: 110,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: typeOptions },
        valueGetter: (p) => displayType(p.data?.type ?? null, locale),
        valueSetter: (p) => {
          if (!p.data) return false;
          const canonical = canonicalType(String(p.newValue ?? "")) || String(p.newValue ?? "");
          if (!canonical) return false;
          p.data.type = canonical;
          // Auto-fill location when type is Remote
          if (canonical === "Remote" && (!p.data.location || p.data.location === "undisclosed")) {
            p.data.location = locale === "es" ? "Remoto" : "Remote";
          }
          return true;
        },
      },
      {
        headerName: c.appliedDate,
        field: "appliedDate",
        colId: "appliedDate",
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
      { headerName: c.platform, field: "platform", colId: "platform", editable: true, minWidth: 110 },
      {
        headerName: c.status,
        field: "status",
        colId: "status",
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
      { headerName: c.location, field: "location", colId: "location", editable: true, minWidth: 140, tooltipField: "location" },
      { headerName: c.salary, field: "salary", colId: "salary", editable: true, minWidth: 130, tooltipField: "salary" },
      {
        headerName: t.dashboard.tags,
        field: "tags",
        colId: "tags",
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
        colId: "nextFollowUpDate",
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
      { headerName: c.notes, field: "notes", colId: "notes", editable: true, flex: 2, minWidth: 120 },
      {
        headerName: locale === "es" ? "Días" : "Days",
        colId: "daysAgo",
        editable: false,
        maxWidth: 70,
        sortable: true,
        valueGetter: (p) => {
          if (!p.data?.appliedDate) return null;
          const diff = Math.floor((Date.now() - new Date(p.data.appliedDate).getTime()) / 86400000);
          return diff;
        },
        valueFormatter: (p) => p.value != null ? `${p.value}d` : "—",
        cellStyle: (p): Record<string, string> => {
          const d = p.value as number;
          if (d == null) return {};
          if (d > 21) return { color: "#f87171", fontWeight: "600" };
          if (d > 14) return { color: "#fb923c" };
          if (d > 7)  return { color: "#facc15" };
          return {};
        },
      },
      {
        headerName: c.link,
        field: "applicationLink",
        colId: "applicationLink",
        editable: true,
        minWidth: 160,
        cellRenderer: LinkCellRenderer,
        tooltipField: "applicationLink",
      },
    ];
    },
    [t, locale, selectedRowId, resolvedTheme]
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

  const onGridReady = (params: any) => {
    const storedState = localStorage.getItem("applydash-column-state");
    if (storedState) {
      try {
        params.api.applyColumnState({
          state: JSON.parse(storedState),
          applyOrder: true,
        });

        const state = params.api.getColumnState();
        const nextMap: Record<string, boolean> = {};
        state.forEach((col: any) => {
          if (col.colId) {
            nextMap[col.colId] = !col.hide;
          }
        });
        setVisibleCols(nextMap);
      } catch (e) {
        console.error("Failed to restore column state", e);
        params.api.sizeColumnsToFit();
      }
    } else {
      params.api.sizeColumnsToFit();
    }
  };

  const onFirstDataRendered = (params: any) => {
    const storedState = localStorage.getItem("applydash-column-state");
    if (!storedState) {
      params.api.sizeColumnsToFit();
    }
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
        updateRows(rowData.map((j) => (j.id === rowNode.data!.id ? (result.data as Job) : j)));
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
    setDirtyRows((prev) => {
      const next = new Map(prev);
      // Only save the original snapshot the first time this row becomes dirty
      if (!next.has(event.data.id)) {
        next.set(event.data.id, { ...event.oldValue, ...event.data, [event.column.getColId()]: event.oldValue });
      }
      return next;
    });
  };

  const handleUpdateRow = async () => {
    if (dirtyRows.size === 0) return;
    setIsUpdating(true);
    const api = gridRef.current?.api;
    api?.stopEditing();

    const ids = Array.from(dirtyRows.keys());
    let successCount = 0;
    let errorCount = 0;

    for (const id of ids) {
      const rowNode = api?.getRowNode(id);
      if (!rowNode?.data) continue;
      try {
        const result = await updateJob(rowNode.data);
        if (result.error) {
          errorCount++;
          toast.error(t.dashboard.toast.updateError, { description: result.error });
        } else if (result.success && result.data) {
          successCount++;
          updateRows(rowData.map((j) => (j.id === id ? (result.data as Job) : j)));
        }
      } catch {
        errorCount++;
        toast.error(t.dashboard.toast.unexpectedError);
      }
    }

    if (successCount > 0) {
      toast.success(successCount === 1 ? t.dashboard.toast.updateSuccess : `${successCount} ofertas actualizadas`);
    }
    setDirtyRows(new Map());
    setIsUpdating(false);
  };

  const handleCancelUpdate = () => {
    if (dirtyRows.size === 0) return;
    const api = gridRef.current?.api;
    // Restore all dirty rows to their original values
    const restores: Job[] = [];
    dirtyRows.forEach((original) => restores.push(original));
    api?.applyTransaction({ update: restores });
    setDirtyRows(new Map());
  };

  const handleDeleteRow = async () => {
    if (!selectedRowId) return;
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setShowDeleteConfirm(false);
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

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.key === "n" || e.key === "N") { e.preventDefault(); handleAddRow(); }
      if ((e.key === "s" || e.key === "S") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (tempRowId) handleSaveRow();
        else if (dirtyRows.size > 0) handleUpdateRow();
      }
      if (e.key === "Escape") {
        if (showDeleteConfirm) { setShowDeleteConfirm(false); return; }
        if (tempRowId) handleCancelAdd();
        else if (dirtyRows.size > 0) handleCancelUpdate();
        else setSelectedRowId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempRowId, dirtyRows, showDeleteConfirm]);

  const handleExportCSV = () => {
    // Export only the rows currently visible in the grid (respects active filters)
    const api = gridRef.current?.api;
    const csvContent = api?.getDataAsCsv({
      suppressQuotes: false,
      onlySelected: false,
      // exportedRows: "filteredAndSorted" is the default — exports visible rows only
    }) ?? "";
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobs.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t.dashboard.toast.exportSuccess);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      // Read as ArrayBuffer first to handle encoding detection
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Detect UTF-8 BOM (EF BB BF) or Windows-1252 by checking for high bytes
      let text: string;
      const hasBom = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
      const hasHighBytes = bytes.some(b => b > 0x7F);

      if (hasBom) {
        // UTF-8 with BOM — decode skipping the BOM
        text = new TextDecoder("utf-8").decode(bytes.slice(3));
      } else if (hasHighBytes) {
        // Try UTF-8 first; if it produces replacement characters (U+FFFD) fall back to Windows-1252
        const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
        const win1252 = new TextDecoder("windows-1252", { fatal: false }).decode(bytes);
        // Heuristic: UTF-8 decoding of Windows-1252 often produces "Ã" followed by latin chars
        text = utf8.includes("\uFFFD") || utf8.includes("Ã©") || utf8.includes("Ã±") || utf8.includes("Ã") ? win1252 : utf8;
      } else {
        // Pure ASCII — no encoding issues
        text = new TextDecoder("utf-8").decode(bytes);
      }

      const rows = parseCsv(text);
      // Normalize DD/MM/YYYY → YYYY-MM-DD
      const normalizeDate = (v: string | null) => {
        if (!v) return null;
        const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
        return v;
      };

      const mapped = rows.map((r) => ({
        company:         r.company || r.Company || r["Empresa"] || null,
        position:        r.position || r.Position || r["Puesto"] || null,
        type:            r.type || r.Type || r["Tipo"] || "Remote",
        applicationLink: r.applicationLink || r.Link || r.link || r["Enlace"] || null,
        status:          r.status || r.Status || r["Estado"] || "Applied",
        appliedDate:     normalizeDate(r.appliedDate || r["Applied Date"] || r["Fecha aplicación"] || r["Fecha aplicacion"] || null),
        location:        r.location || r.Location || r["Ubicación"] || r["Ubicacion"] || null,
        platform:        r.platform || r.Platform || r["Plataforma"] || null,
        salary:          r.salary || r.Salary || r["Salario"] || null,
        notes:           r.notes || r.Notes || r["Notas"] || null,
        nextFollowUpDate:normalizeDate(r.nextFollowUpDate || r["Next follow-up"] || r["Próximo seguimiento"] || r["Proximo seguimiento"] || null),
        tags:            r.tags || r.Tags || r["Etiquetas"] || "",
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
        {!tempRowId && dirtyRows.size === 0 && (
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
        {dirtyRows.size > 0 && (
          <>
            <GlowingButton onClick={handleUpdateRow} disabled={isUpdating} className="w-fit" variant="outline">
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4 text-green-600" />}
              {t.dashboard.update}{dirtyRows.size > 1 ? ` (${dirtyRows.size})` : ""}
            </GlowingButton>
            <GlowingButton onClick={handleCancelUpdate} disabled={isUpdating} className="w-fit" variant="ghost">
              <X className="mr-2 h-4 w-4 text-red-600" /> {t.dashboard.cancelUpdate}
            </GlowingButton>
          </>
        )}
        {selectedRowId && (
          <>
            {showDeleteConfirm ? (
              <>
                <span className="text-xs text-red-500 font-medium">¿Eliminar?</span>
                <GlowingButton onClick={handleDeleteRow} disabled={isDeleting} className="w-fit text-red-600" variant="ghost">
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4 text-red-600" />}
                  {t.dashboard.delete}
                </GlowingButton>
                <GlowingButton onClick={() => setShowDeleteConfirm(false)} className="w-fit" variant="ghost">
                  <X className="mr-2 h-4 w-4" /> {t.dashboard.cancel}
                </GlowingButton>
              </>
            ) : (
              <GlowingButton onClick={handleDeleteRow} disabled={isDeleting} className="w-fit text-red-600" variant="ghost">
                <Trash2 className="mr-2 h-4 w-4 text-red-600" /> {t.dashboard.delete}
              </GlowingButton>
            )}
            {selectedJob && onShowHistory && (
              <GlowingButton onClick={() => onShowHistory(selectedJob)} className="w-fit" variant="ghost">
                <History className="mr-2 h-4 w-4" /> {t.dashboard.history}
              </GlowingButton>
            )}
            <GlowingButton onClick={() => { setSelectedRowId(null); setShowDeleteConfirm(false); }} className="w-fit" variant="ghost">
              <X className="mr-2 h-4 w-4" /> {t.dashboard.hide}
            </GlowingButton>
          </>
        )}
        <div className="relative" ref={colMenuRef}>
          <Button
            onClick={() => setShowColMenu(!showColMenu)}
            variant="ghost"
            className="w-fit"
            title={locale === "es" ? "Mostrar/Ocultar Columnas" : "Show/Hide Columns"}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{locale === "es" ? "Columnas" : "Columns"}</span>
          </Button>

          {showColMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-slate-950/95 backdrop-blur-md p-3 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {locale === "es" ? "Columnas" : "Columns"}
                </span>
                <button
                  onClick={resetColumnState}
                  className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors cursor-pointer"
                  title={locale === "es" ? "Restablecer columnas" : "Reset columns"}
                >
                  <RotateCcw className="h-3 w-3" />
                  {locale === "es" ? "Restablecer" : "Reset"}
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {toggleableColumns.map((col) => {
                  const isVisible = visibleCols[col.id] !== false;
                  return (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer select-none text-sm transition-colors text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleColumnVisibility(col.id)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 transition-colors cursor-pointer"
                      />
                      <span>{col.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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

      <div className="hidden md:block w-full overflow-x-auto touch-pan-y">
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
            getRowClass={(p) => dirtyRows.has(p.data?.id ?? "") ? "ag-row-dirty" : ""}
            onCellValueChanged={onCellValueChanged}
            onRowClicked={(e: RowClickedEvent<Job>) => setSelectedRowId(e.data?.id ?? null)}
            onRowDoubleClicked={(e) => { if (e.data) onRowDoubleClick?.(e.data); }}
            onGridReady={onGridReady}
            onFirstDataRendered={onFirstDataRendered}
            onColumnMoved={onColumnStateChanged}
            onColumnResized={onColumnStateChanged}
            onColumnVisible={onColumnStateChanged}
            domLayout="normal"
            enableBrowserTooltips
            tooltipShowDelay={400}
          />
          </div>
        </div>
      </div>

      {/* Vista Mobile: Listado de tarjetas verticales */}
      <div className="block md:hidden space-y-3 mt-1">
        {rowData.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-border rounded-xl">
            {locale === "es" ? "No se encontraron ofertas." : "No jobs found."}
          </div>
        ) : (
          rowData.map((job) => {
            const isSelected = job.id === selectedRowId;
            const style = getStatusStyle(job.status);
            const dateFormatted = formatDateDDMMYY(job.appliedDate);

            if (job.id === tempRowId) {
              return (
                <div key={job.id} className="p-4 rounded-xl border border-blue-500 bg-slate-950 shadow-lg shadow-blue-500/10">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">{t.dashboard.columns.company}</label>
                      <input
                        className="w-full px-3 py-1.5 rounded-md border border-border bg-slate-900 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={job.company ?? ""}
                        onChange={(e) => {
                          const updated = rowData.map(j => j.id === job.id ? { ...j, company: e.target.value } : j);
                          setRowData(updated);
                        }}
                        placeholder={t.dashboard.columns.company}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">{t.dashboard.columns.position}</label>
                      <input
                        className="w-full px-3 py-1.5 rounded-md border border-border bg-slate-900 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={job.position ?? ""}
                        onChange={(e) => {
                          const updated = rowData.map(j => j.id === job.id ? { ...j, position: e.target.value } : j);
                          setRowData(updated);
                        }}
                        placeholder={t.dashboard.columns.position}
                      />
                    </div>
                    <div className="flex gap-2">
                      <GlowingButton onClick={handleSaveRow} disabled={isSaving} className="flex-1 text-xs" variant="outline">
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 text-green-600 mr-1" />}
                        {t.dashboard.save}
                      </GlowingButton>
                      <GlowingButton onClick={handleCancelAdd} disabled={isSaving} className="flex-1 text-xs" variant="ghost">
                        <X className="h-3 w-3 text-red-600 mr-1" /> {t.dashboard.cancel}
                      </GlowingButton>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={job.id}
                onClick={() => setSelectedRowId(job.id)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-blue-500 bg-slate-900 shadow-lg shadow-blue-500/10"
                    : "border-border/60 bg-slate-900/40 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-100 text-base leading-snug truncate">
                      {job.position || "—"}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium truncate">
                      {job.company || "—"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${style.bg} ${style.text}`}
                  >
                    {displayStatus(job.status, locale)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block mb-0.5">{t.dashboard.columns.appliedDate}</span>
                    <span className="text-slate-300">{dateFormatted || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">{t.dashboard.columns.type}</span>
                    <span className="text-slate-300">{displayType(job.type, locale)}</span>
                  </div>
                  {job.location && job.location !== "undisclosed" && (
                    <div className="min-w-0">
                      <span className="text-slate-500 block mb-0.5">{t.dashboard.columns.location}</span>
                      <span className="truncate block text-slate-300">{job.location}</span>
                    </div>
                  )}
                  {job.salary && job.salary !== "0" && (
                    <div>
                      <span className="text-slate-500 block mb-0.5">{t.dashboard.columns.salary}</span>
                      <span className="text-slate-300">{job.salary}</span>
                    </div>
                  )}
                </div>

                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {job.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {isSelected && (
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800/60">
                    {onShowHistory && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowHistory(job);
                        }}
                      >
                        <History className="h-3.5 w-3.5 mr-1" />
                        {t.dashboard.history}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowDoubleClick?.(job);
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      {locale === "es" ? "Editar" : "Edit"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
