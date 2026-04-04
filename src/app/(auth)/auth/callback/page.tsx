"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/hooks/useAppStore";
import { setToken } from "@/state/slices/auth.slice";
import { fetchCurrentUser } from "@/state/slices/users.slice";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.push("/login?error=invalid_token");
      return;
    }

    dispatch(setToken(token));
    dispatch(fetchCurrentUser())
      .unwrap()
      .then(() => {
        router.push("/dashboard");
      })
      .catch(() => {
        dispatch(setToken(null));
        router.push("/login?error=invalid_token");
      });
  }, [searchParams, dispatch, router]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      {error ? (
        <>
          <div className="h-8 w-8 text-red-500 text-2xl">✕</div>
          <h2 className="text-xl font-semibold text-red-400">Authentication Failed</h2>
          <p className="text-neutral-400 text-sm">{error}</p>
        </>
      ) : (
        <>
          <div className="h-8 w-8 border-4 border-blue-500 border-r-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-semibold">Authenticating...</h2>
          <p className="text-neutral-400 text-sm">Please wait while we log you in.</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="h-8 w-8 border-4 border-blue-500 border-r-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
