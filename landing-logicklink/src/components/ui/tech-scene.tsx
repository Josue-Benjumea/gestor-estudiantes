import React, { useEffect, useState } from 'react';

interface TechSceneProps {
  activeSection?: number;
  className?: string;
}

/**
 * Scroll-driven SVG scene: Laptop → Connection → Server → Cloud ecosystem
 * Each section reveals a new phase of the software delivery pipeline.
 */
export default function TechScene({ activeSection = 0, className = '' }: TechSceneProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setTime(t => t + 1);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Animated dash offset for data flow
  const dashOffset = -(time * 0.8);
  const pulseFactor = Math.sin(time * 0.04) * 0.15 + 0.85;

  // Phase visibility based on active section
  const showLaptop = true;
  const showConnection = activeSection >= 1;
  const showServer = activeSection >= 1;
  const showDataFlow = activeSection >= 2;
  const showCloud = activeSection >= 3;
  const showMobile = activeSection >= 3;
  const showFullEcosystem = activeSection >= 3;

  return (
    <div className={`relative ${className}`} style={{ width: 520, height: 520 }}>
      <svg
        viewBox="0 0 520 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 20px rgba(124, 92, 252, 0.15))' }}
      >
        <defs>
          {/* Gradient for glowing lines */}
          <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c5cfc" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7c5cfc" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lineGlowV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c5cfc" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7c5cfc" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1030" />
            <stop offset="100%" stopColor="#0d0a1a" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a2040" />
            <stop offset="100%" stopColor="#1a1030" />
          </linearGradient>
          <linearGradient id="serverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#201840" />
            <stop offset="100%" stopColor="#120e25" />
          </linearGradient>
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a1f50" />
            <stop offset="100%" stopColor="#1a1235" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ========== CLOUD (Section 4) ========== */}
        <g
          style={{
            opacity: showCloud ? 1 : 0,
            transform: showCloud ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {/* Cloud shape */}
          <path
            d="M215 70 Q215 45 240 45 Q250 25 275 30 Q295 15 315 35 Q340 30 340 55 Q360 55 360 75 Q360 95 340 95 L225 95 Q205 95 205 75 Z"
            fill="url(#cloudGrad)"
            stroke="#7c5cfc"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Cloud inner glow */}
          <path
            d="M215 70 Q215 45 240 45 Q250 25 275 30 Q295 15 315 35 Q340 30 340 55 Q360 55 360 75 Q360 95 340 95 L225 95 Q205 95 205 75 Z"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="0.5"
            strokeOpacity={0.3 * pulseFactor}
            filter="url(#glow)"
          />
          {/* Cloud icon */}
          <text x="270" y="73" textAnchor="middle" fill="#a78bfa" fontSize="18" fontFamily="monospace" opacity={0.7 * pulseFactor}>☁</text>
          <text x="270" y="88" textAnchor="middle" fill="#a78bfa" fontSize="8" fontFamily="Inter, sans-serif" opacity="0.5">CLOUD</text>
        </g>

        {/* ========== CONNECTION: Cloud → Server ========== */}
        {showCloud && (
          <g style={{ opacity: showFullEcosystem ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}>
            <line x1="395" y1="95" x2="395" y2="175" stroke="#7c5cfc" strokeWidth="1" strokeOpacity="0.15" />
            <line
              x1="395" y1="95" x2="395" y2="175"
              stroke="url(#lineGlowV)"
              strokeWidth="1.5"
              strokeDasharray="4 8"
              strokeDashoffset={dashOffset}
              strokeOpacity="0.6"
              filter="url(#glow)"
            />
          </g>
        )}

        {/* ========== SERVER RACK (Section 2+) ========== */}
        <g
          style={{
            opacity: showServer ? 1 : 0,
            transform: showServer ? 'translateX(0)' : 'translateX(40px)',
            transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {/* Server body */}
          <rect x="355" y="175" width="80" height="130" rx="8" fill="url(#serverGrad)" stroke="#7c5cfc" strokeWidth="1" strokeOpacity="0.3" />
          
          {/* Server slots */}
          {[0, 1, 2].map((i) => (
            <g key={`slot-${i}`}>
              <rect
                x="365" y={190 + i * 35}
                width="60" height="24" rx="3"
                fill="#0d0a1a"
                stroke="#7c5cfc"
                strokeWidth="0.5"
                strokeOpacity="0.2"
              />
              {/* Blinky LEDs */}
              <circle
                cx="375" cy={202 + i * 35} r="2.5"
                fill={showDataFlow ? '#34d399' : '#374151'}
                opacity={showDataFlow ? (i === 1 ? pulseFactor : 0.8) : 0.3}
              >
                {showDataFlow && (
                  <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.2 + i * 0.3}s`} repeatCount="indefinite" />
                )}
              </circle>
              <circle
                cx="383" cy={202 + i * 35} r="2.5"
                fill={showDataFlow ? '#7c5cfc' : '#374151'}
                opacity={showDataFlow ? 0.7 : 0.3}
              >
                {showDataFlow && (
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                )}
              </circle>
              {/* Drive lines */}
              <line x1="392" y1={196 + i * 35} x2="418" y2={196 + i * 35} stroke="#7c5cfc" strokeWidth="0.5" strokeOpacity="0.15" />
              <line x1="392" y1={200 + i * 35} x2="415" y2={200 + i * 35} stroke="#7c5cfc" strokeWidth="0.5" strokeOpacity="0.1" />
              <line x1="392" y1={204 + i * 35} x2="412" y2={204 + i * 35} stroke="#7c5cfc" strokeWidth="0.5" strokeOpacity="0.08" />
            </g>
          ))}

          {/* Server label */}
          <text x="395" y="320" textAnchor="middle" fill="#a78bfa" fontSize="9" fontFamily="Inter, sans-serif" opacity="0.5" letterSpacing="1">SERVER</text>
        </g>

        {/* ========== CONNECTION LINES: Laptop → Server ========== */}
        <g
          style={{
            opacity: showConnection ? 1 : 0,
            transition: 'opacity 0.8s ease 0.4s',
          }}
        >
          {/* Static guide line */}
          <path
            d="M280 270 Q320 240 355 240"
            stroke="#7c5cfc"
            strokeWidth="1"
            strokeOpacity="0.1"
            fill="none"
          />
          {/* Animated data flow */}
          <path
            d="M280 270 Q320 240 355 240"
            stroke="url(#lineGlow)"
            strokeWidth="2"
            strokeDasharray="6 10"
            strokeDashoffset={dashOffset}
            strokeOpacity={showDataFlow ? 0.8 : 0.3}
            fill="none"
            filter="url(#glow)"
            style={{ transition: 'stroke-opacity 0.8s ease' }}
          />

          {/* Data packet dots */}
          {showDataFlow && [0, 1, 2].map((i) => {
            const progress = ((time * 0.005 + i * 0.33) % 1);
            const t = progress;
            // Quadratic bezier: P0(280,270) CP(320,240) P1(355,240)
            const px = (1-t)*(1-t)*280 + 2*(1-t)*t*320 + t*t*355;
            const py = (1-t)*(1-t)*270 + 2*(1-t)*t*240 + t*t*240;
            return (
              <circle
                key={`packet-${i}`}
                cx={px} cy={py} r="2.5"
                fill="#a78bfa"
                opacity={0.5 + Math.sin(progress * Math.PI) * 0.5}
                filter="url(#glow)"
              />
            );
          })}
        </g>

        {/* ========== LAPTOP (Always visible) ========== */}
        <g
          style={{
            transform: showServer ? 'scale(1)' : 'scale(1.1)',
            transformOrigin: '165px 290px',
            transition: 'transform 1s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {/* Screen bezel */}
          <rect x="75" y="185" width="180" height="120" rx="8" fill="#1a1030" stroke="#7c5cfc" strokeWidth="1" strokeOpacity="0.35" />
          
          {/* Screen inner */}
          <rect x="82" y="192" width="166" height="106" rx="4" fill="url(#screenGrad)" />

          {/* Screen glow edge */}
          <rect
            x="82" y="192" width="166" height="106" rx="4"
            fill="none" stroke="#7c5cfc" strokeWidth="0.5"
            strokeOpacity={0.2 * pulseFactor}
            filter="url(#glow)"
          />

          {/* Code lines on screen */}
          <g opacity={0.7}>
            {/* Line numbers */}
            <text x="90" y="210" fill="#4b3f80" fontSize="7" fontFamily="monospace">1</text>
            <text x="90" y="221" fill="#4b3f80" fontSize="7" fontFamily="monospace">2</text>
            <text x="90" y="232" fill="#4b3f80" fontSize="7" fontFamily="monospace">3</text>
            <text x="90" y="243" fill="#4b3f80" fontSize="7" fontFamily="monospace">4</text>
            <text x="90" y="254" fill="#4b3f80" fontSize="7" fontFamily="monospace">5</text>
            <text x="90" y="265" fill="#4b3f80" fontSize="7" fontFamily="monospace">6</text>
            <text x="90" y="276" fill="#4b3f80" fontSize="7" fontFamily="monospace">7</text>
            <text x="90" y="287" fill="#4b3f80" fontSize="7" fontFamily="monospace">8</text>

            {/* Code syntax highlighting */}
            <text x="102" y="210" fill="#c084fc" fontSize="7.5" fontFamily="monospace">import</text>
            <text x="140" y="210" fill="#67e8f9" fontSize="7.5" fontFamily="monospace">{'{ App }'}</text>
            <text x="180" y="210" fill="#c084fc" fontSize="7.5" fontFamily="monospace">from</text>
            <text x="200" y="210" fill="#86efac" fontSize="7.5" fontFamily="monospace">'./core'</text>

            <text x="102" y="221" fill="#c084fc" fontSize="7.5" fontFamily="monospace">import</text>
            <text x="140" y="221" fill="#67e8f9" fontSize="7.5" fontFamily="monospace">{'{ DB }'}</text>
            <text x="175" y="221" fill="#c084fc" fontSize="7.5" fontFamily="monospace">from</text>
            <text x="195" y="221" fill="#86efac" fontSize="7.5" fontFamily="monospace">'./server'</text>

            <text x="102" y="235" fill="#fbbf24" fontSize="7.5" fontFamily="monospace">const</text>
            <text x="130" y="235" fill="#f0abfc" fontSize="7.5" fontFamily="monospace">server</text>
            <text x="163" y="235" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">= new</text>
            <text x="193" y="235" fill="#67e8f9" fontSize="7.5" fontFamily="monospace">App()</text>

            <text x="102" y="249" fill="#f0abfc" fontSize="7.5" fontFamily="monospace">server</text>
            <text x="136" y="249" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">.</text>
            <text x="140" y="249" fill="#fbbf24" fontSize="7.5" fontFamily="monospace">connect</text>
            <text x="176" y="249" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">(</text>
            <text x="180" y="249" fill="#86efac" fontSize="7.5" fontFamily="monospace">db</text>
            <text x="192" y="249" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">)</text>

            <text x="102" y="263" fill="#f0abfc" fontSize="7.5" fontFamily="monospace">server</text>
            <text x="136" y="263" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">.</text>
            <text x="140" y="263" fill="#fbbf24" fontSize="7.5" fontFamily="monospace">deploy</text>
            <text x="172" y="263" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">(</text>
            <text x="176" y="263" fill="#86efac" fontSize="7.5" fontFamily="monospace">'prod'</text>
            <text x="207" y="263" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">)</text>

            {/* Cursor blink */}
            <rect x="102" y="270" width="5" height="9" fill="#7c5cfc" opacity={pulseFactor > 0.9 ? 0.8 : 0.1}>
              <animate attributeName="opacity" values="0;0.8;0" dur="1.2s" repeatCount="indefinite" />
            </rect>

            <text x="102" y="287" fill="#4b3f80" fontSize="7.5" fontFamily="monospace">{'// ✓ deployed'}</text>
          </g>

          {/* Webcam dot */}
          <circle cx="165" cy="189" r="1.5" fill="#1a1030" stroke="#4b3f80" strokeWidth="0.5" />

          {/* Keyboard base */}
          <path
            d="M60 305 L75 305 Q75 305 75 305 L255 305 Q260 305 260 308 L270 340 Q270 343 267 343 L63 343 Q60 343 60 340 Z"
            fill="url(#bodyGrad)"
            stroke="#7c5cfc"
            strokeWidth="0.8"
            strokeOpacity="0.25"
          />

          {/* Keyboard keys grid */}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 10 }).map((_, col) => (
              <rect
                key={`key-${row}-${col}`}
                x={78 + col * 17 + row * 1.2}
                y={310 + row * 7.5}
                width={14}
                height={5}
                rx={1}
                fill="#0d0a1a"
                stroke="#7c5cfc"
                strokeWidth="0.3"
                strokeOpacity="0.12"
              />
            ))
          )}

          {/* Trackpad */}
          <rect x="135" y="333" width="55" height="6" rx="2" fill="#0d0a1a" stroke="#7c5cfc" strokeWidth="0.3" strokeOpacity="0.15" />
        </g>

        {/* ========== MOBILE DEVICE (Section 4) ========== */}
        <g
          style={{
            opacity: showMobile ? 1 : 0,
            transform: showMobile ? 'translateX(0)' : 'translateX(-30px)',
            transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1) 0.2s',
          }}
        >
          {/* Phone body */}
          <rect x="40" y="380" width="50" height="85" rx="8" fill="#1a1030" stroke="#7c5cfc" strokeWidth="0.8" strokeOpacity="0.3" />
          {/* Phone screen */}
          <rect x="44" y="390" width="42" height="60" rx="3" fill="url(#screenGrad)" />
          {/* Mini app UI */}
          <rect x="48" y="394" width="34" height="5" rx="1" fill="#7c5cfc" opacity="0.15" />
          <rect x="48" y="402" width="20" height="3" rx="1" fill="#a78bfa" opacity="0.2" />
          <rect x="48" y="408" width="34" height="12" rx="2" fill="#7c5cfc" opacity="0.08" />
          <rect x="48" y="423" width="25" height="3" rx="1" fill="#a78bfa" opacity="0.15" />
          <rect x="48" y="429" width="34" height="12" rx="2" fill="#7c5cfc" opacity="0.08" />
          {/* Home indicator */}
          <rect x="55" y="455" width="20" height="2.5" rx="1.5" fill="#7c5cfc" opacity="0.2" />
          {/* Label */}
          <text x="65" y="478" textAnchor="middle" fill="#a78bfa" fontSize="8" fontFamily="Inter, sans-serif" opacity="0.5">MOBILE</text>
        </g>

        {/* ========== CONNECTION: Laptop → Mobile ========== */}
        {showMobile && (
          <g style={{ opacity: showFullEcosystem ? 1 : 0, transition: 'opacity 1s ease 0.6s' }}>
            <path
              d="M75 310 Q60 360 65 380"
              stroke="#7c5cfc" strokeWidth="1" strokeOpacity="0.1" fill="none"
            />
            <path
              d="M75 310 Q60 360 65 380"
              stroke="url(#lineGlow)" strokeWidth="1.5"
              strokeDasharray="4 8" strokeDashoffset={dashOffset * 0.7}
              strokeOpacity="0.5" fill="none" filter="url(#glow)"
            />
          </g>
        )}

        {/* ========== CONNECTION: Server → Cloud ========== */}
        {showCloud && (
          <g style={{ opacity: showFullEcosystem ? 1 : 0, transition: 'opacity 1s ease 0.5s' }}>
            <line x1="340" y1="70" x2="355" y2="175" stroke="#7c5cfc" strokeWidth="0.8" strokeOpacity="0.08" />
            <line
              x1="340" y1="70" x2="355" y2="175"
              stroke="url(#lineGlowV)" strokeWidth="1.5"
              strokeDasharray="4 8" strokeDashoffset={dashOffset * 0.6}
              strokeOpacity="0.4" fill="none" filter="url(#glow)"
            />
          </g>
        )}

        {/* ========== STATUS INDICATORS ========== */}
        {/* Connection status badge */}
        <g
          style={{
            opacity: showDataFlow ? 1 : 0,
            transition: 'opacity 0.8s ease 0.6s',
          }}
        >
          <rect x="290" y="210" width="55" height="18" rx="9" fill="#0d0a1a" stroke="#34d399" strokeWidth="0.8" strokeOpacity="0.4" />
          <circle cx="302" cy="219" r="3" fill="#34d399" opacity={pulseFactor}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="322" y="223" textAnchor="middle" fill="#34d399" fontSize="7.5" fontFamily="Inter, sans-serif" opacity="0.8">LIVE</text>
        </g>

        {/* ========== FLOATING PARTICLES (ambient) ========== */}
        {[...Array(8)].map((_, i) => {
          const angle = (time * 0.003 + i * 0.785) % (Math.PI * 2);
          const radius = 200 + Math.sin(time * 0.005 + i) * 30;
          const cx = 260 + Math.cos(angle) * radius * 0.7;
          const cy = 260 + Math.sin(angle) * radius * 0.5;
          const opacity = 0.1 + Math.sin(time * 0.02 + i * 1.5) * 0.1;
          return (
            <circle
              key={`particle-${i}`}
              cx={cx} cy={cy} r={1.2}
              fill="#7c5cfc"
              opacity={opacity}
            />
          );
        })}
      </svg>
    </div>
  );
}
