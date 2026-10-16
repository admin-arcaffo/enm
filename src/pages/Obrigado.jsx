import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Instagram, ArrowLeft } from 'lucide-react'

const Obrigado = () => {
  return (
    <div className="obrigado-page" style={{
      background: '#000', color: '#fff', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background Decor */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(47, 209, 168, 0.08) 0%, transparent 70%)', filter: 'blur(100px)'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass"
        style={{
          padding: '80px 40px', borderRadius: '40px', maxWidth: '600px', width: 'calc(100% - 40px)',
          background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative', zIndex: 1
        }}
      >
        <div style={{ color: 'var(--accent-mint)', marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <CheckCircle size={80} strokeWidth={1.5} />
        </div>

        <h1 style={{ fontFamily: 'var(--arcaffo-font-display)', fontSize: 'clamp(36px, 6vw, 64px)', marginBottom: '24px', lineHeight: '0.92', letterSpacing: '-0.01em', fontWeight: 100, textTransform: 'uppercase' }}>
          Aplicação <br /><em style={{ fontFamily: 'var(--arcaffo-font-display)', color: 'var(--accent-mint)', fontStyle: 'italic', fontWeight: 100, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Recebida!</em>
        </h1>

        <p style={{ fontFamily: 'var(--arcaffo-font-body)', fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.65', maxWidth: '54ch', margin: '0 auto 48px', fontWeight: 400 }}>
          Obrigado por seu interesse na ENM. Nosso time de estrategistas entrará em contato em breve para os próximos passos.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <a href="https://instagram.com/arcaffo.enm" target="_blank" rel="noreferrer" className="btn-mint" style={{
            padding: '16px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', color: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
          }}>
            <Instagram size={20} /> ACOMPANHE NO INSTAGRAM
          </a>
          <a href="/" style={{
            color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            <ArrowLeft size={16} /> Voltar para o site
          </a>
        </div>
      </motion.div>

      <footer style={{ position: 'absolute', bottom: '40px', width: '100%', opacity: 0.3 }}>
        <img src="/_Assets/Layer_1.svg" alt="Arcaffo" style={{ height: '20px' }} />
      </footer>
    </div>
  )
}

export default Obrigado
