export function AuthCenteredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-7 bg-muted/40 p-4">
      <div className="flex h-14 items-center rounded-2xl bg-sidebar px-6 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-financeall.svg"
          alt="FinanceAll"
          className="h-7 w-auto select-none"
          draggable={false}
        />
      </div>
      {children}
    </div>
  );
}
