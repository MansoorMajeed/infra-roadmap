"use client";

import { useEffect } from "react";

interface HelpModalProps {
  onClose: () => void;
  onShowEntrySelector: () => void;
}

function StepIcon({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span
      className={`w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center shrink-0 ${className}`}
    >
      {children}
    </span>
  );
}

const steps = [
  {
    icon: (
      <StepIcon className="bg-blue-500 text-white">
        →
      </StepIcon>
    ),
    title: "Click any topic to open it",
    detail:
      "Each box on the map is a topic. Click it to read the content and check off milestones.",
  },
  {
    icon: (
      <StepIcon className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
        ?
      </StepIcon>
    ),
    title: "Use the question boxes to choose your path",
    detail:
      "The small boxes between topics are questions — click one to see where it leads and pick your next direction.",
  },
  {
    icon: (
      <StepIcon className="bg-blue-500 text-white">
        +
      </StepIcon>
    ),
    title: "Use + to reveal more topics",
    detail:
      "The map starts compact. Click + on any topic box to expand and see what comes next.",
  },
  {
    icon: (
      <StepIcon className="bg-green-500 text-white">
        ✓
      </StepIcon>
    ),
    title: "Mark topics complete as you go",
    detail:
      "Open a topic and click 'Mark as Complete' when you're done. Your progress is saved in your browser.",
  },
];

export default function HelpModal({ onClose, onShowEntrySelector }: HelpModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                How this works
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                An interactive skill map for infrastructure &amp; SRE
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

          {/* Steps */}
          <div className="p-6 space-y-5">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="mt-0.5">{step.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 pt-2">
            <hr className="border-gray-100 dark:border-gray-800 mb-4" />
            <button
              onClick={() => {
                onClose();
                onShowEntrySelector();
              }}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Not sure where to start?
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
