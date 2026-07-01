type Tone = "default" | "navy" | "red" | "success" | "amber";

const tones: Record<Tone, string> = {
  default: "bg-stone-light text-stone",
  navy: "bg-navy text-white",
  red: "bg-[#FDF0EE] text-red",
  success: "bg-[#EDF7F2] text-success",
  amber: "bg-[#FEF6E7] text-amber",
};

export function Tag({ children, tone = "default" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
