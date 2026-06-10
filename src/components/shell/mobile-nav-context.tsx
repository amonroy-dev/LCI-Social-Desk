"use client";

import * as React from "react";

interface MobileNavContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const MobileNavContext = React.createContext<MobileNavContextValue>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const toggle = React.useCallback(() => setOpen((v) => !v), []);
  const close = React.useCallback(() => setOpen(false), []);
  return (
    <MobileNavContext.Provider value={{ open, toggle, close }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  return React.useContext(MobileNavContext);
}
