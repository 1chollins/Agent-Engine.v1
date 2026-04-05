type AuthCardProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-2xl border border-sage/20 bg-white p-10 shadow-md">
        <h1 className="mb-8 text-center text-2xl font-bold text-black">
          {title}
        </h1>
        {children}
        {footer && (
          <div className="mt-6 text-center text-sm text-gray-600">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
