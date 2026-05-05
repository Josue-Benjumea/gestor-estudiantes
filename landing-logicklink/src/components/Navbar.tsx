import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import LogoImg from '@/assets/Logo.png';

interface NavbarProps {
  onNavigate?: (id: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Inicio', id: 'hero' },
    { label: 'Servicios', id: 'services' },
    { label: 'Productos', id: 'products' },
    { label: 'Nosotros', id: 'about' },
    { label: 'Contacto', id: 'contact' },
  ];

  const handleClick = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onNavigate?.(id);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'nav-glass py-3' : 'py-5 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => handleClick('hero')} className="flex items-center gap-3 group">
            <img src={LogoImg} alt="LogickLink" className="h-8 sm:h-9 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-lg sm:text-xl font-bold gradient-text tracking-tight">LogickLink</span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleClick(link.id)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-white/[0.03]"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <button onClick={() => handleClick('contact')} className="btn-primary text-sm px-6 py-2.5">
              Cotizar Proyecto
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          className="fixed inset-0 z-[99] nav-glass pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col items-center gap-6 py-10">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleClick(link.id)}
                className="text-xl font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button onClick={() => handleClick('contact')} className="btn-primary mt-4">
              Cotizar Proyecto
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
