'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Project Detail Page Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white gap-6 p-4 bg-black">
            <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-3xl font-bold text-red-500">Bir hata oluştu! (Something went wrong!)</h2>
                <p className="text-gray-400">Bizimle aşağıdaki hatayı paylaşırsanız hemen çözeriz.</p>
            </div>

            <div className="bg-gray-900/80 border border-red-500/30 p-6 rounded-xl max-w-3xl w-full overflow-auto shadow-2xl backdrop-blur-sm">
                <div className="flex flex-col gap-2">
                    <span className="text-red-400 font-bold text-lg">Error Message:</span>
                    <code className="text-red-200 font-mono bg-red-950/30 p-2 rounded break-words">
                        {error.message || "Unknown Error"}
                    </code>
                </div>

                {error.stack && (
                    <div className="flex flex-col gap-2 mt-4">
                        <span className="text-gray-400 font-bold">Stack Trace:</span>
                        <pre className="text-xs text-gray-500 font-mono whitespace-pre-wrap overflow-x-auto bg-black/50 p-2 rounded">
                            {error.stack}
                        </pre>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <Button onClick={() => window.location.href = '/dashboard'} variant="secondary">
                    Ana Sayfaya Dön
                </Button>
                <Button onClick={() => reset()}>
                    Tekrar Dene
                </Button>
            </div>
        </div>
    );
}
