'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Zap, ArrowRight, ArrowUpRight, Star, ChevronRight, ChevronDown, Play } from "lucide-react";

const YELLOW = "#FACC15";

const StatPill = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center gap-1.5 px-7 py-5 bg-[#0a0a0a]/70 border border-white/5 border-t-2 border-t-[#FACC15] rounded-2xl backdrop-blur-md min-w-[160px]">
    <span className="text-[9px] text-[#666] tracking-widest uppercase">{label}</span>
    <span className="text-4xl font-extrabold text-white leading-none">{value}</span>
  </div>
);

const WORDS = ["Automate", "Connect", "Orchestrate", "Scale"];

const RevealWord = ({ children, progress, range, hl }: { children: string, progress: any, range: [number, number], hl?: boolean }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <span className="relative inline-block">
      <span className={`absolute opacity-20 ${hl ? 'text-yellow-400' : 'text-white'}`}>{children}</span>
      <motion.span style={{ opacity }} className={`relative z-10 ${hl ? 'text-yellow-400' : 'text-white'}`}>
        {children}
      </motion.span>
    </span>
  );
};

const ScrollRevealSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"]
  });

  const words = [
    { text: "We" },
    { text: "design", hl: true },
    { text: "and" },
    { text: "deploy" },
    { text: "workflow", hl: true },
    { text: "solutions", hl: true },
    { text: "with" },
    { text: "people" },
    { text: "at" },
    { text: "the" },
    { text: "core," },
    { text: "ensuring" },
    { text: "every" },
    { text: "system", hl: true },
    { text: "enhances", hl: true },
    { text: "real" },
    { text: "user" },
    { text: "experiences." },
  ];

  return (
    <section ref={containerRef} className="px-16 py-[120px] max-w-[1100px] mx-auto relative min-h-[50vh] flex items-center">
      <p className="text-[clamp(28px,3.5vw,48px)] font-extrabold leading-[1.3] tracking-[-1px] max-w-[800px]">
        {words.map((w, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <span key={i}>
              <RevealWord progress={scrollYProgress} range={[start, end]} hl={w.hl}>{w.text}</RevealWord>
              {i < words.length - 1 && " "}
            </span>
          );
        })}
      </p>
    </section>
  );
};

