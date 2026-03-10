"use client";

import { setEntryPoint } from "@/lib/progress";

interface EntryPoint {
  label: string;
  description: string;
  startNode: string;
  zone: string;
  icon: string;
}

const entryPoints: EntryPoint[] = [
  {
    icon: "🌱",
    label: "I'm brand new to tech",
    description: "Start from scratch — what code is, how computers work, the terminal",
    startNode: "hello-world",
    zone: "foundations",
  },
  {
    icon: "💻",
    label: "I can code, but not ops",
    description: "You build software but haven't run it on a real server yet",
    startNode: "where-do-i-run-this",
    zone: "running",
  },
  {
    icon: "📈",
    label: "I know Linux, want cloud & DevOps",
    description: "Comfortable on the command line, ready to scale and operate services",
    startNode: "your-store-takes-off",
    zone: "scaling",
  },
  {
    icon: "📊",
    label: "I want SRE & reliability practices",
    description: "SLOs, incident management, on-call, and running things professionally",
    startNode: "what-is-sre",
    zone: "sre",
  },
  {
    icon: "🏠",
    label: "I want to self-host my own services",
    description: "Run your own apps on hardware you control — no subscriptions, full privacy",
    startNode: "what-is-self-hosting",
    zone: "self-hosting",
  },
  {
    icon: "🚢",
    label: "I want to learn Kubernetes",
    description: "Start with containers first, then move into orchestrating them at scale",
    startNode: "containerization",
    zone: "containers",
  },
];

interface EntryPointSelectorProps {
  onSelect: (zone: string, nodeId: string) => void;
  onClose: () => void;
}

export default function EntryPointSelector({ onSelect, onClose }: EntryPointSelectorProps) {
  const handleSelect = (ep: EntryPoint) => {
    setEntryPoint(ep.startNode);
    onSelect(ep.zone, ep.startNode);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[85dvh] sm:max-h-[85vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Where do you want to start?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Pick the path that matches where you are now
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-2.5 overflow-y-auto overscroll-contain">
            {entryPoints.map((ep) => (
              <button
                key={ep.startNode}
                onClick={() => handleSelect(ep)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 shrink-0">{ep.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm">
                      {ep.label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                      {ep.description}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
