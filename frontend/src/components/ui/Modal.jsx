import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal component with macOS-style spring animation.
 */
export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  const sizes = { sm: '420px', md: '520px', lg: '680px', xl: '800px' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            style={{ maxWidth: sizes[size] }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{title}</h2>
              <button className="btn-ghost btn-icon" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
