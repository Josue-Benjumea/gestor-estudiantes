import React, { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  pulse: number;
  pulseSpeed: number;
  connections: number[];
  brightness: number;
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  fromNode: number;
  toNode: number;
  opacity: number;
}

interface TechNetworkProps {
  className?: string;
}

export default function TechNetwork({ className = '' }: TechNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);
  const dprRef = useRef(1);

  const NODE_COUNT = 45;
  const MAX_DISTANCE = 200;
  const PARTICLE_COUNT = 18;

  const initNodes = useCallback((width: number, height: number) => {
    const nodes: Node[] = [];
    const padding = 40;

    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.min(width, height) * 0.4;
      const cx = width / 2;
      const cy = height / 2;

      nodes.push({
        x: cx + Math.cos(angle) * dist + (Math.random() - 0.5) * padding,
        y: cy + Math.sin(angle) * dist + (Math.random() - 0.5) * padding,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 2 + Math.random() * 3,
        baseRadius: 2 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        connections: [],
        brightness: 0.3 + Math.random() * 0.7,
      });
    }

    // Pre-compute connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DISTANCE * 1.2) {
          nodes[i].connections.push(j);
        }
      }
    }

    nodesRef.current = nodes;

    // Init particles flowing between nodes
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const fromIdx = Math.floor(Math.random() * nodes.length);
      const conns = nodes[fromIdx].connections;
      if (conns.length === 0) continue;
      const toIdx = conns[Math.floor(Math.random() * conns.length)];

      particles.push({
        x: nodes[fromIdx].x,
        y: nodes[fromIdx].y,
        targetX: nodes[toIdx].x,
        targetY: nodes[toIdx].y,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.006,
        fromNode: fromIdx,
        toNode: toIdx,
        opacity: 0.4 + Math.random() * 0.6,
      });
    }
    particlesRef.current = particles;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = dprRef.current;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const nodes = nodesRef.current;
    const particles = particlesRef.current;
    const time = timeRef.current;
    const mouse = mouseRef.current;

    // Update node positions
    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;
      node.pulse += node.pulseSpeed;

      // Bounce off edges with padding
      const pad = 30;
      if (node.x < pad || node.x > width - pad) node.vx *= -1;
      if (node.y < pad || node.y > height - pad) node.vy *= -1;
      node.x = Math.max(pad, Math.min(width - pad, node.x));
      node.y = Math.max(pad, Math.min(height - pad, node.y));

      // Mouse interaction — gentle repulsion
      const mdx = node.x - mouse.x;
      const mdy = node.y - mouse.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < 120) {
        const force = (120 - mDist) / 120 * 0.5;
        node.vx += (mdx / mDist) * force;
        node.vy += (mdy / mDist) * force;
      }

      // Damping
      node.vx *= 0.995;
      node.vy *= 0.995;

      // Pulse radius
      node.radius = node.baseRadius + Math.sin(node.pulse) * 1;
    }

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      for (const j of nodeA.connections) {
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DISTANCE) {
          const alpha = (1 - dist / MAX_DISTANCE) * 0.15;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.strokeStyle = `rgba(124, 92, 252, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw particles flowing along connections
    for (const particle of particles) {
      particle.progress += particle.speed;

      const fromNode = nodes[particle.fromNode];
      const toNode = nodes[particle.toNode];
      particle.x = fromNode.x + (toNode.x - fromNode.x) * particle.progress;
      particle.y = fromNode.y + (toNode.y - fromNode.y) * particle.progress;

      if (particle.progress >= 1) {
        particle.progress = 0;
        particle.fromNode = particle.toNode;
        const conns = nodes[particle.fromNode].connections;
        if (conns.length > 0) {
          particle.toNode = conns[Math.floor(Math.random() * conns.length)];
        }
      }

      // Draw particle with glow
      const pAlpha = particle.opacity * (0.5 + Math.sin(time * 0.03 + particle.progress * Math.PI) * 0.5);
      const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, 6);
      gradient.addColorStop(0, `rgba(167, 139, 250, ${pAlpha})`);
      gradient.addColorStop(0.4, `rgba(124, 92, 252, ${pAlpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(124, 92, 252, 0)');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner bright core
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 210, 255, ${pAlpha * 0.8})`;
      ctx.fill();
    }

    // Draw nodes
    for (const node of nodes) {
      const pulseAlpha = 0.06 + Math.sin(node.pulse) * 0.03;

      // Outer glow
      const outerGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 6);
      outerGlow.addColorStop(0, `rgba(124, 92, 252, ${pulseAlpha * node.brightness})`);
      outerGlow.addColorStop(1, 'rgba(124, 92, 252, 0)');
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 6, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Node body
      const bodyGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius);
      bodyGradient.addColorStop(0, `rgba(200, 185, 255, ${0.7 * node.brightness})`);
      bodyGradient.addColorStop(0.5, `rgba(124, 92, 252, ${0.5 * node.brightness})`);
      bodyGradient.addColorStop(1, `rgba(100, 70, 220, ${0.2 * node.brightness})`);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = bodyGradient;
      ctx.fill();
    }

    // Central subtle radial glow
    const centerGlow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.min(width, height) * 0.45);
    centerGlow.addColorStop(0, 'rgba(124, 92, 252, 0.02)');
    centerGlow.addColorStop(0.5, 'rgba(124, 92, 252, 0.01)');
    centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
    timeRef.current++;
    animationRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = rect?.width || 500;
      const h = rect?.height || 500;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      initNodes(w, h);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw, initNodes]);

  return (
    <div className={`relative ${className}`} style={{ width: 500, height: 500 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}
