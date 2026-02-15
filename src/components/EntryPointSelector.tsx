"use client";

import { setEntryPoint } from "@/lib/progress";

interface EntryPoint {
  label: string;
  audience: string;
  startNode: string;
  zone: string;
}

const entryPoints: EntryPoint[] = [
  {
    label: "I'm brand new to tech",
    audience: "Complete beginner",
    startNode: "hello-world",
    zone: "foundations",
  },
  {
    label: "I can code but don't know ops",
    audience: "Developer → SRE",
    startNode: "what-is-a-web-service",
    zone: "building",
  },
  {
    label: "I know Linux/networking",
    audience: "Sysadmin transitioning",
    startNode: "deploying-your-first-app",
    zone: "networking",
  },
  {
    label: "I know Docker, learning K8s",
    audience: "Mid-level engineer",
    startNode: "container-orchestration",
    zone: "delivery",
  },
  {
    label: "I want SRE practices",
    audience: "Experienced engineer",
    startNode: "sre-philosophy",
    zone: "platform",
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Where do you want to start?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Pick what matches your experience level
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {entryPoints.map((ep) => (
            <button
              key={ep.startNode}
              onClick={() => handleSelect(ep)}
              className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all group"
            >
              <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                &ldquo;{ep.label}&rdquo;
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {ep.audience}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
