type AuthCardProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tan font-heading text-lg font-semibold text-cream">
          F&amp;F
        </span>
        <span className="font-heading text-2xl font-semibold tracking-tight text-ink">
          Listing Studio
        </span>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-forest/15 bg-white/60 p-10 shadow-sm">
        <h1 className="mb-8 text-center text-2xl font-semibold text-ink">
          {title}
        </h1>
        {children}
        {footer && (
          <div className="mt-6 text-center text-sm text-ink/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
