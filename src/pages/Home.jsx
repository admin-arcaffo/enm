import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Check, Target, Zap, Shield, Users, Building2, Calendar, ChevronRight, X } from 'lucide-react'
import ImmersionsTable from '../components/ImmersionsTable'

const ARCAFFO_FORM_ID = '43806485-a241-4186-ad42-24eba92be63f'
const ARCAFFO_FORM_SCRIPT = 'https://forms.arcaffo.com/form.js'
const ARCAFFO_FORM_FALLBACK = 'https://forms.arcaffo.com/f/siteenm-glm3'
const ARCAFFO_SCRIPT_ID = 'arcaffo-form-script'

const getScrollBehavior = () => (
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
)

const scrollToSection = (hash, { updateHistory = false, behavior = getScrollBehavior() } = {}) => {
  if (!hash || hash === '#') return false

  let targetId
  try {
    targetId = decodeURIComponent(hash.slice(1))
  } catch {
    targetId = hash.slice(1)
  }

  const target = document.getElementById(targetId)
  if (!target) return false

  if (updateHistory && window.location.hash !== hash) {
    window.history.pushState({ section: targetId }, '', hash)
  }

  target.scrollIntoView({ behavior, block: 'start' })

  // Recalcula a posição após animações/fontes assíncronas alterarem o layout.
  window.setTimeout(() => {
    const navOffset = Number.parseFloat(
      window.getComputedStyle(document.documentElement).getPropertyValue('--nav-offset')
    ) || 96
    const distanceFromExpectedPosition = target.getBoundingClientRect().top - navOffset

    if (Math.abs(distanceFromExpectedPosition) > 2) {
      window.scrollBy({ top: distanceFromExpectedPosition, behavior: 'auto' })
    }
  }, behavior === 'smooth' ? 700 : 0)

  return true
}


// Layout Components
const Section = ({ children, id, className = "", style = {} }) => (
  <section id={id} className={`section-padding ${className}`} style={{
    width: '100%',
    position: 'relative',
    ...style
  }}>
    <div className="container">
      {children}
    </div>
  </section>
)

const FadeIn = ({ children, delay = 0, y = 20 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  )
}

const ArcaffoForm = () => {
  const containerRef = useRef(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    let active = true
    let timeoutId

    const handleReady = () => {
      if (!active) return
      window.clearTimeout(timeoutId)
      setLoadError(false)
    }

    const handleError = () => {
      if (!active) return
      window.clearTimeout(timeoutId)
      setLoadError(true)
    }

    const mountForm = () => {
      if (!active) return
      if (window.ArcaffoForms?.mount) {
        window.ArcaffoForms.mount(container)
      } else {
        handleError()
      }
    }

    container.addEventListener('arcaffo:ready', handleReady)
    container.addEventListener('arcaffo:error', handleError)

    let script = document.getElementById(ARCAFFO_SCRIPT_ID)
    if (window.ArcaffoForms?.mount) {
      mountForm()
    } else if (script) {
      script.addEventListener('load', mountForm)
      script.addEventListener('error', handleError)
    } else {
      script = document.createElement('script')
      script.id = ARCAFFO_SCRIPT_ID
      script.src = ARCAFFO_FORM_SCRIPT
      script.defer = true
      script.addEventListener('load', mountForm)
      script.addEventListener('error', handleError)
      document.body.appendChild(script)
    }

    timeoutId = window.setTimeout(handleError, 15000)

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      container.removeEventListener('arcaffo:ready', handleReady)
      container.removeEventListener('arcaffo:error', handleError)
      script?.removeEventListener('load', mountForm)
      script?.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        data-arcaffo-form={ARCAFFO_FORM_ID}
        data-view="all"
        className="arcaffo-form-container"
      />
      {loadError ? (
        <p className="arcaffo-form-fallback" role="alert">
          Não foi possível carregar o formulário agora.{' '}
          <a href={ARCAFFO_FORM_FALLBACK}>Abrir Site_ENM</a>
        </p>
      ) : null}
      <noscript><a href={ARCAFFO_FORM_FALLBACK}>Abrir Site_ENM</a></noscript>
    </>
  )
}

