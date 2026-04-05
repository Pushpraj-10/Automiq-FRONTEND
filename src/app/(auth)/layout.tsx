import React from "react";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white relative selection:bg-[#FACC15] selection:text-black">
      {/* Noise overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.025] bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_256_256%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter_id=%27noise%27%3E%3CfeTurbulence_type=%27fractalNoise%27_baseFrequency=%270.9%27_numOctaves=%274%27_stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect_width=%27100%25%27_height=%27100%25%27_filter=%27url(%23noise)%27/%3E%3C/svg%3E')]" />

      {/* Dot grid */}
      <div className="absolute inset-0 w-[100vw] text-center bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_20%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_20%,transparent_100%)]" />

      <div className="relative z-10 w-full max-w-md p-10 bg-[#0e0e0e]/90 backdrop-blur-xl rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/5">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 font-extrabold text-2xl text-white">
            <Zap size={24} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            <span>Automiq</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
