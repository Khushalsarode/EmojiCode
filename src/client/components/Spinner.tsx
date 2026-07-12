// Shared loading spinner — replaces plain "Loading…" text everywhere.
type Props = {
  size?: number;
  label?: string;
};

export const Spinner = ({ size = 22, label }: Props) => (
  <div className="flex flex-col items-center justify-center gap-2 py-4">
    <div
      className="rounded-full border-2 border-gray-200 dark:border-gray-700 animate-spin"
      style={{
        width: size,
        height: size,
        borderTopColor: 'var(--color-primary)',
        borderRightColor: 'var(--color-primary)',
      }}
    />
    {label && <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>}
  </div>
);
