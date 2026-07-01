"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface ToastCtx { show: (msg: string) => void; }
const Ctx = createContext<ToastCtx>({ show: () => {} });

/** Returns a function you call with a message string: `const toast = useToast(); toast("Saved")`. */
export function useToast() { return useContext(Ctx).show; }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);

  const show = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout((show as any)._t);
    (show as any)._t = window.setTimeout(() => setMsg(null), 2600);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div
        className={`fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-md bg-navy px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform duration-300 ${
          msg ? "translate-y-0" : "translate-y-32"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
      >
        <span aria-hidden>✓</span>
        {msg}
      </div>
    </Ctx.Provider>
  );
}
