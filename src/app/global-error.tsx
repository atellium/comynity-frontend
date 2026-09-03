"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-extrabold">Comynity is temporarily unavailable</h1>
          <p className="mt-2 text-sm">Please try loading the application again.</p>
          <button type="button" onClick={reset} className="mt-6 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white">
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
