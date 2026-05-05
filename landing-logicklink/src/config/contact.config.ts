/**
 * ═══════════════════════════════════════════════════════
 * Configuración del Formulario de Contacto — LogickLink
 * ═══════════════════════════════════════════════════════
 * 
 * Para configurar el envío de emails:
 * 
 * 1. Crea una cuenta GRATUITA en https://www.emailjs.com/
 * 2. Agrega tu servicio de email (Gmail, Outlook, etc.)
 * 3. Crea un template con las variables: {{from_name}}, {{from_email}}, {{subject}}, {{message}}
 * 4. Copia tu Service ID, Template ID y Public Key aquí abajo
 * 
 * ¡Eso es todo! Los mensajes del formulario llegarán a tu correo.
 */

export const contactConfig = {
  // ─── Servicio de Email ─────────────────────────────────
  // 'emailjs' = envía emails directo desde el navegador (recomendado, gratis)
  // 'formspree' = alternativa si prefieres no usar EmailJS
  service: 'emailjs' as 'emailjs' | 'formspree',

  // ─── EmailJS (gratis: 200 emails/mes) ──────────────────
  // Obtén estas keys en: https://dashboard.emailjs.com/
  emailjs: {
    serviceId: 'YOUR_SERVICE_ID',       // ← Cambia esto
    templateId: 'YOUR_TEMPLATE_ID',     // ← Cambia esto
    publicKey: 'YOUR_PUBLIC_KEY',       // ← Cambia esto
  },

  // ─── Formspree (alternativa: 50 emails/mes gratis) ─────
  // Obtén tu Form ID en: https://formspree.io/
  formspree: {
    formId: 'YOUR_FORM_ID',            // ← Cambia esto si usas Formspree
  },

  // ─── Información de Contacto (se muestra en la UI) ─────
  displayInfo: {
    email: 'contacto@logicklink.com',
    phone: '+57 (300) 000-0000',
    location: 'Colombia',
  },

  // ─── Redes Sociales ────────────────────────────────────
  socials: [
    { name: 'Website', url: 'https://logicklink.com', icon: 'globe' as const },
    { name: 'Portfolio', url: '#products', icon: 'link' as const },
  ],

  // ─── Mensajes de la UI ─────────────────────────────────
  messages: {
    success: '¡Mensaje enviado con éxito! Te contactaremos pronto.',
    error: 'Error al enviar el mensaje. Intenta de nuevo o escríbenos directamente.',
    sending: 'Enviando...',
    submit: 'Enviar Mensaje',
  },
};
