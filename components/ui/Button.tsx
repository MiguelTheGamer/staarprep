import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "red" | "white";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-[#1a3050] disabled:opacity-50",
  secondary: "border border-stone-light text-navy hover:bg-navy/[0.06] disabled:opacity-50",
  red: "bg-red text-white hover:bg-[#a93226] disabled:opacity-50",
  white: "bg-white text-navy hover:bg-[#f0ece6] disabled:opacity-50",
};
const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-6 py-3 text-sm",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ variant = "primary", size = "md", className = "", ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  />
));
Button.displayName = "Button";
