"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import LogoImg from "@/assets/Logo.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }
  .film-grain {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.04; mix-blend-mode: overlay;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }
  .bg-grid-theme {
    background-size: 60px 60px;
    background-image: 
      linear-gradient(to right, color-mix(in srgb, var(--color-foreground) 5%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in srgb, var(--color-foreground) 5%, transparent) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }
  .text-3d-matte {
    color: var(--color-foreground);
    text-shadow: 0 10px 30px color-mix(in srgb, var(--color-foreground) 20%, transparent), 0 2px 4px color-mix(in srgb, var(--color-foreground) 10%, transparent);
  }
  .text-silver-matte {
    background: linear-gradient(180deg, var(--color-foreground) 0%, color-mix(in srgb, var(--color-foreground) 40%, transparent) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    transform: translateZ(0);
    filter: drop-shadow(0px 10px 20px color-mix(in srgb, var(--color-foreground) 15%, transparent)) drop-shadow(0px 2px 4px color-mix(in srgb, var(--color-foreground) 10%, transparent));
  }
  .text-card-silver-matte {
    background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    transform: translateZ(0);
    filter: drop-shadow(0px 12px 24px rgba(0,0,0,0.8)) drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }
  .premium-depth-card {
    background: linear-gradient(145deg, #1a1040 0%, #0A0A1D 100%);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.9), 0 20px 40px -20px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.8);
    border: 1px solid rgba(124,92,252,0.08); position: relative;
  }
  .card-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(124,92,252,0.06) 0%, transparent 40%);
    mix-blend-mode: screen; transition: opacity 0.3s ease;
  }
  .laptop-bezel {
    background-color: #111118;
    box-shadow: inset 0 0 0 2px #3f3f5b, inset 0 0 0 5px #111118, 0 40px 80px -15px rgba(0,0,0,0.9), 0 15px 25px -5px rgba(0,0,0,0.7);
    transform-style: preserve-3d;
  }
  .screen-glare {
    background: linear-gradient(110deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 45%);
  }
  .widget-depth {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.03);
  }
  .floating-ui-badge {
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(0,0,0,0.5);
  }
  .btn-modern-light {
    transition: all 0.4s cubic-bezier(0.25,1,0.5,1);
    background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%); color: #0F172A;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:hover { transform: translateY(-3px); box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,1); }
  .btn-modern-light:active { transform: translateY(1px); background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%); }
  .btn-modern-dark {
    transition: all 0.4s cubic-bezier(0.25,1,0.5,1);
    background: linear-gradient(180deg, #27272A 0%, #18181B 100%); color: #FFFFFF;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:hover { transform: translateY(-3px); background: linear-gradient(180deg, #3F3F46 0%, #27272A 100%); }
  .btn-modern-dark:active { transform: translateY(1px); background: #18181B; }
  .progress-ring { transform: rotate(-90deg); transform-origin: center; stroke-dasharray: 402; stroke-dashoffset: 402; stroke-linecap: round; }
`;

export function CinematicHero({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
          gsap.to(mockupRef.current, { rotationY: xVal * 10, rotationX: -yVal * 10, ease: "power3.out", duration: 1.2 });
        }
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => { window.removeEventListener("mousemove", handleMouseMove); cancelAnimationFrame(requestRef.current); };
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });

      gsap.timeline({ delay: 0.3 })
        .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days", { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      const scrollTl = gsap.timeline({
        scrollTrigger: { trigger: containerRef.current, start: "top top", end: "+=7000", pin: true, scrub: 1, anticipatePin: 1 },
      });

      scrollTl
        .to([".hero-text-wrapper", ".bg-grid-theme"], { scale: 1.15, filter: "blur(20px)", opacity: 0.2, ease: "power2.inOut", duration: 2 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8")
        .fromTo(".phone-widget", { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
        .to(".progress-ring", { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .to(".counter-val", { innerHTML: 99, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        .fromTo(".floating-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
        .fromTo(".card-left-text", { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".card-right-text", { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1 })
        .to({}, { duration: 1.5 })
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05,
        })
        .to(".main-card", {
          width: isMobile ? "92vw" : "85vw", height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px", ease: "expo.inOut", duration: 1.8,
        }, "pullback")
        .to(".cta-wrapper", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-screen h-screen overflow-hidden flex items-center justify-center bg-background text-foreground font-sans antialiased", className)} style={{ perspective: "1500px" }} {...props}>
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-theme absolute inset-0 z-0 pointer-events-none opacity-50" aria-hidden="true" />

      {/* Hero Text */}
      <div className="hero-text-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 will-change-transform">
        <h1 className="text-track gsap-reveal text-3d-matte text-4xl md:text-7xl lg:text-[6rem] font-bold tracking-tight mb-2">Diseñamos Software,</h1>
        <h1 className="text-days gsap-reveal text-silver-matte text-4xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter">que impulsa tu negocio.</h1>
      </div>

      {/* CTA Section */}
      <div className="cta-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 gsap-reveal pointer-events-auto will-change-transform">
        <h2 className="text-3xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-silver-matte">Impulsa tu negocio.</h2>
        <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-xl mx-auto font-light leading-relaxed">Cuéntanos tu idea y la convertimos en software de clase mundial. Eficiencia, calidad y satisfacción garantizada.</p>
        <div className="flex flex-col sm:flex-row gap-6">
          <a href="#contact" className="btn-modern-light flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] group no-underline">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <div className="text-left"><div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-[-2px]">Hablemos de</div><div className="text-xl font-bold leading-none tracking-tight">Tu Proyecto</div></div>
          </a>
          <a href="#services" className="btn-modern-dark flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] group no-underline">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <div className="text-left"><div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-[-2px]">Explorar</div><div className="text-xl font-bold leading-none tracking-tight">Servicios</div></div>
          </a>
        </div>
      </div>

      {/* The Deep Card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div ref={mainCardRef} className="main-card premium-depth-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]">
          <div className="card-sheen" aria-hidden="true" />

          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">

            {/* Brand Name */}
            <div className="card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2 className="text-5xl md:text-[5rem] lg:text-[7rem] font-black uppercase tracking-tighter text-card-silver-matte">LogickLink</h2>
            </div>

            {/* Laptop Mockup */}
            <div className="mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-[350px] lg:h-[550px] flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.6] md:scale-85 lg:scale-100">
                <div ref={mockupRef} className="relative w-[380px] h-[260px] rounded-[12px] laptop-bezel flex flex-col will-change-transform" style={{ transformStyle: "preserve-3d" }}>
                  {/* Screen */}
                  <div className="absolute inset-[6px] bg-[#0a0e1a] rounded-[8px] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10">
                    <div className="absolute inset-0 screen-glare z-40 pointer-events-none" />
                    {/* App Bar */}
                    <div className="phone-widget flex items-center gap-2 px-4 py-2 border-b border-white/[0.04]">
                      <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/80"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"/><div className="w-2.5 h-2.5 rounded-full bg-green-500/80"/></div>
                      <div className="flex-1 flex justify-center"><div className="px-6 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] text-neutral-400 font-mono">app.logicklink.com</div></div>
                    </div>
                    {/* Dashboard Content */}
                    <div className="relative w-full flex-1 px-4 pt-3 pb-2 flex flex-col gap-2.5">
                      <div className="phone-widget flex items-center justify-between">
                        <div className="flex items-center gap-2"><img src={LogoImg} alt="" className="h-4 opacity-80" /><span className="text-[10px] font-bold text-white/80 tracking-tight">EduManager</span></div>
                        <span className="text-[8px] text-neutral-500">Panel Admin</span>
                      </div>
                      {/* Stats Row */}
                      <div className="phone-widget grid grid-cols-3 gap-2">
                        {[{v:"248",l:"Estudiantes",c:"text-blue-400"},{v:"15",l:"Profesores",c:"text-emerald-400"},{v:"12",l:"Grupos",c:"text-purple-400"}].map(s=>(
                          <div key={s.l} className="widget-depth rounded-lg p-2 text-center"><div className={`text-sm font-bold ${s.c}`}>{s.v}</div><div className="text-[7px] text-neutral-500 mt-0.5">{s.l}</div></div>
                        ))}
                      </div>
                      {/* Progress Circle */}
                      <div className="phone-widget flex items-center gap-3 widget-depth rounded-lg p-2">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <svg className="w-full h-full"><circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4"/><circle className="progress-ring" cx="24" cy="24" r="20" fill="none" stroke="#7c5cfc" strokeWidth="4" style={{strokeDasharray:126,strokeDashoffset:126}}/></svg>
                          <div className="absolute inset-0 flex items-center justify-center"><span className="counter-val text-[10px] font-bold text-white">0</span><span className="text-[6px] text-purple-300">%</span></div>
                        </div>
                        <div><div className="text-[9px] font-semibold text-white/80">Satisfacción</div><div className="text-[7px] text-neutral-500">Clientes activos</div></div>
                      </div>
                      {/* Mini Table */}
                      <div className="phone-widget widget-depth rounded-lg overflow-hidden">
                        <div className="px-2.5 py-1 border-b border-white/[0.04] text-[7px] font-medium text-neutral-500">Últimos Proyectos</div>
                        {["EduManager — Activo","FinTrack — En desarrollo","CloudSync — Completado"].map((r,i)=>(
                          <div key={i} className="px-2.5 py-1.5 text-[8px] flex items-center justify-between border-b border-white/[0.02] last:border-0">
                            <span className="text-white/70">{r.split(" — ")[0]}</span>
                            <span className={`font-medium ${i===0?"text-green-400":i===1?"text-blue-400":"text-purple-400"}`}>{r.split(" — ")[1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Keyboard base */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[420px] h-[14px] bg-gradient-to-b from-[#222230] to-[#18181f] rounded-b-xl shadow-[0_8px_30px_rgba(0,0,0,0.8)]" style={{clipPath:"polygon(8% 0, 92% 0, 100% 100%, 0% 100%)"}}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-[#333] opacity-30"/>
                </div>

                {/* Floating Badges */}
                <div className="floating-badge absolute flex top-2 lg:top-4 left-[-20px] lg:left-[-90px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-purple-500/20 to-purple-900/10 flex items-center justify-center border border-purple-400/30 shadow-inner"><span className="text-base lg:text-xl">🚀</span></div>
                  <div><p className="text-white text-xs lg:text-sm font-bold tracking-tight">50+ Proyectos</p><p className="text-purple-200/50 text-[10px] lg:text-xs font-medium">Entregados con éxito</p></div>
                </div>
                <div className="floating-badge absolute flex bottom-8 lg:bottom-12 right-[-20px] lg:right-[-90px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-emerald-500/20 to-emerald-900/10 flex items-center justify-center border border-emerald-400/30 shadow-inner"><span className="text-base lg:text-lg">⭐</span></div>
                  <div><p className="text-white text-xs lg:text-sm font-bold tracking-tight">99% Satisfacción</p><p className="text-emerald-200/50 text-[10px] lg:text-xs font-medium">Clientes felices</p></div>
                </div>
              </div>
            </div>

            {/* Left Text */}
            <div className="card-left-text gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full px-4 lg:px-0">
              <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-0 lg:mb-5 tracking-tight">Software a tu medida.</h3>
              <p className="hidden md:block text-blue-100/60 text-sm md:text-base lg:text-lg font-normal leading-relaxed mx-auto lg:mx-0 max-w-sm lg:max-w-none">
                <span className="text-white font-semibold">LogickLink</span> diseña y desarrolla soluciones tecnológicas que transforman la manera en que operas. Desde sistemas de gestión hasta plataformas cloud escalables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
