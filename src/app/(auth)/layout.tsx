import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
      <div className="w-full max-w-md p-8 bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800">
        <div className="flex justify-center mb-8">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Automiq
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
