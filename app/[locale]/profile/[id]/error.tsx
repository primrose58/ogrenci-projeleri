'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Profile Page Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-black transition-colors">
            <div className="text-red-500 mb-4">
                <AlertTriangle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
                We encountered an error while loading this profile.
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-6 max-w-lg w-full overflow-auto">
                <p className="font-mono text-sm text-red-700 dark:text-red-300">
                    {error.message || "Unknown error"}
                </p>
                {error.digest && (
                    <p className="font-mono text-xs text-red-500 dark:text-red-400 mt-2">
                        Digest: {error.digest}
                    </p>
                )}
            </div>

            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                Try again
            </button>
        </div>
    );
}
