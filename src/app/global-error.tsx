"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="bg-cream font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <div className="mx-auto max-w-md text-center">
            <span className="text-5xl font-bold text-red-400">500</span>
            <h1 className="mt-4 text-2xl font-bold text-black">
              Something Went Wrong
            </h1>
            <p className="mt-2 text-gray-500">
              A critical error occurred. Please try refreshing the page.
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-gray-400">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="mt-8 rounded-lg bg-sage px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
