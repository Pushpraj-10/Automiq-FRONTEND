"use client";

import StoreProvider from "./store-provider";

type ProviderProps = {
  children: React.ReactNode;
};

export default function Provider({ children }: ProviderProps) {
  return <StoreProvider>{children}</StoreProvider>;
}
