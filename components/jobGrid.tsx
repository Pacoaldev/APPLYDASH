"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  CellValueChangedEvent,
  ColDef,
  RowClickedEvent,
  themeQuartz,
} from "ag-grid-community";
import { Job } from "@/types/job";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { createJob, updateJob } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Check, Download, Loader2, PlusCircle, X } from "lucide-react";
import { Trash2 } from "lucide-react";
import { deleteJob } from "@/app/dashboard/actions";
import { GlowingButton } from "./ui/glowing-button";
import cellContents from "@/data/cellContents";

// Utility function to generate UUIDs compatible in any environment
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

ModuleRegistry.registerModules([AllCommunityModule]);

const myTheme = themeQuartz.withParams({
  accentColor: "#087AD1",
  backgroundColor: "#FFFFFF",
  borderColor: "#D7E2E6",
  borderRadius: 2,
  browserColorScheme: "light",
  cellHorizontalPaddingScale: 1,
  chromeBackgroundColor: {
    ref: "backgroundColor",
  },
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

type Props = {
  data: Job[];
};

export default function JobGrid({ data }: Props) {
  const gridRef = useRef<AgGridReact<Job>>(null);
  const [rowData, setRowData] = useState<Job[]>(data);
  // Sync local state with prop data whenever it changes
    // Synchronize local state with prop data whenever it changes
  useEffect(() => {
    setRowData(data);
  }, [data]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('JobGrid rowData:', rowData);
    }
  }, [rowData]);

  const [tempRowId, setTempRowId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [dirtyRowId, setDirtyRowId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const originalRowData = useRef<Job | null>(null);

  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  const [columnDefs] = useState<ColDef<Job>[]>([
    {
      headerName: "#",
      valueGetter: "node.rowIndex + 1",
      suppressMovable: true,
      pinned: "left",
      maxWidth: 40,
    },
    {
      headerName: "Company",
      field: "company",
      editable: true,
    },
    {
      headerName: "Position",
      field: "position",
      editable: true,
    },
    {
      headerName: "Type",
      field: "type",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Remote", "Office", "Hybrid"],
      },
    },
    {
      headerName: "Applied Date",
      field: "appliedDate",
      editable: (params) => !!(params.data && params.data.id && params.data.id.toString().startsWith("temp_")),
      cellEditor: "agDateCellEditor",
      valueFormatter: (params) => {
        return params.value || "";
      },
      valueParser: (params) => {
        if (!params.newValue) return null;
        const d = new Date(params.newValue);
        if (isNaN(d.getTime())) return null;
        return d.toISOString().split("T")[0];
      },
    },
    { headerName: "Platform", field: "platform", editable: true },
    {
      headerName: "Status",
      field: "status",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: cellContents.status,
      },
    },
    { headerName: "Location", field: "location", editable: true },
    { headerName: "Salary", field: "salary", editable: true },
    { headerName: "Notes", field: "notes", editable: true, flex: 2 },
    { headerName: "Link", field: "applicationLink", editable: true },
  ]);

  const defaultColDef = useMemo<ColDef<Job>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  const handleAddRow = () => {
    if (tempRowId) return;

    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const newRow: Job = {
      id: `temp_${uuidv4()}`,
      company: "",
      position: "",
      type: "Office", // default value
      appliedDate: todayString,
      status: "Applied",
      platform: "",
      applicationLink: "",
      location: "undisclosed",
      salary: "0",
      notes: " ",
      userid: "temp", // satisfies Job type, backend will set actual value
    };

    setTempRowId(newRow.id);
    setRowData(prev => [...prev, newRow]);
    setTimeout(() => {
      const gridApi = gridRef.current?.api;
      if (gridApi) {
        const rowNode = gridApi.getRowNode(newRow.id);
        if (rowNode && typeof rowNode.rowIndex === "number") {
          gridApi.ensureNodeVisible(rowNode);
          gridApi.startEditingCell({
            rowIndex: rowNode.rowIndex,
            colKey: "company"
          });
        }
      }
    }, 0);
  };

  const handleSaveRow = async () => {
    if (!tempRowId) return;
    setIsSaving(true);

    const gridApi = gridRef.current?.api;
    if (!gridApi) {
      setIsSaving(false);
      return;
    }

    gridApi.stopEditing();
    const rowNode = gridApi.getRowNode(tempRowId);
    if (!rowNode || !rowNode.data) {
      toast.error("Could not find the new row to save.");
      return;
    }
    try {
      // Ensure type is present in payload
      const payload = { ...rowNode.data, type: rowNode.data.type || "Office" };
      const result = await createJob(payload);
      if (result.error) {
        toast.error("Failed to save job", { description: result.error });
      } else if (result.success && result.data) {
        toast.success("Job saved successfully!");
        if (rowNode.data) {
          setRowData(prev => [
            ...prev.filter(j => j.id !== rowNode.data!.id),
            { ...result.data, type: ("type" in result.data ? (result.data as any).type : (rowNode.data && rowNode.data.type) || "Office") }
          ]);
        }
        setTempRowId(null); // Hide Save/Cancel buttons
      }
    } catch (error) {
      toast.error("An unexpected error occurred while saving." + error);
    } finally {
      setIsSaving(false); // Ensure loading state is always turned off
    }
  };

  const handleCancelAdd = () => {
    if (!tempRowId) return;

  setRowData(prev => prev.filter(j => j.id !== tempRowId));
  setTempRowId(null);
  };

  const onCellValueChanged = (event: CellValueChangedEvent<Job>) => {
    // Prevent updating appliedDate for non-temp rows
    if (event.colDef.field === "appliedDate" && !(event.data.id.toString().startsWith("temp_"))) {
      const gridApi = gridRef.current?.api;
      if (gridApi && originalRowData.current) {
        gridApi.applyTransaction({ update: [{ ...event.data, appliedDate: originalRowData.current.appliedDate }] });
      }
      return;
    }
    // Always revert appliedDate to original value for non-temp rows
    if (!event.data.id.toString().startsWith("temp_")) {
      if (originalRowData.current && event.data.appliedDate !== originalRowData.current.appliedDate) {
        const gridApi = gridRef.current?.api;
        if (gridApi) {
          gridApi.applyTransaction({ update: [{ ...event.data, appliedDate: originalRowData.current.appliedDate }] });
        }
      }
    }
    // Si es temp row, no marcar dirty
    // If it is a temp row, do not mark as dirty
    if (event.data.id.toString().startsWith("temp_")) return;

    // Si el campo cambiado es 'type' o cualquier otro editable, marcar dirty y guardar el estado original si no está
    // If the changed field is 'type' or any other editable, mark as dirty and save the original state if not already set
    if (!dirtyRowId) {
      originalRowData.current = { ...event.data };
      setDirtyRowId(event.data.id);
      return;
    }
    // Si ya está dirty, actualizar el estado original solo si el id cambió
    // If already dirty, update the original state only if the id changed
    if (dirtyRowId !== event.data.id) {
      originalRowData.current = { ...event.data };
      setDirtyRowId(event.data.id);
      return;
    }
    // Si el valor de 'type' cambió, mantener dirty
    // If the value of 'type' changed, keep dirty
    if (event.colDef.field === "type") {
      setDirtyRowId(event.data.id);
      return;
    }
    // Para cualquier otro campo editable, mantener dirty
    // For any other editable field, keep dirty
    setDirtyRowId(event.data.id);
  };

  const handleUpdateRow = async () => {
    if (!dirtyRowId) return;
    setIsUpdating(true);
    const gridApi = gridRef.current?.api;
    if (!gridApi) {
      setIsUpdating(false);
      return;
    }
    const rowNode = gridApi.getRowNode(dirtyRowId);
    if (!rowNode || !rowNode.data) {
      toast.error("Could not find the row to update.");
      setIsUpdating(false);
      return;
    }
    try {
      // Preserve only original appliedDate, use current values for other fields
    // Preserve only the original appliedDate, use current values for other fields
      let appliedDateValue = originalRowData.current?.appliedDate ?? rowNode.data.appliedDate;
      if (appliedDateValue && appliedDateValue.length === 10) {
        appliedDateValue = new Date(appliedDateValue).toISOString();
      }
      const updatePayload = {
        ...rowNode.data,
        appliedDate: appliedDateValue
      };
      const result = await updateJob(updatePayload);
      if (result.error) {
        toast.error("Failed to update job", { description: result.error });
      } else if (result.success && result.data) {
        toast.success("Job updated successfully!");
        // Actualiza el estado local rowData con el valor editado
    // Update the local rowData state with the edited value
        if (rowNode.data) {
          setRowData(prev => prev.map(j =>
            j.id === rowNode.data!.id
              ? { ...result.data, type: rowNode.data!.type }
              : j
          ));
        }
        gridApi.applyTransaction({ update: [{ ...result.data, type: rowNode.data.type }] });
        gridApi.refreshClientSideRowModel("sort");
        setDirtyRowId(null);
        originalRowData.current = null;
      }
    } catch (error) {
      toast.error("An unexpected error occurred while updating." + error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelUpdate = () => {
    if (!dirtyRowId || !originalRowData.current) return;
    const gridApi = gridRef.current?.api;
    if (!gridApi) return;
  // Revert the row to its original state, ensure type is present
    // Revert the row to its original state, ensure type is present
  gridApi.applyTransaction({ update: [{ ...originalRowData.current, type: originalRowData.current.type || "Office" }] });
  setDirtyRowId(null);
  originalRowData.current = null;
  };

  const handleDeleteRow = async () => {
    if (!selectedRowId) return;
    setIsDeleting(true);
    const gridApi = gridRef.current?.api;
    if (!gridApi) {
      setIsDeleting(false);
      return;
    }
    const rowNode = gridApi.getRowNode(selectedRowId);
    if (!rowNode || !rowNode.data) {
      toast.error("Could not find the row to delete.");
      setIsDeleting(false);
      return;
    }
    try {
      const result = await deleteJob(rowNode.data.id);
      if (result.error) {
        toast.error("Failed to delete job", { description: result.error });
      } else {
        toast.success("Job deleted successfully!");
        if (rowNode.data) {
          setRowData(prev => prev.filter(j => j.id !== rowNode.data!.id));
        }
        setSelectedRowId(null);
        setConfirmDelete(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred while deleting." + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const gridApi = gridRef.current?.api;
    if (gridApi) {
      gridApi.exportDataAsCsv({ fileName: "jobs.csv" });
      toast.success("CSV downloaded!");
    }
  };

  const handleHideRow = () => {
    setSelectedRowId(null);
    setConfirmDelete(false);
  };

  const onRowClicked = (event: RowClickedEvent<Job>) => {
    setSelectedRowId(event?.data?.id || null);
    setConfirmDelete(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {!tempRowId && !dirtyRowId && (
          <GlowingButton onClick={handleAddRow} className="w-fit" variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Job
          </GlowingButton>
        )}
        {tempRowId && (
          <>
            <GlowingButton
              onClick={handleSaveRow}
              disabled={isSaving}
              className="w-fit"
              variant="outline"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4 text-green-600" />
              )}
              Save
            </GlowingButton>
            <GlowingButton
              onClick={handleCancelAdd}
              disabled={isSaving}
              className="w-fit"
              variant="ghost"
            >
              <X className="mr-2 h-4 w-4 text-red-600" /> Cancel
            </GlowingButton>
          </>
        )}
        {dirtyRowId && (
          <>
            <GlowingButton
              onClick={handleUpdateRow}
              disabled={isUpdating}
              className="w-fit"
              variant="outline"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4 text-green-600" />
              )}
              Update
            </GlowingButton>
            <GlowingButton
              onClick={handleCancelUpdate}
              disabled={isUpdating}
              className="w-fit"
              variant="ghost"
            >
              <X className="mr-2 h-4 w-4 text-red-600" /> Cancel Update
            </GlowingButton>
          </>
        )}
        {selectedRowId && (
          <>
            <GlowingButton
              onClick={handleDeleteRow}
              disabled={isDeleting}
              className="w-fit text-red-600"
              variant="ghost"
            >
              <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Delete
            </GlowingButton>
            <GlowingButton
              onClick={handleHideRow}
              className="w-fit"
              variant="ghost"
            >
              <X className="mr-2 h-4 w-4" /> Hide
            </GlowingButton>
          </>
        )}
        <Button onClick={handleExportCSV} variant="ghost" className="w-fit">
          <Download className="mr-2 h-4 w-4" />
        </Button>
      </div>
      {/* Responsive table wrapper con altura mínima */}
    {/* Responsive table wrapper with minimum height */}
      <div className="w-full overflow-x-auto">
        <div className="ag-theme-quartz min-w-[900px] min-h-[300px] h-[400px] sm:h-[500px]">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            pagination={true}
            theme={myTheme}
            stopEditingWhenCellsLoseFocus={true}
            getRowId={(params) => params.data.id}
            onCellValueChanged={onCellValueChanged}
            onRowClicked={onRowClicked}
            suppressHorizontalScroll={false}
          />
        </div>
      </div>
    </div>
  );
}