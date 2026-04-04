/**
 * Typed Redux hooks for the Automiq store.
 * Use these instead of plain `useDispatch` / `useSelector` to get
 * full type safety without importing RootState / AppDispatch everywhere.
 *
 * Client-only — must be used inside "use client" components.
 */
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/state/store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