const App = () => {
  useEffect(() => {
    const handleAnchorClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return

      const anchor = event.target instanceof Element
        ? event.target.closest('a[href^="#"]')
        : null
      if (!anchor) return

      const hash = anchor.getAttribute('href')
      if (scrollToSection(hash, { updateHistory: true })) {
        event.preventDefault()
      }
    }

    const handleHistoryNavigation = () => {
      scrollToSection(window.location.hash, { behavior: 'auto' })
    }

    document.addEventListener('click', handleAnchorClick)
    window.addEventListener('hashchange', handleHistoryNavigation)
    window.addEventListener('popstate', handleHistoryNavigation)

    let initialHashFrame
    if (window.location.hash) {
      initialHashFrame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(handleHistoryNavigation)
      })
      document.fonts?.ready.then(handleHistoryNavigation).catch(() => {})
    }

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      window.removeEventListener('hashchange', handleHistoryNavigation)
      window.removeEventListener('popstate', handleHistoryNavigation)
      window.cancelAnimationFrame(initialHashFrame)
    }
  }, [])

  return (
    <div className="app" style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-main)' }}>

      {/* Background Decor */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-10%', width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(47, 209, 168, 0.05) 0%, transparent 70%)', filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(234, 227, 219, 0.03) 0%, transparent 70%)', filter: 'blur(80px)'
        }} />
      </div>

      {/* Floating Capsule Navbar (Advisor standard) */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '12px 16px 0', pointerEvents: 'none' }}>
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            pointerEvents: 'auto',
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 24px',
            borderRadius: '9999px',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.36)'
          }}
        >
          <a href="#" style={{ display: 'flex', alignItems: 'center', transition: 'opacity 0.2s', textDecoration: 'none' }}>
            <img src="/_Assets/Icon set.svg" alt="ENM" style={{ height: '22px', width: 'auto' }} />
          </a>

          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#sobre" style={{ fontFamily: 'var(--arcaffo-font-label)', fontSize: '10.5px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 500, textTransform: 'uppercase', transition: 'color 0.2s' }}>A ESCOLA</a>
            <a href="#solucoes" style={{ fontFamily: 'var(--arcaffo-font-label)', fontSize: '10.5px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 500, textTransform: 'uppercase', transition: 'color 0.2s' }}>FORMATOS</a>
            <a href="#imersoes" style={{ fontFamily: 'var(--arcaffo-font-label)', fontSize: '10.5px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 500, textTransform: 'uppercase', transition: 'color 0.2s' }}>PRÓXIMAS IMERSÕES</a>
          </div>

          <a
            href="#form"
            className="btn-pill-advisor"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '9999px',
              paddingLeft: '20px',
              paddingRight: '8px',
              paddingTop: '6px',
              paddingBottom: '6px',
              fontFamily: 'var(--arcaffo-font-label)',
              fontSize: '10.5px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#000',
              backgroundColor: 'var(--accent-mint)',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              minHeight: '40px'
            }}
          >
            <span>CONTATO</span>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s'
            }}>
              <svg
                aria-hidden="true"
                style={{ width: '14px', height: '14px', transition: 'transform 0.3s' }}
                className="btn-pill-arrow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </a>
        </motion.nav>
      </div>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'url(/_Assets/Hero.jpg) center/cover no-repeat', position: 'relative',
        textAlign: 'center', overflow: 'hidden', padding: '120px 0 100px'
      }}>
        {/* Ambient Mint Gradient Blobs & Grain Overlay (Advisor standard) */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
          <span className="gradient-blob-a" style={{ position: 'absolute', inset: 0 }} />
          <span className="gradient-blob-b" style={{ position: 'absolute', inset: 0 }} />
          <span className="gradient-blob-c" style={{ position: 'absolute', inset: 0 }} />
          <div className="grain" style={{ position: 'absolute', inset: 0, opacity: 0.12 }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), #000 95%)', zIndex: 2 }} />
        <div className="container" style={{ position: 'relative', zIndex: 3 }}>
          <FadeIn y={30}>
            <span style={{ fontFamily: 'var(--arcaffo-font-label)', fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-mint)', display: 'block', marginBottom: '20px', fontWeight: 500 }}>
              Arcaffo Group apresenta
            </span>
            <h1 style={{ fontFamily: 'var(--arcaffo-font-display)', fontSize: 'clamp(44px, 10vw, 110px)', lineHeight: '0.92', letterSpacing: '-0.01em', fontWeight: 100, textTransform: 'uppercase', marginBottom: '32px' }}>
              INTELIGÊNCIA <br />
              <em style={{ fontFamily: 'var(--arcaffo-font-display)', color: 'var(--accent-mint)', fontStyle: 'italic', fontWeight: 100, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>ESTRATÉGICA</em> <br />
              PARA MARCAS.
            </h1>
            <p style={{ fontFamily: 'var(--arcaffo-font-body)', fontSize: 'clamp(16px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.7)', maxWidth: '54ch', margin: '0 auto 40px', fontWeight: 400, lineHeight: '1.65' }}>
              Ensinamos empresários a construir ativos de branding inegociáveis, eliminando a dependência de agências e assumindo o controle da própria narrativa.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#imersoes" className="btn" style={{ background: 'var(--accent-mint)', color: '#000', padding: '16px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '14px' }}>Próximas Imersões</a>
              <a href="#form" className="btn glass" style={{ color: '#fff', padding: '16px 28px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px' }}>In Company</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Intro / Manifesto */}
      <Section id="sobre">
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <FadeIn>
            <h2 style={{ fontFamily: 'var(--arcaffo-font-display)', fontSize: 'clamp(32px, 6vw, 64px)', lineHeight: '0.92', letterSpacing: '-0.01em', fontWeight: 100, textTransform: 'uppercase', marginBottom: '32px' }}>
              O mercado te ensinou a <span style={{ color: 'rgba(255,255,255,0.3)' }}>delegar sua alma.</span> <br />
              Nós te ensinamos a <br /><em style={{ fontFamily: 'var(--arcaffo-font-display)', fontStyle: 'italic', fontWeight: 100, textTransform: 'uppercase' }}>ser o dono dela.</em>
            </h2>
            <p style={{ fontFamily: 'var(--arcaffo-font-body)', fontSize: 'clamp(15px, 2vw, 17px)', color: 'rgba(255,255,255,0.6)', lineHeight: '1.65', maxWidth: '54ch', fontWeight: 400, marginBottom: '40px' }}>
              A Escola de Negócios & Marcas é o braço educacional da Arcaffo. Aqui, a teoria encontra a trincheira. Não entregamos fórmulas prontas, mas sim a capacidade analítica e estratégica para que sua marca seja uma potência cultural e comercial.
            </p>
            <div style={{ display: 'flex', gap: '48px' }}>
              <div>
                <div className="stat-number" style={{ fontFamily: 'var(--arcaffo-font-display)', color: 'var(--accent-mint)', fontSize: 'clamp(48px, 6vw, 72px)', lineHeight: '0.92', letterSpacing: '-0.01em', fontWeight: 100, marginBottom: '6px' }}>+500</div>
                <p style={{ fontFamily: 'var(--arcaffo-font-label)', fontSize: '10.5px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.6)', fontWeight: 500, textTransform: 'uppercase' }}>LÍDERES TREINADOS</p>
              </div>
              <div>
                <div className="stat-number" style={{ fontFamily: 'var(--arcaffo-font-display)', color: 'var(--accent-mint)', fontSize: 'clamp(48px, 6vw, 72px)', lineHeight: '0.92', letterSpacing: '-0.01em', fontWeight: 100, marginBottom: '6px' }}>98%</div>
                <p style={{ fontFamily: 'var(--arcaffo-font-label)', fontSize: '10.5px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.6)', fontWeight: 500, textTransform: 'uppercase' }}>SATISFAÇÃO (NPS)</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="glass" style={{ padding: '12px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)' }}>
              <img src="/_Assets/DSCF0236 1.jpg" alt="Arcaffo Experience" style={{ width: '100%', borderRadius: '16px', filter: 'grayscale(0.3)' }} />
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* Formatos de Atuação */}
      <Section id="solucoes" style={{ background: '#050505' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <FadeIn>
            <h2 className="section-title">Formatos de <em style={{ color: 'var(--accent-mint)', fontStyle: 'italic', fontWeight: 100, textTransform: 'uppercase', fontFamily: 'var(--arcaffo-font-display)' }}>Avanço</em></h2>
            <p style={{ fontFamily: 'var(--arcaffo-font-body)', color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(15px, 2.5vw, 17px)', maxWidth: '54ch', margin: '0 auto', lineHeight: '1.65' }}>Escolha como a inteligência Arcaffo deve entrar no seu negócio.</p>
          </FadeIn>
        </div>

        <div className="grid-2">
          <FadeIn delay={0.1}>
            <div className="glass" style={{
              padding: 'clamp(32px, 5vw, 60px)', height: '100%', display: 'flex', flexDirection: 'column',
              background: 'rgba(255,255,255,0.01)', borderRadius: '32px'
            }}>
              <Calendar size={32} color="var(--accent-mint)" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontFamily: 'var(--arcaffo-font-headline)', fontSize: 'clamp(24px, 3.5vw, 32px)', lineHeight: '1', letterSpacing: '-0.03em', textTransform: 'uppercase', fontWeight: 300, marginBottom: '20px' }}>Imersões Presenciais</h3>
              <p style={{ fontFamily: 'var(--arcaffo-font-body)', color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.65', marginBottom: '32px', flexGrow: 1 }}>
                Encontros intensivos em ambientes selecionados. Ideal para empresários e líderes que buscam profundidade estratégica, network de alto nível e uma pausa necessária para pensar o futuro do negócio.
              </p>
              <ul style={{ listStyle: 'none', marginBottom: '32px' }}>
                {['2 a 3 dias de imersão total', 'Metodologia proprietária Arcaffo', 'Network de alto nível', 'Plano de ação imediato'].map((li, i) => (
                  <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                    <Check size={14} color="var(--accent-mint)" /> {li}
                  </li>
                ))}
              </ul>
              <a href="#imersoes" className="btn-mint" style={{ padding: '14px', textAlign: 'center', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', color: '#000', fontSize: '13px' }}>Ver Próximas Datas</a>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="glass" style={{
              padding: 'clamp(32px, 5vw, 60px)', height: '100%', display: 'flex', flexDirection: 'column',
              background: 'rgba(255,255,255,0.01)', borderRadius: '32px'
            }}>
              <Building2 size={32} color="var(--accent-mint)" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontFamily: 'var(--arcaffo-font-headline)', fontSize: 'clamp(24px, 3.5vw, 32px)', lineHeight: '1', letterSpacing: '-0.03em', textTransform: 'uppercase', fontWeight: 300, marginBottom: '20px' }}>Treinamento In Company</h3>
              <p style={{ fontFamily: 'var(--arcaffo-font-body)', color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.65', marginBottom: '32px', flexGrow: 1 }}>
                Levamos a nossa metodologia para dentro da sua empresa. Customizamos o treinamento para os desafios específicos da sua equipe de marketing, branding e diretoria.
              </p>
              <ul style={{ listStyle: 'none', marginBottom: '32px' }}>
                {['Customizado para seu setor', 'Alinhamento tático com equipe', 'Workshops práticos', 'Foco em execução e autonomia'].map((li, i) => (
                  <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                    <Check size={14} color="var(--accent-mint)" /> {li}
                  </li>
                ))}
              </ul>
              <a href="#form" className="btn glass" style={{ padding: '14px', textAlign: 'center', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}>Solicitar Orçamento</a>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* Próximas Imersões */}
      <Section id="imersoes">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <FadeIn>
            <h2 className="section-title">Próximas <em style={{ color: 'var(--accent-mint)', fontStyle: 'italic', fontWeight: 100, textTransform: 'uppercase', fontFamily: 'var(--arcaffo-font-display)' }}>Imersões</em></h2>
            <p style={{ fontFamily: 'var(--arcaffo-font-body)', color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(15px, 2.5vw, 17px)', maxWidth: '54ch', margin: '0 auto', lineHeight: '1.65' }}>Garanta sua vaga nos próximos encontros presenciais.</p>
          </FadeIn>
        </div>
        <FadeIn delay={0.2}>
          <div className="container" style={{ padding: '0' }}>
            <ImmersionsTable />
          </div>
        </FadeIn>
      </Section>

      {/* Galeria */}
      <Section id="galeria" style={{ overflow: 'hidden', paddingBottom: '0' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <FadeIn>
            <h2 className="section-title">A <em style={{ fontStyle: 'italic', fontWeight: 100, textTransform: 'uppercase', fontFamily: 'var(--arcaffo-font-display)' }}>Experiência</em></h2>
          </FadeIn>
        </div>
        <FadeIn delay={0.2}>
          <div className="marquee-container">
            {[1, 2].map((group) => (
              <div key={group} className="marquee-content" aria-hidden={group === 2 ? "true" : "false"}>
                {[
                  { src: '/ENM-35_compressed.jpeg', alt: 'Fachada Arcaffo' },
                  { src: '/DSCF0014_compressed.jpeg', alt: 'Sala de Imersão' },
                  { src: '/table_compressed.jpeg', alt: 'Mesa de Imersão' },
                  { src: '/ENM-49_compressed.jpeg', alt: 'Ambiente' },
                  { src: '/IMG_2848_compressed.jpeg', alt: 'Detalhes' },
                  { src: '/ENM-20_compressed.jpeg', alt: 'Estratégia' },
                  { src: '/ENM-17_compressed.jpeg', alt: 'Networking' },
                ].map((img, i) => (
                  <div key={i} className="marquee-item">
                    <img src={img.src} alt={img.alt} loading="lazy" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </FadeIn>
      </Section>

      {/* Para Quem É / Comparativo */}
      <Section style={{ background: '#050505', paddingTop: '80px' }}>
        <div className="grid-2" style={{ gap: '60px' }}>
          <FadeIn>
            <div style={{ padding: '32px', borderLeft: '1px solid var(--accent-mint)' }}>
              <h3 style={{ fontFamily: 'var(--arcaffo-font-headline)', fontSize: 'clamp(20px, 3vw, 24px)', lineHeight: '1', letterSpacing: '-0.03em', textTransform: 'uppercase', fontWeight: 300, marginBottom: '32px' }}>Isso é para você se:</h3>
              <ul style={{ listStyle: 'none' }}>
                {[
                  "Você é o dono do negócio e sente que a marca perdeu a alma",
                  "Sua equipe de marketing não tem clareza estratégica",
                  "Você gasta muito com agências e tem pouco resultado real",
                  "Você quer que sua marca seja uma autoridade inquestionável"
                ].map((txt, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '20px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', fontSize: '14px' }}>
                    <ChevronRight size={16} color="var(--accent-mint)" style={{ marginTop: '2px' }} /> {txt}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ padding: '32px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontFamily: 'var(--arcaffo-font-headline)', fontSize: 'clamp(20px, 3vw, 24px)', lineHeight: '1', letterSpacing: '-0.03em', textTransform: 'uppercase', fontWeight: 300, marginBottom: '32px', color: 'rgba(255,255,255,0.4)' }}>Não é para você se:</h3>
              <ul style={{ listStyle: 'none' }}>
                {[
                  "Você busca hacks de tráfego pago ou fórmulas mágicas",
                  "Você não está disposto a mudar a cultura do seu negócio",
                  "Você prefere delegar a inteligência para terceiros",
                  "Você acredita que branding é apenas um logotipo bonito"
                ].map((txt, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '20px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5', fontSize: '14px' }}>
                    <X size={16} color="rgba(255,255,255,0.2)" style={{ marginTop: '2px' }} /> {txt}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* Form Section - Centered for Mobile focus */}
      <Section id="form">
        <div className="form-section-inner">
          <FadeIn>
            <h2 className="section-title">Dê o próximo passo</h2>
            <p className="section-subtitle form-section-subtitle">
              Seja para uma imersão presencial ou um treinamento para sua equipe, preencha os dados e nosso time entrará em contato.
            </p>
            <div className="glass form-panel" style={{ position: 'relative', overflow: 'hidden' }}>
              <div className="grain" style={{ position: 'absolute', inset: 0, opacity: 0.10, pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <ArcaffoForm />
              </div>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* Footer */}
      <footer style={{ position: 'relative', overflow: 'hidden', padding: '64px 0 32px', background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="grain" style={{ position: 'absolute', inset: 0, opacity: 0.10, pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <img src="/_Assets/Layer_1.svg" alt="Arcaffo" style={{ height: '20px', opacity: 0.3 }} />
            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', display: 'none' }} />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', fontWeight: 600 }}>ESCOLAS DE NEGÓCIOS & MARCAS</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>© 2026 Arcaffo Group. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
