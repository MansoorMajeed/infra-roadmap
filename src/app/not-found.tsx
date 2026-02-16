import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Page not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This zone doesn&apos;t exist or isn&apos;t available yet.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Back to Roadmap
        </Link>
      </div>
    </div>
  );
}
