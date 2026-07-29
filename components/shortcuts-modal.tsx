"use client";

import { useLocale } from "@/components/locale-provider";
import { X, Keyboard } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ShortcutsModal({ isOpen, onClose }: Props) {
  const { t } = useLocale();

  if (!isOpen) return null;

  const shortcuts = [
    { key: "N", description: (t.dashboard as any).shortcutsNew || "New job" },
    { key: "S", description: (t.dashboard as any).shortcutsSave || "Save / Update changes" },
    { key: "Esc", description: (t.dashboard as any).shortcutsClose || "Cancel / Close panel" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-foreground">
              {(t.dashboard as any).shortcutsTitle || "Keyboard Shortcuts"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {shortcuts.map(({ key, description }) => (
              <div key={key} className="flex items-center justify-between gap-4 py-1">
                <span className="text-sm text-muted-foreground">{description}</span>
                <kbd className="inline-flex items-center justify-center min-w-10 h-7 px-1.5 text-xs font-semibold font-mono text-foreground bg-muted border border-border rounded-md shadow-sm">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
