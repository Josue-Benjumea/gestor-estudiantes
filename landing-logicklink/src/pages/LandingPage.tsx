import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Code2, Zap, Shield, Users, ArrowRight, Monitor, Smartphone,
  Database, Cloud, Palette, BarChart3, CheckCircle2, Star,
  Mail, Phone, MapPin, Globe as GlobeIcon, ExternalLink, Send, GraduationCap,
  Layers, Rocket, Heart, Target, Clock
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { CinematicHero } from '@/components/ui/cinematic-hero';
import LogoImg from '@/assets/Logo.png';

/* ─── Animated Section Wrapper ─────────────────────────── */
function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Services Section ─────────────────────────────────── */
function ServicesSection() {
  const services = [
    {
      icon: <Code2 size={24} />,
      title: 'Desarrollo a la Medida',
      desc: 'Software diseñado específicamente para tus procesos de negocio, desde aplicaciones web hasta sistemas empresariales complejos.',
    },
    {
      icon: <Smartphone size={24} />,
      title: 'Aplicaciones Móviles',
      desc: 'Apps nativas y multiplataforma con diseño premium y rendimiento óptimo para iOS y Android.',
    },
    {
      icon: <Cloud size={24} />,
      title: 'Soluciones Cloud',
      desc: 'Arquitecturas escalables en la nube con despliegue automatizado y alta disponibilidad.',
    },
    {
      icon: <Database size={24} />,
      title: 'Integración de Sistemas',
      desc: 'Conectamos tus herramientas existentes en un ecosistema unificado y eficiente.',
    },
    {
      icon: <Shield size={24} />,
      title: 'Consultoría Técnica',
      desc: 'Asesoría experta en arquitectura, seguridad y mejores prácticas de desarrollo.',
    },
    {
      icon: <Palette size={24} />,
      title: 'Diseño UI/UX',
      desc: 'Interfaces intuitivas y experiencias de usuario que cautivan desde el primer clic.',
    },
  ];

  return (
    <section id="services" className="section-padding relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-xs font-medium text-primary">
            <Zap size={14} /> Nuestros Servicios
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-hero mb-4 tracking-tight">
            Soluciones que Transforman
          </h2>
          <p className="text-muted-foreground/70 text-lg max-w-2xl mx-auto">
            Combinamos tecnología de vanguardia con diseño excepcional para crear software que impulsa tu negocio al siguiente nivel.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <FadeIn key={service.title} delay={i * 0.08}>
              <div className="glass-card p-6 sm:p-8 group h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground/70 text-sm leading-relaxed">{service.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Products Section (EduManager) ────────────────────── */
function ProductsSection() {
  const features = [
    { icon: <Users size={18} />, text: 'Multi-rol: Admin, Profesor, Estudiante' },
    { icon: <GraduationCap size={18} />, text: 'Gestión completa de estudiantes y grupos' },
    { icon: <BarChart3 size={18} />, text: 'Calificaciones por actividades con promedios' },
    { icon: <Shield size={18} />, text: 'Autenticación JWT y control de acceso RBAC' },
    { icon: <Layers size={18} />, text: 'Periodos académicos con certificados PDF' },
    { icon: <Monitor size={18} />, text: 'Dashboard analítico en tiempo real' },
  ];

  return (
    <section id="products" className="section-padding relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Info */}
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-xs font-medium text-primary">
              <Rocket size={14} /> Caso de Éxito
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-hero mb-6 tracking-tight">
              EduManager
            </h2>
            <p className="text-muted-foreground/70 text-lg mb-8 leading-relaxed">
              Sistema de Gestión de Estudiantes desarrollado con arquitectura Clean, 
              Node.js + React, y base de datos SQLite. Una solución integral para 
              instituciones educativas que necesitan control académico total.
            </p>

            <div className="grid gap-3 mb-8">
              {features.map((f, i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {f.icon}
                    </div>
                    {f.text}
                  </div>
                </FadeIn>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="https://gestor-estudiantes-production.up.railway.app" target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 hover:no-underline">
                Ver Demo <ArrowRight size={16} />
              </a>
              <a href="https://github.com/Josue-Benjumea/gestor-estudiantes" target="_blank" rel="noopener noreferrer" className="btn-secondary hover:no-underline">
                Código Fuente
              </a>
            </div>
          </FadeIn>

          {/* Right: Visual */}
          <FadeIn delay={0.15}>
            <div className="liquid-glass p-8 sm:p-10 relative">
              <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-purple-500/10 blur-3xl" />
              
              {/* Mock Dashboard */}
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <img src={LogoImg} alt="" className="h-8" />
                  <div>
                    <div className="font-bold text-foreground">EduManager</div>
                    <div className="text-xs text-muted-foreground">Panel de Administración</div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Estudiantes', value: '248', color: 'text-blue-400' },
                    { label: 'Profesores', value: '15', color: 'text-green-400' },
                    { label: 'Promedio', value: '82.5', color: 'text-purple-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="glass rounded-xl p-3 text-center">
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini Table */}
                <div className="glass rounded-xl overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/[0.04] text-xs font-medium text-muted-foreground">
                    Últimas Calificaciones
                  </div>
                  {['María López — 95', 'Carlos Ruiz — 88', 'Ana Gómez — 92'].map((row, i) => (
                    <div key={i} className="px-4 py-2.5 text-sm flex items-center justify-between border-b border-white/[0.02] last:border-0">
                      <span className="text-foreground/80">{row.split(' — ')[0]}</span>
                      <span className="font-semibold text-green-400">{row.split(' — ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── About Section ────────────────────────────────────── */
function AboutSection() {
  const values = [
    { icon: <Target size={22} />, title: 'Eficiencia', desc: 'Entregamos resultados en tiempo y forma, optimizando cada proceso de desarrollo.' },
    { icon: <Star size={22} />, title: 'Calidad', desc: 'Código limpio, arquitectura sólida y estándares de la industria en cada proyecto.' },
    { icon: <Heart size={22} />, title: 'Satisfacción', desc: 'Tu éxito es nuestra prioridad. Colaboración cercana en cada etapa del proyecto.' },
    { icon: <Clock size={22} />, title: 'Agilidad', desc: 'Metodologías ágiles que se adaptan a tus necesidades y tiempos.' },
  ];

  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeIn className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-xs font-medium text-primary">
            <Users size={14} /> Sobre Nosotros
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-hero mb-4 tracking-tight">
            ¿Por qué LogickLink?
          </h2>
          <p className="text-muted-foreground/70 text-lg max-w-2xl mx-auto">
            Somos un equipo apasionado por crear software a la medida que realmente 
            resuelve problemas. Cada línea de código refleja nuestro compromiso con la excelencia.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((val, i) => (
            <FadeIn key={val.title} delay={i * 0.1}>
              <div className="glass-card p-6 text-center h-full group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  {val.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{val.title}</h3>
                <p className="text-muted-foreground/60 text-sm leading-relaxed">{val.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Stats */}
        <FadeIn delay={0.2}>
          <div className="liquid-glass p-8 sm:p-12 mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Proyectos Entregados' },
              { value: '30+', label: 'Clientes Satisfechos' },
              { value: '99%', label: 'Tasa de Retención' },
              { value: '24/7', label: 'Soporte Técnico' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Contact Section ──────────────────────────────────── */
function ContactSection() {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setStatus('sending');

    try {
      const { contactConfig } = await import('@/config/contact.config');
      const formData = new FormData(formRef.current);

      if (contactConfig.service === 'emailjs') {
        const emailjs = await import('@emailjs/browser');
        await emailjs.sendForm(
          contactConfig.emailjs.serviceId,
          contactConfig.emailjs.templateId,
          formRef.current,
          contactConfig.emailjs.publicKey
        );
      } else {
        await fetch(`https://formspree.io/f/${contactConfig.formspree.formId}`, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });
      }
      setStatus('success');
      formRef.current.reset();
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  // Import config at module level for display info
  const [cfg, setCfg] = React.useState<{ displayInfo: { email: string; phone: string; location: string }; socials: { name: string; url: string; icon: string }[]; messages: Record<string, string> } | null>(null);
  React.useEffect(() => {
    import('@/config/contact.config').then(m => setCfg(m.contactConfig));
  }, []);

  const info = cfg?.displayInfo || { email: 'contacto@logicklink.com', phone: '+57 (300) 000-0000', location: 'Colombia' };
  const msgs = cfg?.messages || { success: '¡Enviado!', error: 'Error', sending: 'Enviando...', submit: 'Enviar Mensaje' };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40";

  return (
    <section id="contact" className="section-padding relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-xs font-medium text-primary">
            <Mail size={14} /> Contacto
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-hero mb-4 tracking-tight">
            ¿Listo para Empezar?
          </h2>
          <p className="text-muted-foreground/70 text-lg max-w-2xl mx-auto">
            Cuéntanos sobre tu proyecto y te ayudaremos a convertir tu idea en realidad.
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Contact Form */}
          <FadeIn className="lg:col-span-3">
            <div className="liquid-glass p-6 sm:p-8">
              <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Nombre</label>
                    <input type="text" name="from_name" required className={inputClass} placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
                    <input type="email" name="from_email" required className={inputClass} placeholder="correo@empresa.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Asunto</label>
                  <input type="text" name="subject" required className={inputClass} placeholder="¿En qué podemos ayudarte?" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Mensaje</label>
                  <textarea rows={4} name="message" required className={`${inputClass} resize-none`} placeholder="Describe tu proyecto o idea..." />
                </div>

                {status === 'success' && (
                  <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3 text-center">{msgs.success}</div>
                )}
                {status === 'error' && (
                  <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-center">{msgs.error}</div>
                )}

                <button type="submit" disabled={status === 'sending'} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  <Send size={16} /> {status === 'sending' ? msgs.sending : msgs.submit}
                </button>
              </form>
            </div>
          </FadeIn>

          {/* Contact Info */}
          <FadeIn className="lg:col-span-2" delay={0.1}>
            <div className="space-y-5 h-full flex flex-col justify-center">
              {[
                { icon: <Mail size={20} />, title: 'Email', value: info.email },
                { icon: <Phone size={20} />, title: 'Teléfono', value: info.phone },
                { icon: <MapPin size={20} />, title: 'Ubicación', value: info.location },
              ].map((item) => (
                <div key={item.title} className="glass-card p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">{item.title}</div>
                    <div className="text-sm font-medium text-foreground">{item.value}</div>
                  </div>
                </div>
              ))}

              {/* Social */}
              <div className="glass-card p-5">
                <div className="text-xs text-muted-foreground mb-3">Síguenos</div>
                <div className="flex gap-3">
                  {(cfg?.socials || []).map((social, i) => (
                    <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all duration-300">
                      {social.icon === 'globe' ? <GlobeIcon size={18} /> : <ExternalLink size={18} />}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={LogoImg} alt="LogickLink" className="h-7" />
            <span className="font-semibold gradient-text">LogickLink</span>
          </div>
          <div className="text-sm text-muted-foreground/50">
            © {new Date().getFullYear()} LogickLink. Todos los derechos reservados.
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground/50">
            <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
            <a href="#" className="hover:text-foreground transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Landing Page
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Cinematic Hero — GSAP scroll-pinned */}
      <div id="hero">
        <CinematicHero />
      </div>

      {/* Content Sections */}
      <ServicesSection />
      <ProductsSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