export default function AutomiqLanding() {
  const router = useRouter();
  const [activeService, setActiveService] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx(i => (i + 1) % WORDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      num: "01",
      title: "Visual Node Builder",
      desc: "Drag-and-drop workflow construction with an infinite canvas. Chain hundreds of steps, loops, and conditions without writing a single line of glue code.",
      tags: ["Canvas editor", "Logic gates", "Multi-path flows"],
    },
    {
      num: "02",
      title: "Real-Time Triggers",
      desc: "Webhooks, cron schedules, database change-feeds, and Kafka topics—all unified under one event router with sub-10ms dispatch latency.",
      tags: ["Webhook ingestion", "Kafka topics", "Change-data capture"],
    },
    {
      num: "03",
      title: "Custom Code Execution",
      desc: "Drop sandboxed Node.js or Python functions anywhere in the graph. Full npm/pip access, secret injection, and per-step observability included.",
      tags: ["Sandboxed runtime", "Secret injection", "Step logs"],
    },
    {
      num: "04",
      title: "Enterprise Observability",
      desc: "Distributed traces, replay-able audit logs, and anomaly alerting across every tenant. Built on OpenTelemetry so it plugs into your existing stack.",
      tags: ["OTEL traces", "Replay audit log", "Anomaly alerts"],
    },
  ];

  const experts = [
    { name: "Caleb Morris", role: "Chief Architect", img: "https://i.pravatar.cc/150?img=10", quote: "Scale is a design constraint, not an afterthought." },
    { name: "Ava Reynolds", role: "Product Designer", img: "https://i.pravatar.cc/150?img=11", quote: "Good automation feels obvious—the hard work is hidden." },
    { name: "Daniel Okoyo", role: "Lead Engineer", img: "https://i.pravatar.cc/150?img=12", quote: "Zero latency isn't a goal; it's a non-negotiable." },
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden selection:bg-[#FACC15] selection:text-black">
      {/* Noise overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.025] bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_256_256%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter_id=%27noise%27%3E%3CfeTurbulence_type=%27fractalNoise%27_baseFrequency=%270.9%27_numOctaves=%274%27_stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect_width=%27100%25%27_height=%27100%25%27_filter=%27url(%23noise)%27/%3E%3C/svg%3E')]" />

      {/* ─────────────────── HERO ─────────────────── */}
      <section ref={heroRef} className="relative min-h-[100vh] flex flex-col items-center overflow-hidden bg-white text-black rounded-b-[60px] shadow-2xl relative z-20 pb-16">

        {/* Dot grid */}
        <div className="absolute inset-0 w-[100vw] text-center bg-[radial-gradient(circle,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]" />

        {/* ── Floating Glass Navbar ── */}
        <div className="fixed w-full top-6 left-0 z-[100] px-6">
          <nav className="mx-auto max-w-6xl flex items-center justify-between px-10 py-5 bg-black/90 backdrop-blur-lg border border-white/10 rounded-[52px] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">

            {/* Logo Section */}
            <div className="flex items-center gap-2 font-extrabold text-xl text-white">
              <Zap size={20} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              <span>Automiq</span>
            </div>

            {/* Links Section */}
            <div className="flex gap-8 items-center">
              {["Home", "About", "How it Works", "Blog", "Teams"].map((item) => (
                <span
                  key={item}
                  className="text-neutral-300 text-[12px] font-bold capitalize tracking-[0.8px] no-underline transition-colors duration-200 cursor-pointer hover:text-white drop-shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Button Section */}
            <button
              className="bg-[#FACC15] text-black px-[28px] py-[10px] rounded-full font-black text-[13px] border border-yellow-300 inline-flex items-center gap-[10px] transition-all duration-200 tracking-[0.5px] hover:-translate-y-[2px] shadow-[0_5px_15px_rgba(250,204,21,0.25)]"
              onClick={() => router.push('/login')}
            >
              Get Started
            </button>

          </nav>
        </div>

        {/* ── Hero body ── */}
        <div className="flex-1 relative z-10 w-full max-w-6xl flex flex-col items-center justify-center text-center px-12 pt-38">

          {/* Badge */}
          <div className="animate-[fadeUp_0.75s_ease_both] inline-flex items-center gap-2 bg-[#FACC15]/20 border border-[#FACC15]/50 rounded-full px-4 py-1.5 mb-9 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
            <span className="text-[11px] font-bold text-neutral-800 tracking-[0.5px]">
              Event-Driven Workflow Automation · Multi-Tenant
            </span>
          </div>

          {/* Heading */}
          <div className="animate-[fadeUp_0.75s_0.12s_ease_both] flex flex-col items-center mb-7">
            <motion.div layout className="flex items-center gap-x-4 text-[clamp(52px,6.5vw,84px)] font-extrabold leading-[1.1] tracking-[-2.5px] text-black">

              {/* 1. ADDED: 'relative' to the className so popLayout's absolute exit stays contained */}
              <motion.span layout transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }} className="inline-flex relative">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={wordIdx}
                    layout // 2. ADDED: This prevents the word from stretching/enlarging
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(8px)" }}
                    // 3. UPDATED: Matched duration to 0.5s so the fade out syncs with the layout shift
                    transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                    className="inline-block text-yellow-500 whitespace-nowrap overflow-hidden"
                  >
                    {WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </motion.span>

              <motion.span layout transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}>Everything.</motion.span>
            </motion.div>

            <div className="text-[clamp(52px,6.5vw,84px)] font-extrabold leading-[1.1] tracking-[-2.5px] text-black">
              Ship{" "}
              <span className="inline-block bg-[linear-gradient(135deg,#000_30%,rgba(0,0,0,0.45))] bg-clip-text text-transparent">
                Faster.
              </span>
            </div>
          </div>

          {/* Subheading */}
          <p className="animate-[fadeUp_0.75s_0.24s_ease_both] text-base text-neutral-500 leading-[1.75] max-w-[480px] mb-11 font-medium">
            Build, deploy, and observe event-driven workflows at scale —
            without stitching together five different tools.
          </p>

          {/* CTA buttons */}
          <div className="animate-[fadeUp_0.75s_0.38s_ease_both] flex gap-3.5 items-center mb-[72px]">
            <button className="bg-[#FACC15] text-[#000] px-[32px] py-[14px] rounded-full font-extrabold text-[13px] border-none inline-flex items-center gap-[10px] transition-all duration-200 tracking-[0.5px] shadow-[0_10px_30px_rgba(250,204,21,0.3)] hover:-translate-y-[2px]" onClick={() => router.push('/login')}>
              Start Building <ArrowRight size={14} />
            </button>
            <button className="bg-transparent text-black border border-black/20 px-[32px] py-[14px] rounded-full font-bold text-[13px] inline-flex items-center gap-[10px] transition-colors duration-200 tracking-[0.5px] hover:border-yellow-500 hover:text-yellow-600">
              <Play size={12} className="fill-current opacity-70" />
              Watch Demo
            </button>
          </div>

          {/* Thin accent rule */}
          <div className="animate-[fadeUp_0.75s_0.52s_ease_both] w-full max-w-[720px] mb-10">
            <div className="w-full h-[1px] bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.1)_40%,rgba(0,0,0,0.1)_60%,transparent)]" />
          </div>

          {/* Stats row */}
          <div className="animate-[fadeUp_0.75s_0.52s_ease_both] flex gap-5 justify-center flex-wrap">
            <div className="flex flex-col items-center gap-1.5 px-7 py-5 bg-white border border-neutral-200 border-t-2 border-t-[#FACC15] shadow-lg rounded-2xl min-w-[160px]">
              <span className="text-[9px] text-neutral-500 tracking-widest uppercase font-bold">Events / day</span>
              <span className="text-4xl font-black text-black leading-none tracking-tight">150M+</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-7 py-5 bg-white border border-neutral-200 border-t-2 border-t-[#FACC15] shadow-lg rounded-2xl min-w-[160px]">
              <span className="text-[9px] text-neutral-500 tracking-widest uppercase font-bold">Dispatch latency</span>
              <span className="text-4xl font-black text-black leading-none tracking-tight">&lt;10ms</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-7 py-5 bg-white border border-neutral-200 border-t-2 border-t-[#FACC15] shadow-lg rounded-2xl min-w-[160px]">
              <span className="text-[9px] text-neutral-500 tracking-widest uppercase font-bold">Uptime SLA</span>
              <span className="text-4xl font-black text-black leading-none tracking-tight">99.9%</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-7 py-5 bg-white border border-neutral-200 border-t-2 border-t-[#FACC15] shadow-lg rounded-2xl min-w-[160px]">
              <span className="text-[9px] text-neutral-500 tracking-widest uppercase font-bold">Native integrations</span>
              <span className="text-4xl font-black text-black leading-none tracking-tight">2000+</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── ABOUT SPLIT ─────────────────── */}
      <section className="grid grid-cols-2 border-y border-white/5 relative overflow-hidden">
        {/* Left */}
        <div className="px-16 py-20 border-r border-white/5 relative z-10">
          <div className="text-[10px] text-neutral-500 tracking-[3px] uppercase mb-6">
            ← About Us
          </div>
          <div className="bg-[#0e0e0e]/90 border border-white/10 rounded-3xl p-10 mb-8">
            <div className="text-[10px] text-yellow-400 tracking-widest uppercase mb-3">
              ● Available for worldwide project
            </div>
            <h3 className="text-3xl font-extrabold mb-5 leading-[1.2]">
              Based in <span className="text-yellow-400">Mumbai, India</span>
            </h3>
            <button className="btn-yellow text-xs px-6 py-2.5">
              Start a Project
            </button>
          </div>

          <div className="rounded-3xl overflow-hidden h-56 relative">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
              alt="Team"
              className="w-full h-full object-cover brightness-50 saturate-[0.3] sepia-[0.5]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/15 to-transparent" />
          </div>
        </div>

        {/* Right */}
        <div className="px-16 py-20 flex flex-col justify-center relative z-10">
          <p className="text-[13px] text-neutral-500 tracking-[2px] uppercase mb-8">
            Trusted by 120+ clients across 4 industries · shipping AI-powered automation from idea to production in 6–8 weeks.
          </p>

          <div className="text-[clamp(80px,9vw,120px)] font-extrabold leading-[0.9] tracking-[-4px] mb-8">
            120<span className="text-yellow-400">+</span>
          </div>

          <div className="flex gap-1 mb-5">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
          </div>

          <div className="bg-[#0e0e0e]/90 border border-white/10 rounded-[20px] px-8 py-7 flex gap-5 items-center">
            <img
              src="https://i.pravatar.cc/80?img=32"
              alt=""
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
            <div>
              <div className="text-[15px] text-neutral-300 leading-[1.6] mb-2">
                "Good AI feels obvious — because the hard work is hidden."
              </div>
              <div className="text-[11px] font-bold">Ava Collins <span className="text-neutral-500 font-normal">| Automiq Design Lead</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── WE DESIGN ─────────────────── */}
      <ScrollRevealSection />

      {/* ─────────────────── LOGO MARQUEE ─────────────────── */}
      <div className="border-y border-white/5 py-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505,transparent_15%,transparent_85%,#050505)] z-[2] pointer-events-none" />
        <div className="flex w-max animate-[marquee_22s_linear_infinite] gap-16 items-center flex">
          {["Segment", "Stripe", "Vercel", "Linear", "Notion", "Resend", "PlanetScale", "Upstash", "Segment", "Stripe", "Vercel", "Linear", "Notion", "Resend", "PlanetScale", "Upstash"].map((name, i) => (
            <span key={i} className="text-[15px] font-bold text-[#2a2a2a] uppercase tracking-[3px] whitespace-nowrap">{name}</span>
          ))}
        </div>
        <div className="absolute -top-3 left-20 text-[9px] text-[#333] tracking-[2px] uppercase">Trusted by 120+ top-tier brands.</div>
      </div>

      {/* ─────────────────── SERVICES ─────────────────── */}
      <section id="services" className="px-16 py-[120px] max-w-[1200px] mx-auto relative">
        <div className="grid grid-cols-2 gap-20">
          {/* Left */}
          <div>
            <div className="text-[10px] text-yellow-400 tracking-[3px] uppercase mb-6">
              ● Services
            </div>
            <h2 className="text-[clamp(36px,4vw,56px)] font-extrabold tracking-[-1.5px] leading-[1.05] mb-6">
              End-to-End<br />
              <span className="text-yellow-400">AI Services</span>
            </h2>
            <p className="text-[#666] leading-[1.8] text-[15px] max-w-[360px]">
              We turn ambiguous workflow ideas into production features your users trust — combining strategy, design, engineering, and rigorous evaluation.
            </p>
          </div>

          {/* Right: selected service detail */}
          <div className="bg-[#0c0c0c]/90 border border-white/5 rounded-3xl p-9 flex flex-col relative overflow-hidden min-h-[280px]">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeService}
                 initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                 exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                 transition={{ duration: 0.3, ease: "easeOut" }}
                 className="flex flex-col h-full"
               >
                 <div className="text-[10px] text-neutral-500 tracking-[2px] uppercase mb-2">
                   {services[activeService].num}
                 </div>
                 <h3 className="text-2xl font-extrabold mb-4 leading-[1.2]">
                   {services[activeService].title}
                 </h3>
                 <p className="text-[#777] text-sm leading-[1.8] mb-6 flex-1">
                   {services[activeService].desc}
                 </p>
                 <div className="flex flex-wrap gap-2">
                   {services[activeService].tags.map((t) => (
                     <span key={t} className="bg-yellow-400/10 text-yellow-400 text-[10px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 rounded-full border border-yellow-400/25">{t}</span>
                   ))}
                 </div>
               </motion.div>
             </AnimatePresence>
          </div>
        </div>

        {/* Service rows */}
        <div className="mt-16 flex flex-col relative">
          {services.map((s, i) => (
            <div
              key={i}
              className={`border-t border-white/10 py-7 cursor-pointer relative group ${i === services.length - 1 ? "border-b" : ""}`}
              onClick={() => setActiveService(i)}
            >
              {/* Animated active background */}
              {activeService === i && (
                <motion.div
                  layoutId="activeServiceBg"
                  className="absolute inset-[1px] bg-yellow-400/5 z-0 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {/* Optional hover background for non-active */}
              {activeService !== i && (
                <div className="absolute inset-[1px] bg-yellow-400/0 group-hover:bg-yellow-400/5 transition-colors duration-300 z-0 rounded-lg" />
              )}

              <div className="flex items-center justify-between px-4 relative z-10">
                <div className="flex items-center gap-8">
                  <span className={`text-[11px] tracking-[1px] transition-colors duration-300 ${activeService === i ? 'text-yellow-400' : 'text-[#444] group-hover:text-yellow-400/60'}`}>{s.num}</span>
                  <span className={`text-[22px] font-bold transition-colors duration-300 ${activeService === i ? 'text-white' : 'text-[#555] group-hover:text-[#aaa]'}`}>{s.title}</span>
                </div>
                <motion.div
                  animate={{ 
                    rotate: activeService === i ? 90 : 0, 
                    borderColor: activeService === i ? 'rgba(250,204,21,1)' : 'rgba(255,255,255,0.1)',
                    color: activeService === i ? 'rgba(250,204,21,1)' : 'rgba(85,85,85,1)'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-10 h-10 rounded-full border-[1.5px] flex items-center justify-center bg-black/20"
                >
                  <ChevronRight size={16} />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── MEET EXPERTS ─────────────────── */}
      <section className="px-16 pb-[120px] max-w-[1200px] mx-auto relative">
        <div className="flex items-end justify-between mb-16">
          <div>
            <div className="text-[10px] text-yellow-400 tracking-[3px] uppercase mb-4">
              ● The Team
            </div>
            <h2 className="text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-1.5px]">
              Meet <span className="text-yellow-400">Our Experts</span>
            </h2>
          </div>
          <button className="bg-transparent text-[#fff] border border-white/20 px-[32px] py-[14px] rounded-full font-bold text-[13px] inline-flex items-center gap-[10px] transition-colors duration-200 tracking-[0.5px] hover:border-[#FACC15] hover:text-[#FACC15] mb-2">
            View All <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {experts.map((e, i) => (
            <div key={i} className="bg-[#0e0e0e]/90 border border-white/5 rounded-3xl p-8 transition duration-300 hover:border-yellow-400/40 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-5">
                <img src={e.img} alt={e.name} className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400/30" />
                <div>
                  <div className="font-extrabold text-base">{e.name}</div>
                  <div className="text-[9px] text-yellow-400 tracking-[2px] uppercase mt-1">{e.role}</div>
                </div>
              </div>
              <p className="text-sm text-[#666] leading-[1.7]">"{e.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── CTA ─────────────────── */}
      <section className="mx-10 mb-10 bg-[#0c0c0c]/90 border border-white/5 rounded-[40px] px-16 py-20 grid grid-cols-2 gap-16 items-center relative overflow-hidden">

        <div className="relative z-10">
          <h2 className="text-[clamp(40px,5vw,68px)] font-extrabold tracking-[-2px] leading-[1.0] mb-6">
            Ready to<br />
            <span className="text-yellow-400">Elevate</span>
            <br />Your Brand?
          </h2>
          <p className="text-[#666] text-[15px] leading-[1.8] max-w-[380px] mb-10">
            Whether you're building massive infrastructure or optimizing daily tasks, we're ready to partner in your growth journey.
          </p>
          <div className="flex bg-white/5 border border-white/10 rounded-full overflow-hidden max-w-[460px]">
            <input
              type="email"
              placeholder="Enter your e-mail"
              className="flex-1 bg-transparent border-none outline-none text-white px-6 py-3.5 text-[13px]"
            />
            <button className="btn-yellow m-1 rounded-full text-xs whitespace-nowrap">
              Get in Touch
            </button>
          </div>
        </div>

        {/* Right: big glowing number */}
        <div className="relative z-10 text-right">
          <div className="text-[clamp(80px,10vw,140px)] font-extrabold leading-[0.85] tracking-[-6px] text-yellow-400/10">2000+</div>
          <div className="text-[13px] text-[#444] tracking-[2px] uppercase mt-4">App Integrations Available</div>
          <div className="flex justify-end gap-6 mt-10">
            {[
              { v: "10+", l: "Years" },
              { v: "800+", l: "Workflows" },
              { v: "150M+", l: "Events Synced" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl font-extrabold">{s.v}</div>
                <div className="text-[9px] text-[#555] tracking-[2px] uppercase mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer className="mx-10 mb-10 bg-yellow-400 rounded-[40px] p-16 grid grid-cols-3 gap-12 text-black">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-[22px] mb-8">
            <Zap size={22} className="text-black fill-black" />
            Automiq.
          </div>
          <p className="text-sm text-black/60 leading-[1.8] max-w-[260px]">
            We partner with brands, startups, and enterprises to create robust architectures that connect, convert, and stand out.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="font-extrabold text-[11px] uppercase tracking-[2px] mb-5">Services</div>
            {["Visual Workflows", "API Integration", "Code Execution", "Webhooks"].map((item) => (
              <div key={item} className="text-[13px] font-semibold opacity-70 mb-2.5 cursor-pointer hover:opacity-100 transition-opacity">{item}</div>
            ))}
          </div>
          <div>
            <div className="font-extrabold text-[11px] uppercase tracking-[2px] mb-5">Company</div>
            {["About Us", "Platform", "Testimonials", "Contact"].map((item) => (
              <div key={item} className="text-[13px] font-semibold opacity-70 mb-2.5 cursor-pointer hover:opacity-100 transition-opacity">{item}</div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-extrabold text-[11px] uppercase tracking-[2px] mb-5">Let's Connect</div>
          <div className="text-[13px] font-bold opacity-80 mb-5">hello@automiq.com</div>
          <div className="flex gap-2.5">
            {["in", "tx", "ig"].map((s) => (
              <div
                key={s}
                className="w-9 h-9 rounded-full border-2 border-black/25 flex items-center justify-center text-[11px] font-extrabold cursor-pointer transition-colors hover:bg-black/10"
              >{s}</div>
            ))}
          </div>
        </div>
      </footer>

      <div className="text-center text-[#2a2a2a] text-[10px] font-bold uppercase tracking-[2px] pb-6">
        © {new Date().getFullYear()} Automiq. All rights reserved. Designed with purpose.
      </div>
    </div>
  );
}