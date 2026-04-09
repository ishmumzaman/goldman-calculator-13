/**
 * Shared page header with title, subtitle, and optional right-side content.
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-end justify-between w-full">
      <div className="flex flex-col gap-2">
        <h1 className="font-instrument text-[34px] tracking-tight text-[var(--text-primary)]">{title}</h1>
        {subtitle && (
          <p className="font-inter text-sm text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
