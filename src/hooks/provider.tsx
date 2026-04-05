"use client";

import { useEffect } from "react";
import StoreProvider from "./store-provider";
import { store } from "../state/store";
import { setHydrated, setToken, TOKEN_KEY } from "../state/slices/auth.slice";

type ProviderProps = {
  children: React.ReactNode;
};

export default function Provider({ children }: ProviderProps) {
  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        store.dispatch(setToken(token));
      }
    } catch {
      // Ignore localStorage access issues.
    } finally {
      store.dispatch(setHydrated(true));
    }
  }, []);

  return <StoreProvider>{children}</StoreProvider>;
}
