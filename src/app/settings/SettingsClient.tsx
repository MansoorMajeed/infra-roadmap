"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getResumePref,
  setResumePref,
  getProgressStats,
  resetProgress,
  resetAllData,
  exportAllData,
  importAllData,
  type ResumePref,
  type SaveFile,
} from "@/lib/progress";

interface SettingsClientProps {
  allNodeIds: string[];
}

export default function SettingsClient({ allNodeIds }: SettingsClientProps) {
  const [resumePref, setResumePrefState] = useState<ResumePref>("ask");
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, total: 0 });
  const [confirmReset, setConfirmReset] = useState<"progress" | "all" | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setResumePrefState(getResumePref());
    setStats(getProgressStats(allNodeIds));
  }, [allNodeIds]);

  const handleResumePrefChange = (pref: ResumePref) => {
    setResumePref(pref);
    setResumePrefState(pref);
  };

  const handleResetProgress = () => {
    resetProgress();
    setStats(getProgressStats(allNodeIds));
    setConfirmReset(null);
  };

  const handleResetAll = () => {
    resetAllData();
    setStats(getProgressStats(allNodeIds));
    setResumePrefState("ask");
    setConfirmReset(null);
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `infra-roadmap-save-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setImportError("File too large (max 1MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as SaveFile;
        if (data.version !== 1 || !data.data) {
          setImportError("Invalid save file format");
          return;
        }
        importAllData(data);
        setStats(getProgressStats(allNodeIds));
        setResumePrefState(getResumePref());
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch {
        setImportError("Could not parse file. Make sure it's a valid save file.");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported
    e.target.value = "";
  };

  const sectionClass =
    "rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6";
  const labelClass = "text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            &larr; Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Resume behavior */}
        <div className={sectionClass}>
          <h2 className={labelClass}>Resume Behavior</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            When you return to the site, should we offer to take you back to your last visited topic?
          </p>
          <div className="space-y-2">
            {([
              ["ask", "Ask every time"],
              ["always", "Always resume automatically"],
              ["never", "Never ask"],
            ] as const).map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="resumePref"
                  value={value}
                  checked={resumePref === value}
                  onChange={() => handleResumePrefChange(value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className={sectionClass}>
          <h2 className={labelClass}>Progress</h2>
          <div className="flex gap-6 mb-5">
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
              <p className="text-xs text-gray-500">completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
              <p className="text-xs text-gray-500">in progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.total}</p>
              <p className="text-xs text-gray-500">total topics</p>
            </div>
          </div>

          {confirmReset === "progress" ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 dark:text-red-400">Reset all progress?</span>
              <button
                onClick={handleResetProgress}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmReset(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset("progress")}
              className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              Reset progress
            </button>
          )}
        </div>

        {/* Save / Load */}
        <div className={sectionClass}>
          <h2 className={labelClass}>Save / Load</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Export your progress and settings to a file, or import from a previous save.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {exportDone ? "Downloaded!" : "Export to file"}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Import from file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
          {importError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{importError}</p>
          )}
          {importSuccess && (
            <p className="mt-3 text-sm text-green-600 dark:text-green-400">Imported successfully!</p>
          )}
        </div>

        {/* Danger zone */}
        <div className={`${sectionClass} border-red-200 dark:border-red-900`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-4">
            Reset Everything
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This clears all progress, preferences, expanded nodes, and viewport state. This cannot be undone.
          </p>
          {confirmReset === "all" ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 dark:text-red-400">Are you sure?</span>
              <button
                onClick={handleResetAll}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Yes, reset everything
              </button>
              <button
                onClick={() => setConfirmReset(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset("all")}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Reset everything
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
