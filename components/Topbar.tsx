import { Tag } from "@/components/ui/Tag";

export function Topbar({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-stone-light bg-bg/95 px-10 backdrop-blur">
      <h1 className="font-display text-xl font-normal">{title}</h1>
      <div className="flex items-center gap-3">
        {right ?? <Tag tone="success">Active</Tag>}
      </div>
    </header>
  );
}
